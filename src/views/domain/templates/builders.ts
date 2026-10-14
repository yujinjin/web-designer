/**
 * @fileoverview 为内置表单模板提供类型无关的字段、行容器、展示节点和实例内联动构建能力。
 * @remarks 所有字段从当前 Widget 注册工厂创建，配置完成后重新物化 componentAttributes，避免模板维护第二套运行属性映射。
 */
import { type Mutable } from "/#/global.d";
import { calcAverageSpans } from "@/views/domain/widgets/layout/row-container-layout";
import { type WidgetData, type WidgetNormalData, type WidgetRowContainerData } from "@/views/types";
import { buildWidgetComponentAttributes, createWidgetDefaultData, getWidgetDefinition } from "@/views/domain/widgets/registry";
import { WIDGET_ROW_CONTAINER } from "@/views/domain/widgets/adapters/row-container";

/**
 * @description 模板普通字段可覆盖的通用配置，不为每类组件建立第二份完整属性接口。
 * @remarks settings 使用现有组件设置协议；配置完成后从适配器物化运行属性。
 */
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
 * @remarks 标签、默认值及校验源码在设计数据与设置数据间同步；componentAttributes 最后一次性生成，避免设置面板回显和实际渲染分离。
 */
export const createTemplateField = function (code: string, label: string, options: TemplateFieldOptions = {}): WidgetNormalData {
    // 从注册表取得全新节点，避免模板维护第二套组件默认配置。
    const widgetData = createWidgetDefaultData(code);
    if (widgetData.code === WIDGET_ROW_CONTAINER.code || !getWidgetDefinition(code)) {
        throw new Error(`模板字段类型无效：${code}`);
    }
    // 仅在新节点构建期写入配置；对外仍使用原有 Widget 联合协议。
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
        // 不能用 truthy 判断：false、0、空字符串和显式 null 都是有意义的新字段默认值。
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
 * @throws {Error} 行内没有字段、超过 6 个字段，或底层组件工厂失败时抛出。
 * @remarks spans 与 widgets 通过同一索引对应；此处保留既有构建协议，最终结构检查统一由 registry 执行。
 */
export const createTemplateRow = function (name: string, widgets: WidgetNormalData[], spans = calcAverageSpans(widgets.length), gutter = 16): WidgetRowContainerData {
    if (widgets.length === 0 || widgets.length > 6) throw new Error(`模板行容器字段数量无效：${widgets.length}`);
    // 新行容器拥有独立身份，随后以原地写入方式关联子组件与列宽。
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
 * @throws {Error} 底层组件工厂或运行属性构建失败时抛出。
 * @remarks 只在调用方明确需要展示分割线时创建，不作为所有模板的统一装饰。
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
 * @remarks 运行函数体和设置面板中的完整函数源码必须同时写入，否则脚本能执行却无法再次编辑回显。
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
 * @throws {Error} 控制组件不支持 change 脚本协议时抛出。
 * @remarks 遍历限定为设计器已有的顶层和一层行容器；联动只改根级 isShow，不修改初始 control 配置。
 */
export const bindTemplateVisibility = function (controller: WidgetNormalData, targetWidgets: WidgetNormalData[], visibleValue: string | number | boolean): void {
    // 脚本只记录本次模板实例的字段 ID，重复拖入不能交叉控制。
    const targetIds = JSON.stringify(targetWidgets.map(item => item.id));
    // 将控制值编码为脚本字面量，保留字符串、数字和布尔值的严格比较语义。
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
 * @remarks 不递归支持嵌套容器，遵循设计器固定两层树规则；返回节点原引用，方便模板创建阶段的后续配置。
 */
export const flattenTemplateWidgets = function (widgets: WidgetData[]): WidgetNormalData[] {
    return widgets.flatMap(item => ("widgets" in item && Array.isArray(item.widgets) ? item.widgets : [item as WidgetNormalData]));
};

/**
 * @description 创建用于比较选项展示形态的独立选项数组。
 * @returns 值与标签稳定对应的新数组，第三项禁用以展示选项级状态。
 * @remarks 不共享选项对象，避免多个配置示例之间因设置编辑产生相互污染。
 */
export const options = function () {
    return [
        { label: "选项一", value: "1" },
        { label: "选项二", value: "2" },
        { label: "选项三", value: "3", disabled: true }
    ];
};

/**
 * @description 生成语义稳定的选项，默认值和事件均使用展示文本作为值。
 * @param labels 选项文案。
 * @returns 每次独立创建的选项数组。
 * @remarks 行业和问卷脚本以展示文本作为值判断分支，不能在此擅自转换为序号或另设编码。
 */
export const choices = function (labels: string[]) {
    return labels.map(label => ({ label, value: label }));
};

/**
 * @description 创建纵向问卷题目，长题干不占用左侧固定标签宽度。
 * @param code 现有普通组件类型。
 * @param label 包含题号的题干。
 * @param options 默认值、校验及具体组件配置。
 * @returns 顶部题干、可继续编辑的普通组件。
 * @throws {Error} 字段类型无效或底层运行属性构建失败时抛出。
 * @remarks 顶部标签仅是题目默认布局；显式传入的 settings.labelPosition 仍可覆盖，不强制所有模板为顶部标签。
 */
export const question = function (code: string, label: string, options: TemplateFieldOptions = {}): WidgetNormalData {
    return createTemplateField(code, label, { ...options, settings: { labelPosition: "top", ...options.settings } });
};

/**
 * @description 绑定两项数值的金额乘积到当前实例结果字段。
 * @param quantity 数量字段。
 * @param price 单价字段。
 * @param total 金额结果字段。
 * @returns 无返回值；为两个输入字段写入同一计算脚本。
 * @throws {Error} 任一输入字段不支持 change 脚本协议时抛出。
 * @remarks 清空任一输入同步清空金额，零值仍为合法输入；结果保留两位小数。
 */
export const bindAmount = function (quantity: WidgetNormalData, price: WidgetNormalData, total: WidgetNormalData): void {
    // 由新节点身份构建的运行函数体，保持设置源码与执行脚本一致。
    const body = `const quantity = formData[${JSON.stringify(quantity.id)}];
const price = formData[${JSON.stringify(price.id)}];
formData[${JSON.stringify(total.id)}] = quantity == null || price == null ? null : Math.round(Number(quantity) * Number(price) * 100) / 100;`;
    setTemplateChangeHandler(quantity, body);
    setTemplateChangeHandler(price, body);
};
