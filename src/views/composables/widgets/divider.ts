import { randomId } from "@yujinjin/utils";
import { type WidgetDividerData } from "../types";

export const WIDGET_DIVIDER = {
    code: "divider",
    name: "分隔线",
    description: "分隔线组件",
    icon: "icon-divider"
};

// 创建默认数据
export function useCreateDefaultData(): WidgetDividerData {
    const id = WIDGET_DIVIDER.code + "_" + randomId();
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

// 获取上传组件属性值
export function useAttributes(widgetDividerData: WidgetDividerData): WidgetDividerData["componentAttributes"] {
    return widgetDividerData.componentAttributes;
}

// 处理事件值改变时处理
export function useSettingDataValueChange(widgetDividerData: WidgetDividerData, fileName: keyof WidgetDividerData["settingData"], value: any) {
    switch (fileName) {
        case "propName":
            widgetDividerData.propName = value;
            break;
        case "defaultValue":
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
