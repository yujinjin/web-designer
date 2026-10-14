/**
 * @fileoverview 汇总普通组件与行容器的节点联合类型，供设计器树操作和渲染分发使用。
 * @remarks 具体组件仅反向进行类型引用，不产生运行时注册或模块初始化循环。
 */
// 全类型导入必须整体擦除，避免 verbatimModuleSyntax 将内联 type 编译为空运行导入。
/* eslint import-x/consistent-type-specifier-style: ["error", "prefer-top-level"] */
import type { WidgetTextData, WidgetInputNumberData, WidgetSwitchData, WidgetRateData, WidgetColorPickerData, WidgetSliderData, WidgetUploadData } from "./widgets/inputs";
import type { WidgetRadioGroupData, WidgetCheckboxGroupData, WidgetSelectData } from "./widgets/selections";
import type { WidgetCascaderData } from "./widgets/cascader";
import type { WidgetDatePickerData, WidgetTimePickerData, WidgetTimeSelectData } from "./widgets/datetime";
import type { WidgetHTMLData, WidgetAlertData, WidgetDividerData } from "./widgets/display";
import type { WidgetRowContainerData } from "./widgets/row-container";

/**
 * @description 所有可直接参与渲染、取值或展示的非容器组件数据联合类型。
 */
export type WidgetNormalData =
    | WidgetTextData
    | WidgetInputNumberData
    | WidgetRadioGroupData
    | WidgetCheckboxGroupData
    | WidgetSelectData
    | WidgetCascaderData
    | WidgetDatePickerData
    | WidgetTimePickerData
    | WidgetTimeSelectData
    | WidgetSwitchData
    | WidgetRateData
    | WidgetColorPickerData
    | WidgetSliderData
    | WidgetUploadData
    | WidgetHTMLData
    | WidgetAlertData
    | WidgetDividerData;

/**
 * @description 设计器组件树允许保存的节点联合类型，包括普通组件和行容器。
 */
export type WidgetData = WidgetNormalData | WidgetRowContainerData;
