/**
 * @fileoverview 提供内置表单区块模板的严格查询、分类展示、实例化和候选结构校验。
 * @remarks 模板失败不应用普通 Widget 回退；所有候选在交给组件管理器前完成两层树、身份和注册状态校验。
 */
import { FORM_TEMPLATE_CATALOG } from "./catalog";
import { type FormBlockTemplateDefinition, type FormTemplateCategory, type FormTemplateGroup, type FormTemplateResult } from "./types";
import { ROW_CONTAINER_MAX_WIDGET_COUNT } from "@/views/domain/widgets/layout/row-container-layout";
import { type WidgetData, type WidgetNormalData } from "@/views/types";
import { getWidgetDefinition } from "@/views/domain/widgets/registry";
import { isRowContainerWidget } from "@/views/domain/widgets/tree";

/**
 * @description 模板分类的固定展示顺序和名称。
 * @remarks 分类顺序独立于工厂文件分组，目录拆分不会改变左侧模板库的分类体验。
 */
const FORM_TEMPLATE_CATEGORIES: ReadonlyArray<{
    /** 用于筛选模板目录的稳定分类码。 */
    code: FormTemplateCategory;
    /** 左侧模板库显示的分类名称。 */
    name: string;
}> = [
    { code: "labels", name: "标签排版" },
    { code: "layout", name: "栅格组合" },
    { code: "text", name: "文本输入" },
    { code: "selection", name: "选项选择" },
    { code: "datetime", name: "日期时间" },
    { code: "numeric", name: "数值评分" },
    { code: "display", name: "上传与展示" },
    { code: "interaction", name: "联动校验" },
    { code: "industry", name: "行业模块" },
    { code: "questionnaire", name: "问卷模板" }
];

/**
 * @description 按模板 ID 建立的严格查询缓存。
 * @remarks 仅缓存只读工厂定义，不能缓存 createWidgets 的结果；每次拖入都需要全新字段身份。
 */
const FORM_TEMPLATE_MAP = new Map<string, FormBlockTemplateDefinition>(FORM_TEMPLATE_CATALOG.map(item => [item.id, item]));

/**
 * @description 返回全部模板定义的只读浅拷贝。
 * @returns 保持注册顺序的新数组；模板定义约定只读。
 */
export const getFormTemplateList = function (): ReadonlyArray<FormBlockTemplateDefinition> {
    return [...FORM_TEMPLATE_CATALOG];
};

/**
 * @description 按固定配置能力分类组织模板列表。
 * @returns 十个分类及其注册顺序成员的新数组。
 */
export const getFormTemplateGroups = function (): ReadonlyArray<FormTemplateGroup> {
    return FORM_TEMPLATE_CATEGORIES.map(category => ({
        code: category.code,
        name: category.name,
        children: FORM_TEMPLATE_CATALOG.filter(item => item.category === category.code)
    }));
};

/**
 * @description 严格查询一个模板定义。
 * @param templateId 模板稳定 ID。
 * @returns 精确匹配的定义；未知 ID 返回 undefined。
 */
export const getFormTemplateDefinition = function (templateId: string): FormBlockTemplateDefinition | undefined {
    return FORM_TEMPLATE_MAP.get(templateId);
};

/**
 * @description 校验模板候选是否满足当前设计器固定两层树和身份规则。
 * @param widgets 待插入顶层画布的组件数组。
 * @returns 合法时返回原数组，失败时返回首个明确原因。
 * @remarks 验证不修改候选或当前表单，保证整个区块通过后才能原子应用；字段身份在根数据、设置数据和 FormItem 三处保持一致。
 */
export const validateFormTemplateWidgets = function (widgets: WidgetData[]): FormTemplateResult {
    if (!Array.isArray(widgets) || widgets.length === 0) return { ok: false, message: "表单模板不能为空" };
    // 记录整个候选树的节点身份，检测顶层与行内重复。
    const ids = new Set<string>();
    // 记录所有普通字段名，防止插入后字段模型相互覆盖。
    const propNames = new Set<string>();

    /**
     * @description 校验一个普通组件的注册状态和身份唯一性。
     * @param widget 当前普通组件。
     * @returns 校验失败原因；通过时返回 null。
     */
    const validateNormalWidget = function (widget: WidgetNormalData): string | null {
        if (!getWidgetDefinition(widget.code)) return `模板包含未知组件：${widget.code}`;
        if (!widget.id || ids.has(widget.id)) return `模板组件 id 重复或为空：${widget.id}`;
        ids.add(widget.id);
        if (widget.propName) {
            if (propNames.has(widget.propName)) return `模板字段名重复：${widget.propName}`;
            propNames.add(widget.propName);
            if (widget.settingData?.propName !== widget.propName || (widget.formAttributes && widget.formAttributes.prop !== widget.propName)) return `模板字段身份链不一致：${widget.id}`;
        }
        return null;
    };

    for (const widget of widgets) {
        if (!getWidgetDefinition(widget.code)) return { ok: false, message: `模板包含未知组件：${widget.code}` };
        if (!widget.id || ids.has(widget.id)) return { ok: false, message: `模板组件 id 重复或为空：${widget.id}` };
        if (isRowContainerWidget(widget)) {
            ids.add(widget.id);
            if (widget.widgets.length > ROW_CONTAINER_MAX_WIDGET_COUNT) return { ok: false, message: `模板行容器最多包含 ${ROW_CONTAINER_MAX_WIDGET_COUNT} 个组件` };
            if (widget.widgets.length !== widget.settingData.spans.length) return { ok: false, message: `模板行容器 spans 与组件数量不一致：${widget.id}` };
            for (const child of widget.widgets) {
                if (isRowContainerWidget(child)) return { ok: false, message: "模板行容器不能嵌套" };
                // 当前节点首个校验失败原因；返回前不会写入设计器。
                const failure = validateNormalWidget(child);
                if (failure) return { ok: false, message: failure };
            }
        } else {
            // 当前节点首个校验失败原因；返回前不会写入设计器。
            const failure = validateNormalWidget(widget);
            if (failure) return { ok: false, message: failure };
        }
    }
    return { ok: true, data: widgets };
};

/**
 * @description 按模板 ID 创建并校验一组全新顶层 widgets。
 * @param templateId 模板稳定 ID。
 * @returns 成功时返回完整候选，未知模板、工厂异常或结构非法时返回失败。
 * @remarks 此入口统一捕获工厂异常，调用方只处理可区分结果；失败时不返回部分创建的节点。
 */
export const createFormTemplateWidgets = function (templateId: string): FormTemplateResult {
    // 严格查询稳定 ID，未知模板不得退化为普通组件。
    const definition = FORM_TEMPLATE_MAP.get(templateId);
    if (!definition) return { ok: false, message: `未知表单模板：${templateId}` };
    try {
        return validateFormTemplateWidgets(definition.createWidgets());
    } catch (error) {
        return { ok: false, message: `表单模板创建失败：${error instanceof Error ? error.message : "未知错误"}` };
    }
};
