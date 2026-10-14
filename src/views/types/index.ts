/**
 * @fileoverview 设计器类型公共入口，仅汇总类型导出。
 * @remarks 不暴露注册表、组件工厂或运行函数，调用方使用 import type 以避免把类型依赖变成运行依赖。
 */
export type { UseSettingDataValueChangeFun, ChangeSelectedWidgetSettingDataFun, WidgetBaseData } from "./base";
export type { WidgetFormData } from "./form";
export type { WidgetNormalData, WidgetData } from "./widget";
export type { WidgetTextData, WidgetInputNumberData, WidgetSwitchData, WidgetRateData, WidgetColorPickerData, WidgetSliderData, WidgetUploadData } from "./widgets/inputs";
export type { WidgetRadioGroupData, WidgetCheckboxGroupData, WidgetSelectData } from "./widgets/selections";
export type { CascaderNodeValue, CascaderOption, CascaderParseSuccess, CascaderParseFailure, CascaderParseResult, CascaderValue, WidgetCascaderData } from "./widgets/cascader";
export type { WidgetDatePickerData, WidgetTimePickerData, WidgetTimeSelectData } from "./widgets/datetime";
export type { WidgetHTMLData, WidgetAlertData, WidgetDividerData } from "./widgets/display";
export type { WidgetRowContainerData } from "./widgets/row-container";
