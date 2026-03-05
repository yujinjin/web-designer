import { randomId } from "@yujinjin/utils";
import { type WidgetFormData, type WidgetSwitchData } from "../types";

export const WIDGET_SWITCH = {
    code: "switch",
    name: "开关",
    description: "开关",
    icon: "icon-switch"
};

// 创建默认开关组件数据
export function useCreateDefaultData(): WidgetSwitchData {
    const id = WIDGET_SWITCH.code + "_" + randomId();
    return {
        id,
        code: WIDGET_SWITCH.code,
        name: WIDGET_SWITCH.name,
        isShow: true,
        defaultValue: false,
        propName: id,
        formAttributes: {
            label: WIDGET_SWITCH.name,
            prop: id,
            required: false,
            labelPosition: "left"
        },
        componentAttributes: {
            loading: false
        },
        componentFunctions: {
            validate: null,
            change: null,
            beforeChange: null
        },
        settingData: {
            propName: id,
            label: WIDGET_SWITCH.name,
            labelPosition: "left",
            activeText: null,
            inactiveText: null,
            control: [],
            defaultValue: false,
            required: false,
            requiredMessage: null,
            inlinePrompt: null,
            beforeChange: `async function beforeChange(value) {
    // 请在这里编写改变事件处理函数体逻辑，可直接使用 value 参数
}`,
            onValidate: `function onValidate(value, callback, formData, widgetFormData) {
    // 请在这里编写验证函数体逻辑，可直接使用 value, callback, formData, widgetFormData 参数
}`,
            onChange: `function onChange(value, formData, widgetFormData) {
    // 请在这里编写改变事件处理函数体逻辑，可直接使用 value, formData, widgetFormData 参数
}`
        }
    };
}

// 开关组件设置数据值改变时处理
export function useSettingDataValueChange(widgetSwitchData: WidgetSwitchData, fileName: keyof WidgetSwitchData["settingData"], value: any) {
    switch (fileName) {
        case "defaultValue":
        case "propName":
            widgetSwitchData[fileName] = value;
            break;
        case "label":
        case "labelPosition":
            widgetSwitchData.formAttributes[fileName] = value;
            break;
        case "control":
            widgetSwitchData.componentAttributes.disabled = value.includes("disabled");
            widgetSwitchData.isShow = value.includes("isShow");
            break;
        case "activeText":
        case "inactiveText":
        case "inlinePrompt":
            widgetSwitchData.componentAttributes[fileName] = value;
            break;
        case "required":
        case "requiredMessage":
            break;
        case "beforeChange":
            widgetSwitchData.componentFunctions.beforeChange = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onValidate":
            widgetSwitchData.componentFunctions.validate = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onChange":
            widgetSwitchData.componentFunctions.change = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        default:
            break;
    }
    (widgetSwitchData.settingData as any)[fileName] = value;
}

// 处理属性值改变时处理
export function useAttributes(widgetSwitchData: WidgetSwitchData, value: number | string | boolean): WidgetSwitchData["componentAttributes"] {
    const functionAttributes: Record<string, (() => Promise<boolean>) | boolean> = {};
    if (widgetSwitchData.componentFunctions.beforeChange) {
        functionAttributes.beforeChange = async function () {
            return (await new Function("value", widgetSwitchData.componentFunctions.beforeChange as string)(value)) as Promise<boolean>;
        };
    }
    return Object.assign({}, widgetSwitchData.componentAttributes, functionAttributes);
}

// 开关组件事件值改变时处理函数
export function useEvents(widgetSwitchData: WidgetSwitchData, formData: Record<string, any>, widgetFormData: WidgetFormData) {
    const events: Record<string, (value: any) => void> = {};
    if (widgetSwitchData.componentFunctions.change) {
        events.change = function (value: any) {
            new Function("value", "formData", "widgetFormData", widgetSwitchData.componentFunctions.change as string)(value, formData, widgetFormData);
        };
    }
    return events;
}
