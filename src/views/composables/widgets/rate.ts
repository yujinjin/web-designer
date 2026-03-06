import { randomId } from "@yujinjin/utils";
import { type WidgetFormData, type WidgetRateData } from "../types";

export const WIDGET_RATE = {
    code: "rate",
    name: "评分",
    description: "评分",
    icon: "icon-rate"
};

// 创建默认数据
export function useCreateDefaultData(): WidgetRateData {
    const id = WIDGET_RATE.code.replace(/-/g, "_") + "_" + randomId();
    return {
        id,
        code: WIDGET_RATE.code,
        name: WIDGET_RATE.name,
        isShow: true,
        defaultValue: null,
        propName: id,
        formAttributes: {
            prop: id,
            required: false,
            label: WIDGET_RATE.name,
            labelPosition: "left"
        },
        componentAttributes: {
            max: 5
        },
        componentFunctions: {
            validate: null,
            change: null
        },
        settingData: {
            propName: id,
            label: WIDGET_RATE.name,
            labelPosition: "left",
            defaultValue: null,
            control: [],
            max: 5,
            allowHalf: false,
            lowThreshold: 2,
            highThreshold: 4,
            showText: true,
            showScore: true,
            textColor: null,
            clearable: true,
            required: false,
            requiredMessage: null,
            onValidate: `function onValidate(value, callback, formData, widgetFormData) {
    // 请在这里编写验证函数体逻辑，可直接使用 value, callback, formData, widgetFormData 参数
}`,
            onChange: `function onChange(value, formData, widgetFormData) {
    // 请在这里编写改变事件处理函数体逻辑，可直接使用 value, formData, widgetFormData 参数
}`
        }
    };
}

// 评分组件事件值改变时处理
export function useSettingDataValueChange(widgetRateData: WidgetRateData, fileName: keyof WidgetRateData["settingData"], value: any) {
    switch (fileName) {
        case "defaultValue":
        case "propName":
            widgetRateData[fileName] = value;
            break;
        case "label":
        case "labelPosition":
            widgetRateData.formAttributes[fileName] = value;
            break;
        case "control":
            widgetRateData.componentAttributes.disabled = value.includes("disabled");
            widgetRateData.isShow = value.includes("isShow");
            break;
        case "allowHalf":
        case "lowThreshold":
        case "highThreshold":
        case "showText":
        case "showScore":
        case "max":
        case "textColor":
        case "clearable":
            widgetRateData.componentAttributes[fileName] = value;
            break;
        case "required":
        case "requiredMessage":
            break;
        case "onValidate":
            widgetRateData.componentFunctions.validate = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onChange":
            widgetRateData.componentFunctions.change = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        default:
            break;
    }
    (widgetRateData.settingData as any)[fileName] = value;
}

// 获取评分组件属性值
export function useAttributes(widgetRateData: WidgetRateData): WidgetRateData["componentAttributes"] {
    return widgetRateData.componentAttributes;
}

export function useEvents(widgetRateData: WidgetRateData, formData: Record<string, any>, widgetFormData: WidgetFormData) {
    const events: Record<string, ((value: any) => void) | (() => void)> = {};
    if (widgetRateData.componentFunctions.change) {
        events.change = function (value: any) {
            new Function("value", "formData", "widgetFormData", widgetRateData.componentFunctions.change as string)(value, formData, widgetFormData);
        };
    }
    return events;
}
