/**
 * @fileoverview 集中校验文档结构、节点身份、布局不变量及动态内容；只编译脚本而不执行用户代码。
 */
import { createDesignerFormFailure, type DesignerFormResult, type DesignerFormDynamicContent, type InspectHtmlFunction } from "./types";
import { type WidgetBaseData, type WidgetFormData, type WidgetRowContainerData } from "@/views/types";
import { ROW_CONTAINER_MAX_WIDGET_COUNT } from "@/views/domain/widgets/layout/row-container-layout";
import { WIDGET_FORM_CODE } from "@/views/domain/form/form-adapter";
import { WIDGET_HTML } from "@/views/domain/widgets/adapters/html";
import { WIDGET_ROW_CONTAINER } from "@/views/domain/widgets/adapters/row-container";

/**
 * @description 判断未知值是否为可读取字段的非数组对象。
 * @param value 待判断的未知值。
 * @returns 非 null 且非数组的对象返回 true。
 */
export const isRecord = function (value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
};

/**
 * @description 校验文档时间是否为无损往返的 ISO 8601 时间。
 * @param value 来自本地存储或外部 JSON 的未知时间值。
 * @returns 有效的 ISO 8601 时间返回 true。
 */
export const isIsoDateTime = function (value: unknown): value is string {
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
export const isWidgetRowContainerData = function (value: WidgetBaseData): value is WidgetRowContainerData {
    if (value.code !== WIDGET_ROW_CONTAINER.code || !("widgets" in value) || !Array.isArray(value.widgets) || !isRecord(value.settingData)) return false;
    // 行容器布局字段必须完整，避免恢复后在栅格计算时出现非法配置。
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
export const isWidgetFormData = function (value: unknown): value is WidgetFormData {
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
 * @description 将未知节点的公共持久化字段收窄为可操作的 Widget 数据。
 * @param widgetValue 来自 JSON 组件数组的未知节点。
 * @param path 节点在文档中的数据路径。
 * @returns 成功时返回具备公共字段的节点，失败时返回路径化错误。
 * @remarks 只在不可信输入边界进行字段检查；后续属性恢复使用明确的 WidgetBaseData 类型。
 */
export const validateWidgetBaseData = function (widgetValue: unknown, path: string): DesignerFormResult<WidgetBaseData> {
    if (!isRecord(widgetValue)) return createDesignerFormFailure("组件节点必须是对象", path);
    if (typeof widgetValue.id !== "string" || !widgetValue.id) return createDesignerFormFailure("组件 id 必须是非空字符串", `${path}.id`);
    if (typeof widgetValue.code !== "string" || !widgetValue.code) return createDesignerFormFailure("组件 code 必须是非空字符串", `${path}.code`);
    if (!isRecord(widgetValue.settingData)) return createDesignerFormFailure("组件 settingData 必须是对象", `${path}.settingData`);
    if (!isWidgetBaseData(widgetValue)) return createDesignerFormFailure("组件基础字段结构无效", path);
    return { ok: true, data: widgetValue };
};

/**
 * @description 只编译一个动态函数体以验证语法，不执行任何用户代码。
 * @param body componentFunctions 中的非空函数体。
 * @returns 语法合法时无返回值。
 * @throws {SyntaxError} 函数体无法作为异步函数编译时抛出。
 * @remarks 使用 AsyncFunction 同时接受普通和含 await 的异步函数体；该构造步骤不会调用生成的函数。
 */
const compileFunctionBody = function (body: string): void {
    // 只构造不调用，允许含 await 的函数体并保持导入阶段零脚本执行。
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
export const inspectWidgetDynamicContent = function (
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
        // 设置数据是 HTML 的持久化来源，不能信任运行属性中的缓存。
        const html = widgetData.settingData?.defaultValue;
        if (typeof html !== "string") return { ok: false, message: "HTML 内容必须是字符串", path: `${path}.settingData.defaultValue` };
        if (html) {
            // 白名单检查存在删改即拒绝，而非静默导入净化后内容。
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
export const validateDocumentTree = function (form: WidgetFormData): DesignerFormResult<never> | null {
    // 身份与业务名称分别去重，二者不能共用集合。
    const ids = new Set<string>();
    // 只验证参与表单提交的节点，不要求展示节点拥有业务字段。
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
        // 同一个字段在根节点、设置面板及 FormItem 中必须保持映射一致。
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
        // 设计器限定两层树，此处只验证直接子节点。
        const widgetData = form.widgets[index];
        const path = `$.form.widgets[${index}]`;
        const identityFailure = validateWidgetIdentity(widgetData, path);
        if (identityFailure) return identityFailure;
        if (widgetData.code !== WIDGET_ROW_CONTAINER.code) continue;
        // code 经基础恢复验证后才收窄成行容器，不接受任意嵌套。
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
