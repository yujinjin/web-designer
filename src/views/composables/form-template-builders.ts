/**
 * @fileoverview 为内置表单模板提供类型无关的字段、行容器、展示节点和实例内联动构建能力。
 * @remarks 所有字段从当前 Widget 注册工厂创建，配置完成后重新物化 componentAttributes，避免模板维护第二套运行属性映射。
 */
import { type Mutable } from "/#/global.d";
import { calcAverageSpans } from "@/views/composables/row-container-layout";
import { type WidgetData, type WidgetNormalData, type WidgetRowContainerData } from "@/views/composables/types";
import { buildWidgetComponentAttributes, createWidgetDefaultData, getWidgetDefinition } from "@/views/composables/widget-registry";
import { WIDGET_ROW_CONTAINER } from "@/views/composables/widgets/row-container";

/** 模板普通字段可覆盖的通用配置。 */
export interface TemplateFieldOptions {
    /** 根级默认值；未提供时保留组件工厂默认值。 */
    defaultValue?: any;
    /** 是否参与必填校验。 */
    required?: boolean;
    /** 首次创建时是否隐藏。 */
    hidden?: boolean;
    /** 写入具体组件 settingData 的字段。 */
    settings?: Record<string, any>;
    /** 写入 componentFunctions 的运行函数体。 */
    functions?: Record<string, string | null>;
}

/**
 * @description 根据当前 Widget 工厂创建并配置一个模板普通字段。
 * @param code 已注册普通组件 code。
 * @param label 模板中的表单标签；不会覆盖组件类型名称 name。
 * @param options 默认值、校验、显隐和组件专属设置。
 * @returns 完成运行属性物化的新普通组件。
 * @throws {Error} code 未注册、指向行容器或属性物化失败时抛出。
 */
export const createTemplateField = function (code: string, label: string, options: TemplateFieldOptions = {}): WidgetNormalData {
    const widgetData = createWidgetDefaultData(code);
    if (widgetData.code === WIDGET_ROW_CONTAINER.code || !getWidgetDefinition(code)) {
        throw new Error(`模板字段类型无效：${code}`);
    }
    const mutableWidget = widgetData as Mutable<WidgetNormalData>;
    if (mutableWidget.formAttributes) {
        mutableWidget.formAttributes.label = label;
        mutableWidget.formAttributes.required = options.required ?? false;
        mutableWidget.formAttributes.size = "small";
    }
    if (mutableWidget.settingData) {
        if ("label" in mutableWidget.settingData) mutableWidget.settingData.label = label;
        if ("required" in mutableWidget.settingData) mutableWidget.settingData.required = options.required ?? false;
        Object.assign(mutableWidget.settingData, options.settings);
        // 标签位置属于表单项，不由 useAttributes 物化；两处同步才能让导入恢复和设置面板保持一致。
        if (mutableWidget.formAttributes && "labelPosition" in mutableWidget.settingData) {
            mutableWidget.formAttributes.labelPosition = mutableWidget.settingData.labelPosition;
        }
        if (code === "cascader" && "optionsText" in mutableWidget.settingData && options.settings?.options) {
            // 设置面板编辑的是 JSON 文本，运行态使用树；模板覆盖选项时必须更新两种表示。
            mutableWidget.settingData.optionsText = JSON.stringify(options.settings.options, null, 4);
        }
    }
    if (Object.prototype.hasOwnProperty.call(options, "defaultValue")) {
        mutableWidget.defaultValue = options.defaultValue;
        if (mutableWidget.settingData && "defaultValue" in mutableWidget.settingData) mutableWidget.settingData.defaultValue = options.defaultValue;
    }
    if (options.hidden) {
        mutableWidget.isShow = false;
        if (Array.isArray(mutableWidget.settingData?.control)) {
            // hidden 是模板的初始设计状态；保留禁用/只读等控制项，仅补入隐藏标记。
            if (!mutableWidget.settingData.control.includes("isHidden")) mutableWidget.settingData.control.push("isHidden");
        }
    }
    if (mutableWidget.componentFunctions && options.functions) {
        Object.assign(mutableWidget.componentFunctions, options.functions);
        // 配置面板保存完整源码，运行态保存函数体，模板创建时也保持这份可编辑契约。
        if (mutableWidget.settingData && "onValidate" in mutableWidget.settingData && options.functions.validate) {
            mutableWidget.settingData.onValidate = `function onValidate(value, callback, formData, widgetFormData) {\n${options.functions.validate}\n}`;
        }
    }
    if (getWidgetDefinition(code)?.getAttributes) mutableWidget.componentAttributes = buildWidgetComponentAttributes(mutableWidget);
    return mutableWidget;
};

/**
 * @description 创建一个包含普通组件的模板行容器。
 * @param name 行容器在设置面板中的名称。
 * @param widgets 当前行内的普通组件，最多 6 个。
 * @param spans 与组件索引对应的 24 栅格宽度；缺省时自动均分。
 * @param gutter 列间距像素值。
 * @returns 配置完成的新行容器。
 */
export const createTemplateRow = function (name: string, widgets: WidgetNormalData[], spans = calcAverageSpans(widgets.length), gutter = 16): WidgetRowContainerData {
    if (widgets.length === 0 || widgets.length > 6) throw new Error(`模板行容器字段数量无效：${widgets.length}`);
    const row = createWidgetDefaultData(WIDGET_ROW_CONTAINER.code) as WidgetRowContainerData;
    (row as Mutable<WidgetRowContainerData>).name = name;
    row.settingData.name = name;
    row.settingData.gutter = gutter;
    row.settingData.enableSpanConfig = true;
    row.settingData.spans = [...spans];
    row.widgets.splice(0, row.widgets.length, ...widgets);
    return row;
};

/**
 * @description 创建模板区块标题分隔线。
 * @param title 区块标题。
 * @returns 可直接插入顶层 widgets 的分隔线组件。
 */
export const createTemplateDivider = function (title: string): WidgetNormalData {
    return createTemplateField("divider", title, { defaultValue: title, settings: { defaultValue: title, contentPosition: "left" } });
};

/**
 * @description 同步模板字段 change 脚本的运行函数体与设置面板源码。
 * @param controller 支持 change 事件的模板组件。
 * @param body 以 value、formData、widgetFormData 为上下文的函数体。
 * @returns 无返回值；更新当前模板实例的脚本配置。
 * @throws {Error} 组件未声明 change 协议时抛出，防止写入无效脚本字段。
 */
export const setTemplateChangeHandler = function (controller: WidgetNormalData, body: string): void {
    if (!controller.componentFunctions || !("change" in controller.componentFunctions) || !controller.settingData || !("onChange" in controller.settingData)) {
        throw new Error(`组件不支持 change 联动：${controller.code}`);
    }
    controller.componentFunctions.change = body;
    controller.settingData.onChange = `function onChange(value, formData, widgetFormData) {\n${body}\n}`;
};

/**
 * @description 为控制字段设置当前模板实例内的显隐联动脚本。
 * @param controller 触发 change 事件的普通组件。
 * @param targetWidgets 被控制显隐的组件列表。
 * @param visibleValue 目标组件应显示时的控制值。
 * @returns 无返回值；函数体仅写入当前控制组件。
 */
export const bindTemplateVisibility = function (controller: WidgetNormalData, targetWidgets: WidgetNormalData[], visibleValue: string | number | boolean): void {
    const targetIds = JSON.stringify(targetWidgets.map(item => item.id));
    const expectedValue = JSON.stringify(visibleValue);
    setTemplateChangeHandler(
        controller,
        `
const targetIds = ${targetIds};
for (const item of widgetFormData.widgets) {
    const children = Array.isArray(item.widgets) ? item.widgets : [item];
    for (const child of children) {
        if (targetIds.includes(child.id)) child.isShow = value === ${expectedValue};
    }
}`
    );
};

/**
 * @description 收集模板顶层和行容器中的全部普通组件。
 * @param widgets 模板顶层组件列表。
 * @returns 保持模板顺序的一层展开数组。
 */
export const flattenTemplateWidgets = function (widgets: WidgetData[]): WidgetNormalData[] {
    return widgets.flatMap(item => ("widgets" in item && Array.isArray(item.widgets) ? item.widgets : [item as WidgetNormalData]));
};
