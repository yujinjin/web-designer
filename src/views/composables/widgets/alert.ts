import { randomId } from "@yujinjin/utils";
import { type WidgetAlertData } from "../types";

export const WIDGET_ALERT = {
    code: "alert",
    name: "提示信息",
    description: "用于显示提示信息",
    icon: "icon-alert"
};

// 创建默认数据
export function useCreateDefaultData(): WidgetAlertData {
    const id = WIDGET_ALERT.code + "_" + randomId();
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

// 获取上传组件属性值
export function useAttributes(widgetAlertData: WidgetAlertData) {
    return widgetAlertData.componentAttributes;
}

// 处理事件值改变时处理
export function useSettingDataValueChange(widgetAlertData: WidgetAlertData, fileName: keyof WidgetAlertData["settingData"], value: any) {
    switch (fileName) {
        case "propName":
            widgetAlertData.propName = value;
            break;
        case "control":
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
