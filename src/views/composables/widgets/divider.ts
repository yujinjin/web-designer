/**
 * @fileoverview 分隔线展示节点适配模块，维护方向、线型、内容位置、显示文案和节点可见性。
 * @remarks
 * `defaultValue` 在此表示分隔线文案而不是可提交字段值，渲染器单独读取它；组件属性只保存 Element Plus Divider 的样式配置。
 * 保留统一身份和设置结构，使复制、选择和设置面板无需为展示节点引入另一套数据协议。
 */
import { randomId } from "@yujinjin/utils";
import { type WidgetDividerData } from "../types";

/** 注册表使用的分隔线稳定 code 与组件库展示元数据。 */
export const WIDGET_DIVIDER = {
    code: "divider",
    name: "分隔线",
    description: "分隔线组件",
    icon: "icon-divider"
};

/**
 * @description 创建分隔线组件数据。
 * @returns 相互隔离的新分隔线节点数据。
 * @remarks defaultValue 用作分隔线文案而不是表单字段值；保留统一字段结构是为了让设计器的复制、选择和设置流程无需特殊数据协议。
 */
export function useCreateDefaultData(): WidgetDividerData {
    // 根据组件 code 生成当前设计节点的唯一 ID。
    const id = WIDGET_DIVIDER.code.replace(/-/g, "_") + "_" + randomId();
    return {
        id,
        code: WIDGET_DIVIDER.code,
        name: WIDGET_DIVIDER.name,
        isShow: true,
        defaultValue: null,
        propName: id,
        componentAttributes: {
            direction: "horizontal"
        },
        settingData: {
            propName: id,
            defaultValue: null,
            direction: "horizontal",
            control: ["isShow"],
            borderStyle: "solid",
            contentPosition: "center"
        }
    };
}

/**
 * @description 获取分隔线的运行态样式属性。
 * @param widgetDividerData 当前分隔线节点数据。
 * @returns componentAttributes 原始引用；显示文案由渲染器单独读取 defaultValue。
 */
export function useAttributes(widgetDividerData: WidgetDividerData): WidgetDividerData["componentAttributes"] {
    return widgetDividerData.componentAttributes;
}

/**
 * @description 同步分隔线文案、显示状态和样式。
 * @param widgetDividerData 将被原地更新的分隔线节点数据。
 * @param fileName 发生变化的设置字段。
 * @param value 设置字段的新值。
 * @returns 无返回值。
 * @remarks 展示组件不生成事件或校验规则。
 */
export function useSettingDataValueChange(widgetDividerData: WidgetDividerData, fileName: keyof WidgetDividerData["settingData"], value: any) {
    switch (fileName) {
        case "propName":
            widgetDividerData.propName = value;
            break;
        case "defaultValue":
            // 分隔线内容由渲染器读取根级 defaultValue，不能只更新设置态数据。
            widgetDividerData.defaultValue = value;
            break;
        case "control":
            widgetDividerData.isShow = value.includes("isShow");
            break;
        case "direction":
        case "borderStyle":
        case "contentPosition":
            widgetDividerData.componentAttributes[fileName] = value;
            break;
    }
    (widgetDividerData.settingData as any)[fileName] = value;
}
