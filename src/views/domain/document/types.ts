/**
 * @fileoverview 本地草稿与 JSON 文件共用的 V1 文档契约及结果类型；不依赖组件运行注册表。
 */
import { type WidgetFormData } from "@/views/types";
import { type HtmlSafetyResult } from "@/views/utils/html-safety";

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
 * @description 创建带可选定位路径的统一失败结果。
 * @param message 面向界面展示的错误原因。
 * @param path 发生错误的数据路径。
 * @returns 表单设计数据处理失败结果。
 */
export const createDesignerFormFailure = function (message: string, path?: string): DesignerFormFailure {
    return path ? { ok: false, message, path } : { ok: false, message };
};
