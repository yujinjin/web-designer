/**
 * @fileoverview 提示信息展示节点适配模块，负责 Alert 文案、类型、图标、关闭方式及显示状态的设计态同步。
 * @remarks
 * 该节点不产生表单值、校验规则或业务事件，因此不创建 formAttributes/componentFunctions，只保留统一设计器节点协议所需的身份字段。
 * 输入组件的 disabled/readonly 等 control 语义不会透传到 Alert，避免展示组件携带无效交互属性。
 */
import { randomId } from "@yujinjin/utils";
import { type WidgetAlertData } from "../types";

/** 注册表使用的提示组件稳定 code 与组件库展示元数据。 */
export const WIDGET_ALERT = {
    code: "alert",
    name: "提示信息",
    description: "用于显示提示信息",
    icon: "icon-alert"
};

/**
 * @description 创建提示信息组件数据。
 * @returns 相互隔离的新提示信息节点数据。
 * @remarks Alert 是展示组件，不参与表单校验和取值，因此没有 formAttributes/componentFunctions；仍保留 propName 是为了统一设计器节点协议。
 */
export function useCreateDefaultData(): WidgetAlertData {
    // 根据组件 code 生成当前设计节点的唯一 ID。
    const id = WIDGET_ALERT.code.replace(/-/g, "_") + "_" + randomId();
    return {
        id,
        code: WIDGET_ALERT.code,
        name: WIDGET_ALERT.name,
        isShow: true,
        defaultValue: null,
        propName: id,
        componentAttributes: {
            title: "提示信息"
        },
        settingData: {
            propName: id,
            control: ["isShow"],
            title: "提示信息",
            description: null,
            type: "info",
            showIcon: false,
            closable: true,
            center: false,
            closeText: "关闭",
            effect: "light"
        }
    };
}

/**
 * @description 获取 Alert 的运行态属性。
 * @param widgetAlertData 当前提示信息节点数据。
 * @returns componentAttributes 原始引用；该组件没有动态属性适配。
 */
export function useAttributes(widgetAlertData: WidgetAlertData) {
    return widgetAlertData.componentAttributes;
}

/**
 * @description 同步提示内容、样式和节点显示状态。
 * @param widgetAlertData 将被原地更新的提示信息节点数据。
 * @param fileName 发生变化的设置字段。
 * @param value 设置字段的新值。
 * @returns 无返回值。
 * @remarks control 只影响设计器是否渲染该节点，不会写入 disabled 等无意义属性，因为 Alert 本身没有输入交互。
 */
export function useSettingDataValueChange(widgetAlertData: WidgetAlertData, fileName: keyof WidgetAlertData["settingData"], value: any) {
    switch (fileName) {
        case "propName":
            widgetAlertData.propName = value;
            break;
        case "control":
            // 展示组件仅支持 isShow；忽略其他 control 值可避免把输入组件语义错误套用到 Alert。
            widgetAlertData.isShow = value.includes("isShow");
            break;
        case "title":
        case "description":
        case "type":
        case "showIcon":
        case "closable":
        case "center":
        case "closeText":
        case "effect":
            widgetAlertData.componentAttributes[fileName] = value;
            break;
    }
    (widgetAlertData.settingData as any)[fileName] = value;
}
