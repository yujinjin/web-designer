import { randomId } from "@yujinjin/utils";
import { type WidgetHTMLData } from "../types";

export const WIDGET_HTML = {
    code: "html",
    name: "HTML",
    description: "HTML",
    icon: "icon-html"
};

// 创建默认数据
export function useCreateDefaultData(): WidgetHTMLData {
    const id = WIDGET_HTML.code.replace(/-/g, "_") + "_" + randomId();
    return {
        id,
        code: WIDGET_HTML.code,
        name: WIDGET_HTML.name,
        isShow: true,
        defaultValue: "<b>html text</b>",
        propName: id,
        settingData: {
            propName: id,
            defaultValue: "<b>html text</b>",
            control: ["isShow"]
        }
    };
}

// 处理事件值改变时处理
export function useSettingDataValueChange(widgetHTMLData: WidgetHTMLData, fileName: keyof WidgetHTMLData["settingData"], value: any) {
    switch (fileName) {
        case "defaultValue":
            widgetHTMLData.defaultValue = value;
            break;
        case "propName":
            widgetHTMLData.propName = value;
            break;
        case "control":
            widgetHTMLData.isShow = value.includes("isShow");
            break;
    }
    widgetHTMLData.settingData[fileName] = value;
}
