/**
 * @fileoverview 定义内置表单区块模板的分类、元数据、工厂和创建结果协议。
 */
import { type WidgetData } from "@/views/types";

/** 配置示例分类及作为补充的行业、问卷分类。 */
export type FormTemplateCategory = "labels" | "layout" | "text" | "selection" | "datetime" | "numeric" | "display" | "interaction" | "industry" | "questionnaire";

/** 内置表单区块模板定义。 */
export interface FormBlockTemplateDefinition {
    /** 模板注册表中的稳定唯一标识。 */
    id: string;
    /** 展示在图片卡片上的模板名称。 */
    name: string;
    /** 帮助用户识别区块用途的简短说明。 */
    description: string;
    /** 模板所属配置能力分类。 */
    category: FormTemplateCategory;
    /** 对应区块真实效果的本地 PNG 地址。 */
    previewImage: string;
    /** 720px 基准宽度下按区块实际内容生成的图片高度。 */
    previewHeight: number;
    /** 图片无法显示时使用的替代文本。 */
    previewAlt: string;
    /** 每次调用都创建全新顶层 widgets 的工厂。 */
    createWidgets: () => WidgetData[];
}

/** 模板列表中的分类及成员。 */
export interface FormTemplateGroup {
    /** 分类稳定标识。 */
    code: FormTemplateCategory;
    /** 分类展示名称。 */
    name: string;
    /** 按注册顺序排列的模板定义。 */
    children: ReadonlyArray<FormBlockTemplateDefinition>;
}

/** 模板创建成功结果。 */
export interface FormTemplateSuccess {
    /** 标识创建成功。 */
    ok: true;
    /** 可以一次性插入顶层画布的新 widgets。 */
    data: WidgetData[];
}

/** 模板创建失败结果。 */
export interface FormTemplateFailure {
    /** 标识创建失败。 */
    ok: false;
    /** 面向设计器界面展示的失败原因。 */
    message: string;
}

/** 模板创建和校验使用的可区分结果。 */
export type FormTemplateResult = FormTemplateSuccess | FormTemplateFailure;
