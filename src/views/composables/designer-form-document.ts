/**
 * @fileoverview 管理本地保存和文件交换共用的表单文档投影、恢复以及外部导入安全检查。
 * @remarks 基础恢复只校验持久化结构并重建运行属性，外部导入才额外执行字段唯一性、脚本语法和 HTML 安全门禁。
 */
import { type Mutable } from "/#/global.d";
import { inspectHtmlSafety, type HtmlSafetyResult } from "@/views/composables/html-safety";
import { ROW_CONTAINER_MAX_WIDGET_COUNT } from "@/views/composables/row-container-layout";
import { type WidgetBaseData, type WidgetFormData, type WidgetRowContainerData } from "@/views/composables/types";
import { buildWidgetComponentAttributes, getWidgetDefinition } from "@/views/composables/widget-registry";
import { WIDGET_FORM_CODE } from "@/views/composables/widgets/form";
import { WIDGET_HTML } from "@/views/composables/widgets/html";
import { WIDGET_ROW_CONTAINER } from "@/views/composables/widgets/row-container";

/** 当前支持的表单文档版本。 */
export const DESIGNER_FORM_DOCUMENT_SCHEMA_VERSION = 1 as const;

/** 本地保存和文件交换共用的 V1 表单设计文档。 */
export interface DesignerFormDocumentV1 {
    /** 文档结构版本。 */
    schemaVersion: typeof DESIGNER_FORM_DOCUMENT_SCHEMA_VERSION;
    /** 本次保存或导出生成的 ISO 8601 时间；旧版文档可能缺失。 */
    savedAt?: string;
    /** 不包含 componentAttributes 的表单设计源。 */
    form: WidgetFormData;
}

/** 表单设计数据处理成功结果。 */
export interface DesignerFormSuccess<T> {
    /** 标识处理成功。 */
    ok: true;
    /** 已投影或恢复的数据。 */
    data: T;
}

/** 表单设计数据处理失败结果。 */
export interface DesignerFormFailure {
    /** 标识处理失败。 */
    ok: false;
    /** 面向界面展示的失败原因。 */
    message: string;
    /** 可选的 JSONPath 风格错误位置。 */
    path?: string;
}

/** 表单设计数据处理使用的可区分结果。 */
export type DesignerFormResult<T> = DesignerFormSuccess<T> | DesignerFormFailure;

/** 导入候选包含的动态内容标记。 */
export interface DesignerFormDynamicContent {
    /** 是否包含至少一个已启用的动态脚本函数体。 */
    hasDynamicScripts: boolean;
    /** 是否包含至少一个非空 HTML Widget。 */
    hasHtml: boolean;
}

/** 成功解析并恢复后的导入候选。 */
export interface ParsedDesignerFormDocument {
    /** 已恢复运行属性的独立文档。 */
    document: DesignerFormDocumentV1;
    /** 用于决定是否展示风险确认的动态内容信息。 */
    dynamicContent: DesignerFormDynamicContent;
}

/** HTML 检查函数协议，允许 Node 测试注入无 DOM 实现。 */
export type InspectHtmlFunction = (html: string) => HtmlSafetyResult;

/**
 * @description 判断未知值是否为可读取字段的非数组对象。
 * @param value 待判断的未知值。
 * @returns 非 null 且非数组的对象返回 true。
 */
const isRecord = function (value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
};

/**
 * @description 校验文档时间是否为无损往返的 ISO 8601 时间。
 * @param value 来自本地存储或外部 JSON 的未知时间值。
 * @returns 有效的 ISO 8601 时间返回 true。
 */
const isIsoDateTime = function (value: unknown): value is string {
    if (typeof value !== "string") return false;
    try {
        return new Date(value).toISOString() === value;
    } catch {
        return false;
    }
};

/**
 * @description 判断未知值是否具备所有 Widget 共享的持久化字段。
 * @param value 待校验的组件节点。
 * @returns 公共身份、显示、默认值和可选对象字段满足 WidgetBaseData 契约时返回 true。
 * @remarks 该守卫用于把运行时校验结果同步给 TypeScript，避免通过双重类型断言掩盖不完整的输入结构。
 */
const isWidgetBaseData = function (value: unknown): value is WidgetBaseData {
    if (!isRecord(value)) return false;
    return (
        typeof value.id === "string" &&
        value.id.length > 0 &&
        typeof value.code === "string" &&
        value.code.length > 0 &&
        typeof value.name === "string" &&
        typeof value.isShow === "boolean" &&
        "defaultValue" in value &&
        (value.propName === null || typeof value.propName === "string") &&
        (value.formAttributes === undefined || isRecord(value.formAttributes)) &&
        (value.componentAttributes === undefined || isRecord(value.componentAttributes)) &&
        (value.componentFunctions === undefined || isRecord(value.componentFunctions)) &&
        (value.settingData === undefined || isRecord(value.settingData))
    );
};

/**
 * @description 判断已通过公共字段校验的节点是否具备行容器结构。
 * @param value 已校验公共字段的组件节点。
 * @returns code、子节点数组和行布局设置满足 WidgetRowContainerData 契约时返回 true。
 */
const isWidgetRowContainerData = function (value: WidgetBaseData): value is WidgetRowContainerData {
    if (value.code !== WIDGET_ROW_CONTAINER.code || !("widgets" in value) || !Array.isArray(value.widgets) || !isRecord(value.settingData)) return false;
    const settingData = value.settingData;
    return (
        typeof settingData.name === "string" &&
        typeof settingData.gutter === "number" &&
        ["start", "end", "center", "space-around", "space-between", "space-evenly"].includes(settingData.justify as string) &&
        ["top", "middle", "bottom"].includes(settingData.align as string) &&
        typeof settingData.enableSpanConfig === "boolean" &&
        Array.isArray(settingData.spans) &&
        settingData.spans.every(span => typeof span === "number")
    );
};

/**
 * @description 判断未知值是否为结构完整的表单根数据。
 * @param value 待校验的表单数据。
 * @returns 表单身份、运行配置、设置数据和组件数组满足 WidgetFormData 契约时返回 true。
 */
const isWidgetFormData = function (value: unknown): value is WidgetFormData {
    if (!isRecord(value) || !isRecord(value.formAttributes) || !isRecord(value.componentFunctions) || !isRecord(value.settingData) || !Array.isArray(value.widgets)) return false;
    return (
        typeof value.id === "string" &&
        value.id.length > 0 &&
        value.code === WIDGET_FORM_CODE &&
        (value.componentFunctions.init === null || typeof value.componentFunctions.init === "string") &&
        typeof value.settingData.inline === "boolean" &&
        ["left", "top", "right"].includes(value.settingData.labelPosition as string) &&
        (value.settingData.labelWidth === null || typeof value.settingData.labelWidth === "string" || typeof value.settingData.labelWidth === "number") &&
        typeof value.settingData.onInit === "string"
    );
};

/**
 * @description 创建带可选定位路径的统一失败结果。
 * @param message 面向界面展示的错误原因。
 * @param path 发生错误的数据路径。
 * @returns 表单设计数据处理失败结果。
 */
const createDesignerFormFailure = function (message: string, path?: string): DesignerFormFailure {
    return path ? { ok: false, message, path } : { ok: false, message };
};

/**
 * @description 从当前设计创建带保存时间且不含运行属性的独立 JSON 文档。
 * @param form 当前表单设计数据。
 * @param now 本次保存或导出时间；业务默认使用当前时间。
 * @returns 成功时返回同一种可持久化文档，序列化或时间转换失败时返回错误。
 * @remarks componentAttributes 在 stringify 遍历阶段递归排除，源对象不会执行 delete 或其他写操作。
 */
export const createDesignerFormDocument = function (form: WidgetFormData, now = new Date()): DesignerFormResult<DesignerFormDocumentV1> {
    try {
        const text = JSON.stringify(
            {
                schemaVersion: DESIGNER_FORM_DOCUMENT_SCHEMA_VERSION,
                savedAt: now.toISOString(),
                form
            },
            (key, value) => (key === "componentAttributes" ? undefined : value)
        );
        return { ok: true, data: JSON.parse(text) as DesignerFormDocumentV1 };
    } catch {
        return createDesignerFormFailure("当前设计无法转换为 JSON 数据");
    }
};

/**
 * @description 将未知节点的公共持久化字段收窄为可操作的 Widget 数据。
 * @param widgetValue 来自 JSON 组件数组的未知节点。
 * @param path 节点在文档中的数据路径。
 * @returns 成功时返回具备公共字段的节点，失败时返回路径化错误。
 * @remarks 只在不可信输入边界进行字段检查；后续属性恢复使用明确的 WidgetBaseData 类型。
 */
const validateWidgetBaseData = function (widgetValue: unknown, path: string): DesignerFormResult<WidgetBaseData> {
    if (!isRecord(widgetValue)) return createDesignerFormFailure("组件节点必须是对象", path);
    if (typeof widgetValue.id !== "string" || !widgetValue.id) return createDesignerFormFailure("组件 id 必须是非空字符串", `${path}.id`);
    if (typeof widgetValue.code !== "string" || !widgetValue.code) return createDesignerFormFailure("组件 code 必须是非空字符串", `${path}.code`);
    if (!isRecord(widgetValue.settingData)) return createDesignerFormFailure("组件 settingData 必须是对象", `${path}.settingData`);
    if (!isWidgetBaseData(widgetValue)) return createDesignerFormFailure("组件基础字段结构无效", path);
    return { ok: true, data: widgetValue };
};

/**
 * @description 为已校验公共字段的普通 Widget 恢复运行属性。
 * @param widgetData 已通过基础校验的组件节点。
 * @param path 节点在文档中的数据路径。
 * @returns 成功时返回已恢复 componentAttributes 的节点，失败时返回路径化错误。
 * @remarks 行容器只允许出现在顶层；运行属性始终从注册表构建，持久化数据中同名字段不会被信任。
 */
const restoreNormalWidget = function (widgetData: WidgetBaseData, path: string): DesignerFormResult<WidgetBaseData> {
    const definition = getWidgetDefinition(widgetData.code);
    if (!definition) return createDesignerFormFailure(`未知组件类型：${widgetData.code}`, `${path}.code`);
    if (widgetData.code === WIDGET_ROW_CONTAINER.code) return createDesignerFormFailure("行容器不能嵌套在行容器中", path);
    try {
        if (definition.getAttributes) {
            (widgetData as Mutable<WidgetBaseData>).componentAttributes = buildWidgetComponentAttributes(widgetData);
        } else {
            delete (widgetData as Mutable<WidgetBaseData>).componentAttributes;
        }
        return { ok: true, data: widgetData };
    } catch {
        return createDesignerFormFailure(`组件运行属性恢复失败：${widgetData.code}`, path);
    }
};

/**
 * @description 校验并恢复顶层 Widget，行容器仅恢复一层普通子节点。
 * @param widgetValue 待恢复的顶层节点。
 * @param path 节点在文档中的数据路径。
 * @returns 成功时返回已恢复的顶层节点，失败时返回首个路径化错误。
 */
const restoreTopWidget = function (widgetValue: unknown, path: string): DesignerFormResult<WidgetBaseData> {
    if (!isRecord(widgetValue)) return createDesignerFormFailure("组件节点必须是对象", path);
    if (widgetValue.code !== WIDGET_ROW_CONTAINER.code) {
        const validated = validateWidgetBaseData(widgetValue, path);
        return validated.ok ? restoreNormalWidget(validated.data, path) : validated;
    }
    if (typeof widgetValue.id !== "string" || !widgetValue.id) return createDesignerFormFailure("行容器 id 必须是非空字符串", `${path}.id`);
    if (!isRecord(widgetValue.settingData)) return createDesignerFormFailure("行容器 settingData 必须是对象", `${path}.settingData`);
    if (!Array.isArray(widgetValue.widgets)) return createDesignerFormFailure("行容器 widgets 必须是数组", `${path}.widgets`);
    const validated = validateWidgetBaseData(widgetValue, path);
    if (!validated.ok) return validated;
    if (!isWidgetRowContainerData(validated.data)) return createDesignerFormFailure("行容器基础字段或布局设置无效", path);
    if (!getWidgetDefinition(WIDGET_ROW_CONTAINER.code)) return createDesignerFormFailure(`未知组件类型：${WIDGET_ROW_CONTAINER.code}`, `${path}.code`);
    const row = validated.data;
    for (let index = 0; index < row.widgets.length; index += 1) {
        const childPath = `${path}.widgets[${index}]`;
        const child = validateWidgetBaseData(row.widgets[index], childPath);
        if (!child.ok) return child;
        const childResult = restoreNormalWidget(child.data, childPath);
        if (!childResult.ok) return childResult;
    }
    delete (row as Mutable<WidgetRowContainerData>).componentAttributes;
    return { ok: true, data: row };
};

/**
 * @description 从未知 JSON 兼容值中恢复独立的表单设计文档。
 * @param value 文档对象或由其他持久化封装提供的文档候选。
 * @returns 成功时返回已完成基础校验和 componentAttributes 重建的 V1 文档，失败时返回具体路径。
 * @remarks 恢复过程先生成不含运行属性的 JSON 副本，再在副本上校验和构建属性，调用方可以原子提交结果且不会污染输入对象。
 */
export const restoreDesignerFormDocument = function (value: unknown): DesignerFormResult<DesignerFormDocumentV1> {
    let documentValue: unknown;
    try {
        const text = JSON.stringify(value, (key, item) => (key === "componentAttributes" ? undefined : item));
        if (!text) return createDesignerFormFailure("表单设计文档为空");
        documentValue = JSON.parse(text);
    } catch {
        return createDesignerFormFailure("表单设计文档不是有效的 JSON 数据");
    }
    if (!isRecord(documentValue)) return createDesignerFormFailure("表单设计文档必须是对象");
    if (documentValue.schemaVersion !== DESIGNER_FORM_DOCUMENT_SCHEMA_VERSION) {
        return createDesignerFormFailure("表单设计文档版本不受支持", "$.schemaVersion");
    }
    if (documentValue.savedAt !== undefined && !isIsoDateTime(documentValue.savedAt)) {
        return createDesignerFormFailure("表单文档保存时间无效", "$.savedAt");
    }
    if (!isRecord(documentValue.form)) return createDesignerFormFailure("表单设计文档 form 必须是对象", "$.form");
    const formValue = documentValue.form;
    if (typeof formValue.id !== "string" || !formValue.id) return createDesignerFormFailure("表单 id 必须是非空字符串", "$.form.id");
    if (formValue.code !== WIDGET_FORM_CODE) return createDesignerFormFailure("表单 code 无效", "$.form.code");
    if (!isRecord(formValue.formAttributes)) return createDesignerFormFailure("表单 formAttributes 必须是对象", "$.form.formAttributes");
    if (!isRecord(formValue.componentFunctions)) return createDesignerFormFailure("表单 componentFunctions 必须是对象", "$.form.componentFunctions");
    if (!isRecord(formValue.settingData)) return createDesignerFormFailure("表单 settingData 必须是对象", "$.form.settingData");
    if (!Array.isArray(formValue.widgets)) return createDesignerFormFailure("表单 widgets 必须是数组", "$.form.widgets");
    if (!isWidgetFormData(formValue)) return createDesignerFormFailure("表单根字段结构无效", "$.form");
    for (let index = 0; index < formValue.widgets.length; index += 1) {
        const widgetResult = restoreTopWidget(formValue.widgets[index], `$.form.widgets[${index}]`);
        if (!widgetResult.ok) return widgetResult;
    }
    return {
        ok: true,
        data: {
            schemaVersion: DESIGNER_FORM_DOCUMENT_SCHEMA_VERSION,
            ...(documentValue.savedAt === undefined ? {} : { savedAt: documentValue.savedAt }),
            form: formValue
        }
    };
};

/**
 * @description 只编译一个动态函数体以验证语法，不执行任何用户代码。
 * @param body componentFunctions 中的非空函数体。
 * @returns 语法合法时无返回值。
 * @throws {SyntaxError} 函数体无法作为异步函数编译时抛出。
 * @remarks 使用 AsyncFunction 同时接受普通和含 await 的异步函数体；该构造步骤不会调用生成的函数。
 */
const compileFunctionBody = function (body: string): void {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (...args: string[]) => (...params: any[]) => Promise<any>;
    new AsyncFunction(body);
};

/**
 * @description 检查单个普通 Widget 的动态脚本和 HTML 内容。
 * @param widgetData 已完成结构恢复的普通 Widget。
 * @param path 节点在文档中的路径。
 * @param dynamicContent 汇总动态内容的可变结果。
 * @param inspectHtml HTML 白名单检查函数。
 * @returns 检查通过返回 null，失败返回路径化文档结果。
 */
const inspectWidgetDynamicContent = function (
    widgetData: WidgetBaseData,
    path: string,
    dynamicContent: DesignerFormDynamicContent,
    inspectHtml: InspectHtmlFunction
): DesignerFormResult<never> | null {
    if (widgetData.componentFunctions) {
        for (const [fieldName, body] of Object.entries(widgetData.componentFunctions)) {
            if (body === null || body === undefined || body === "") continue;
            if (typeof body !== "string") return { ok: false, message: "动态脚本函数体必须是字符串", path: `${path}.componentFunctions.${fieldName}` };
            try {
                compileFunctionBody(body);
                dynamicContent.hasDynamicScripts = true;
            } catch {
                return { ok: false, message: `动态脚本语法错误：${fieldName}`, path: `${path}.componentFunctions.${fieldName}` };
            }
        }
    }
    if (widgetData.code === WIDGET_HTML.code) {
        const html = widgetData.settingData?.defaultValue;
        if (typeof html !== "string") return { ok: false, message: "HTML 内容必须是字符串", path: `${path}.settingData.defaultValue` };
        if (html) {
            const htmlResult = inspectHtml(html);
            if (!htmlResult.ok) return { ok: false, message: htmlResult.message, path: `${path}.settingData.defaultValue` };
            dynamicContent.hasHtml = true;
        }
    }
    return null;
};

/**
 * @description 校验外部文档组件树的身份、业务字段和行容器布局不变量。
 * @param form 已完成基础结构恢复的表单候选。
 * @returns 校验通过返回 null，失败返回首个路径化错误。
 * @remarks 这些约束用于阻止外部文件覆盖设计器身份映射；应用自身保存的草稿不重复执行导入门禁。
 */
const validateDocumentTree = function (form: WidgetFormData): DesignerFormResult<never> | null {
    const ids = new Set<string>();
    const propNames = new Set<string>();

    /**
     * @description 校验单个节点的全局 ID 和普通表单字段映射。
     * @param widgetData 当前节点。
     * @param path 当前节点路径。
     * @returns 校验通过返回 null，否则返回路径化错误。
     */
    const validateWidgetIdentity = function (widgetData: WidgetBaseData, path: string): DesignerFormResult<never> | null {
        if (ids.has(widgetData.id)) return { ok: false, message: `组件 id 重复：${widgetData.id}`, path: `${path}.id` };
        ids.add(widgetData.id);
        if (!widgetData.formAttributes) return null;
        const propName = widgetData.propName;
        if (typeof propName !== "string" || !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(propName)) {
            return { ok: false, message: "组件 propName 格式无效", path: `${path}.propName` };
        }
        if (widgetData.settingData?.propName !== propName || widgetData.formAttributes.prop !== propName) {
            return { ok: false, message: "组件字段名称映射不一致", path };
        }
        if (propNames.has(propName)) return { ok: false, message: `组件 propName 重复：${propName}`, path: `${path}.propName` };
        propNames.add(propName);
        return null;
    };

    for (let index = 0; index < form.widgets.length; index += 1) {
        const widgetData = form.widgets[index];
        const path = `$.form.widgets[${index}]`;
        const identityFailure = validateWidgetIdentity(widgetData, path);
        if (identityFailure) return identityFailure;
        if (widgetData.code !== WIDGET_ROW_CONTAINER.code) continue;
        const row = widgetData as WidgetRowContainerData;
        if (row.widgets.length > ROW_CONTAINER_MAX_WIDGET_COUNT) {
            return { ok: false, message: `行容器最多包含 ${ROW_CONTAINER_MAX_WIDGET_COUNT} 个组件`, path: `${path}.widgets` };
        }
        if (row.settingData.enableSpanConfig) {
            if (!Array.isArray(row.settingData.spans) || row.settingData.spans.length !== row.widgets.length) {
                return { ok: false, message: "行容器 spans 数量必须与子组件一致", path: `${path}.settingData.spans` };
            }
            const invalidSpanIndex = row.settingData.spans.findIndex(span => !Number.isInteger(span) || span < 1 || span > 24);
            if (invalidSpanIndex !== -1) {
                return { ok: false, message: "行容器 span 必须是 1 至 24 的整数", path: `${path}.settingData.spans[${invalidSpanIndex}]` };
            }
        }
        for (let childIndex = 0; childIndex < row.widgets.length; childIndex += 1) {
            const childFailure = validateWidgetIdentity(row.widgets[childIndex], `${path}.widgets[${childIndex}]`);
            if (childFailure) return childFailure;
        }
    }
    return null;
};

/**
 * @description 解析外部 JSON 文本、恢复运行属性并执行导入专属安全门禁。
 * @param text 用户选择文件的 UTF-8 文本。
 * @param inspectHtml HTML 安全检查函数；业务默认使用 DOMPurify 实现。
 * @returns 成功时返回可原子提交的文档和风险标记，失败时返回具体路径。
 */
export const parseDesignerFormDocumentText = function (text: string, inspectHtml: InspectHtmlFunction = inspectHtmlSafety): DesignerFormResult<ParsedDesignerFormDocument> {
    let value: unknown;
    try {
        value = JSON.parse(text);
    } catch {
        return { ok: false, message: "JSON 文件格式错误" };
    }
    const restored = restoreDesignerFormDocument(value);
    if (!restored.ok) return restored;
    const document = restored.data;
    const treeFailure = validateDocumentTree(document.form);
    if (treeFailure) return treeFailure;
    const dynamicContent: DesignerFormDynamicContent = { hasDynamicScripts: false, hasHtml: false };
    for (let index = 0; index < document.form.widgets.length; index += 1) {
        const widgetData = document.form.widgets[index];
        const path = `$.form.widgets[${index}]`;
        if (widgetData.code === WIDGET_ROW_CONTAINER.code) {
            const row = widgetData as WidgetRowContainerData;
            for (let childIndex = 0; childIndex < row.widgets.length; childIndex += 1) {
                const failure = inspectWidgetDynamicContent(row.widgets[childIndex], `${path}.widgets[${childIndex}]`, dynamicContent, inspectHtml);
                if (failure) return failure;
            }
        } else {
            const failure = inspectWidgetDynamicContent(widgetData, path, dynamicContent, inspectHtml);
            if (failure) return failure;
        }
    }
    return { ok: true, data: { document, dynamicContent } };
};
