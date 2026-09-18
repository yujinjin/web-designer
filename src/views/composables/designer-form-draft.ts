/**
 * @fileoverview 管理设计器本地草稿的 JSON 投影、结构校验和 Widget 运行属性恢复。
 * @remarks 本模块保持纯数据边界，不访问 Storage Store、不展示 UI，也不修改当前设计器状态；具体组件属性始终由注册表构建器生成。
 */
import { type Mutable } from "/#/global.d";
import { buildWidgetComponentAttributes, getWidgetDefinition } from "@/views/composables/widget-registry";
import { type WidgetBaseData, type WidgetFormData, type WidgetRowContainerData } from "@/views/composables/types";
import { WIDGET_FORM_CODE } from "@/views/composables/widgets/form";
import { WIDGET_ROW_CONTAINER } from "@/views/composables/widgets/row-container";

/** 当前支持的本地草稿结构版本。 */
export const DESIGNER_FORM_DRAFT_SCHEMA_VERSION = 1 as const;

/**
 * @description 设计器单份本地草稿 envelope。
 */
export interface DesignerFormDraftV1 {
    /** 草稿结构版本；当前只接受 1。 */
    schemaVersion: typeof DESIGNER_FORM_DRAFT_SCHEMA_VERSION;
    /** 用户保存草稿时生成的 ISO 8601 时间。 */
    savedAt: string;
    /** 不包含 componentAttributes 的表单设计源。 */
    form: WidgetFormData;
}

/**
 * @description 草稿领域处理成功结果。
 */
export interface DraftSuccess<T> {
    /** 标识处理成功。 */
    ok: true;
    /** 已投影或恢复的数据。 */
    data: T;
}

/**
 * @description 草稿领域处理失败结果。
 */
export interface DraftFailure {
    /** 标识处理失败。 */
    ok: false;
    /** 面向界面展示的失败原因。 */
    message: string;
    /** 可选的 JSONPath 风格错误位置。 */
    path?: string;
}

/**
 * @description 草稿领域可区分结果。
 */
export type DraftResult<T> = DraftSuccess<T> | DraftFailure;

/**
 * @description 判断未知值是否为可读取字段的非数组对象。
 * @param value 待判断的未知值。
 * @returns 非 null 且非数组的对象返回 true。
 */
const isRecord = function (value: unknown): value is Record<string, any> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
};

/**
 * @description 创建带可选定位路径的草稿失败结果。
 * @param message 面向界面展示的错误原因。
 * @param path 发生错误的数据路径。
 * @returns 统一失败结果。
 */
const createDraftFailure = function (message: string, path?: string): DraftFailure {
    return path ? { ok: false, message, path } : { ok: false, message };
};

/**
 * @description 判断字符串是否为标准 ISO 8601 时间。
 * @param value 待校验的保存时间。
 * @returns 可以无损转换为 ISO 字符串时返回 true。
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
 * @description 从当前表单创建不含运行属性的独立草稿 envelope。
 * @param form 当前设计器响应式表单数据。
 * @param now 保存时间；测试可以传入固定时间，业务默认使用当前时间。
 * @returns 成功时返回可交给 Storage Store 的普通对象，序列化失败时返回错误。
 * @remarks componentAttributes 在 stringify 遍历阶段递归排除，源对象不会执行 delete 或其他写操作。
 */
export const createDesignerFormDraft = function (form: WidgetFormData, now = new Date()): DraftResult<DesignerFormDraftV1> {
    try {
        const text = JSON.stringify(
            {
                schemaVersion: DESIGNER_FORM_DRAFT_SCHEMA_VERSION,
                savedAt: now.toISOString(),
                form
            },
            (key, value) => (key === "componentAttributes" ? undefined : value)
        );
        return { ok: true, data: JSON.parse(text) as DesignerFormDraftV1 };
    } catch {
        return createDraftFailure("当前设计无法转换为本地草稿");
    }
};

/**
 * @description 校验并恢复单个普通 Widget 的运行属性。
 * @param widgetValue 待处理的未知普通节点值。
 * @param path 节点在草稿中的数据路径。
 * @returns 成功时返回完成运行属性恢复的节点，失败时返回路径化错误。
 */
const restoreNormalWidget = function (widgetValue: unknown, path: string): DraftResult<WidgetBaseData> {
    if (!isRecord(widgetValue)) {
        return createDraftFailure("组件节点必须是对象", path);
    }
    if (typeof widgetValue.id !== "string" || !widgetValue.id) {
        return createDraftFailure("组件 id 必须是非空字符串", `${path}.id`);
    }
    if (typeof widgetValue.code !== "string" || !widgetValue.code) {
        return createDraftFailure("组件 code 必须是非空字符串", `${path}.code`);
    }
    if (!isRecord(widgetValue.settingData)) {
        return createDraftFailure("组件 settingData 必须是对象", `${path}.settingData`);
    }
    const definition = getWidgetDefinition(widgetValue.code);
    if (!definition) {
        return createDraftFailure(`未知组件类型：${widgetValue.code}`, `${path}.code`);
    }
    if (widgetValue.code === WIDGET_ROW_CONTAINER.code) {
        return createDraftFailure("行容器不能嵌套在行容器中", path);
    }
    const widgetData = widgetValue as WidgetBaseData;
    try {
        if (definition.getAttributes) {
            (widgetData as Mutable<WidgetBaseData>).componentAttributes = buildWidgetComponentAttributes(widgetData);
        } else {
            delete (widgetData as Mutable<WidgetBaseData>).componentAttributes;
        }
        return { ok: true, data: widgetData };
    } catch {
        return createDraftFailure(`组件运行属性恢复失败：${widgetValue.code}`, path);
    }
};

/**
 * @description 校验并恢复一个顶层 Widget，行容器只处理一层普通子节点。
 * @param widgetValue 待处理的顶层节点对象。
 * @param path 节点在草稿中的数据路径。
 * @returns 成功时返回完成恢复的顶层节点，失败时返回首个路径化错误。
 */
const restoreTopWidget = function (widgetValue: unknown, path: string): DraftResult<WidgetBaseData> {
    if (!isRecord(widgetValue)) {
        return createDraftFailure("组件节点必须是对象", path);
    }
    if (widgetValue.code !== WIDGET_ROW_CONTAINER.code) {
        return restoreNormalWidget(widgetValue, path);
    }
    if (typeof widgetValue.id !== "string" || !widgetValue.id) {
        return createDraftFailure("行容器 id 必须是非空字符串", `${path}.id`);
    }
    if (!isRecord(widgetValue.settingData)) {
        return createDraftFailure("行容器 settingData 必须是对象", `${path}.settingData`);
    }
    if (!Array.isArray(widgetValue.widgets)) {
        return createDraftFailure("行容器 widgets 必须是数组", `${path}.widgets`);
    }
    if (!getWidgetDefinition(widgetValue.code)) {
        return createDraftFailure(`未知组件类型：${widgetValue.code}`, `${path}.code`);
    }
    for (let index = 0; index < widgetValue.widgets.length; index += 1) {
        const childResult = restoreNormalWidget(widgetValue.widgets[index], `${path}.widgets[${index}]`);
        if (!childResult.ok) return childResult;
    }
    delete widgetValue.componentAttributes;
    return { ok: true, data: widgetValue as WidgetRowContainerData };
};

/**
 * @description 从 Storage Store 读取值中解析并恢复可提交的设计器草稿。
 * @param value Storage Store 返回的未知业务值。
 * @returns 成功时返回独立且已恢复 componentAttributes 的 V1 草稿，失败时返回用户可理解的原因。
 * @remarks 所有校验和属性构建都在独立 JSON 副本上完成，调用方可以在成功后原子提交，不会污染存储对象或当前设计。
 */
export const restoreDesignerFormDraft = function (value: unknown): DraftResult<DesignerFormDraftV1> {
    let draftValue: unknown;
    try {
        const text = JSON.stringify(value, (key, item) => (key === "componentAttributes" ? undefined : item));
        if (!text) return createDraftFailure("本地草稿为空");
        draftValue = JSON.parse(text);
    } catch {
        return createDraftFailure("本地草稿不是有效的 JSON 数据");
    }
    if (!isRecord(draftValue)) return createDraftFailure("本地草稿必须是对象");
    if (draftValue.schemaVersion !== DESIGNER_FORM_DRAFT_SCHEMA_VERSION) {
        return createDraftFailure("本地草稿版本不受支持", "$.schemaVersion");
    }
    if (!isIsoDateTime(draftValue.savedAt)) {
        return createDraftFailure("本地草稿保存时间无效", "$.savedAt");
    }
    if (!isRecord(draftValue.form)) return createDraftFailure("本地草稿 form 必须是对象", "$.form");
    const formValue = draftValue.form;
    if (typeof formValue.id !== "string" || !formValue.id) return createDraftFailure("表单 id 必须是非空字符串", "$.form.id");
    if (formValue.code !== WIDGET_FORM_CODE) return createDraftFailure("表单 code 无效", "$.form.code");
    if (!isRecord(formValue.formAttributes)) return createDraftFailure("表单 formAttributes 必须是对象", "$.form.formAttributes");
    if (!isRecord(formValue.componentFunctions)) return createDraftFailure("表单 componentFunctions 必须是对象", "$.form.componentFunctions");
    if (!isRecord(formValue.settingData)) return createDraftFailure("表单 settingData 必须是对象", "$.form.settingData");
    if (!Array.isArray(formValue.widgets)) return createDraftFailure("表单 widgets 必须是数组", "$.form.widgets");
    for (let index = 0; index < formValue.widgets.length; index += 1) {
        const widgetResult = restoreTopWidget(formValue.widgets[index], `$.form.widgets[${index}]`);
        if (!widgetResult.ok) return widgetResult;
    }
    return { ok: true, data: draftValue as DesignerFormDraftV1 };
};
