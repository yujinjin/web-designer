import { randomId } from "@yujinjin/utils";
import { type WidgetTimeSelectData, type WidgetFormData } from "@/views/composables/types";

export const WIDGET_TIME_SELECT = {
    code: "time-select",
    name: "选择时间",
    description: "选择时间",
    icon: "icon-time-select"
};

// 创建默认数据
export function useCreateDefaultData(): WidgetTimeSelectData {
    const id = WIDGET_TIME_SELECT.code.replace(/-/g, "_") + "_" + randomId();
    return {
        id,
        code: WIDGET_TIME_SELECT.code,
        name: WIDGET_TIME_SELECT.name,
        isShow: true,
        defaultValue: null,
        propName: id,
        formAttributes: {
            label: WIDGET_TIME_SELECT.name,
            prop: id,
            required: false,
            labelPosition: "left"
        },
        componentAttributes: {
            placeholder: "请选择时间",
            format: "HH:mm:ss"
        },
        componentFunctions: {
            validate: null,
            change: null,
            blur: null,
            focus: null,
            clear: null
        },
        settingData: {
            propName: id,
            label: WIDGET_TIME_SELECT.name,
            labelPosition: "left",
            defaultValue: null,
            control: [],
            clearable: true,
            placeholder: "请选择时间",
            format: "HH:mm",
            editable: true,
            start: "09:00",
            end: "18:00",
            step: "00:30",
            minTime: null,
            maxTime: null,
            includeEndTime: false,
            required: false,
            requiredMessage: null,
            onValidate: `function onValidate(value, callback, formData, widgetFormData) {
    // 请在这里编写验证函数体逻辑，可直接使用 value, callback, formData, widgetFormData 参数
}`,
            onChange: `function onChange(value, formData, widgetFormData) {
    // 请在这里编写改变事件处理函数体逻辑，可直接使用 value, formData, widgetFormData 参数
}`,
            onBlur: `function onBlur(event, value, formData, widgetFormData) {
    // 请在这里编写失去焦点事件处理函数体逻辑，可直接使用 event, value, formData, widgetFormData 参数
}`,
            onFocus: `function onFocus(event, value, formData, widgetFormData) {
    // 请在这里编写获得焦点事件处理函数体逻辑，可直接使用 event, value, formData, widgetFormData 参数
}`,
            onClear: `function onClear(formData, widgetFormData) {
    // 请在这里编写清除事件处理函数体逻辑，可直接使用 formData, widgetFormData 参数
}`
        }
    };
}

// 选择器设置数据值改变时处理
export function useSettingDataValueChange(data: WidgetTimeSelectData, fileName: keyof WidgetTimeSelectData["settingData"], value: any) {
    switch (fileName) {
        case "defaultValue":
        case "propName":
            data[fileName] = value;
            break;
        case "label":
        case "labelPosition":
            data.formAttributes[fileName] = value;
            break;
        case "control":
            data.componentAttributes.disabled = value.includes("disabled");
            data.isShow = value.includes("isShow");
            break;
        case "clearable":
        case "placeholder":
        case "format":
        case "editable":
        case "start":
        case "end":
        case "step":
        case "minTime":
        case "maxTime":
        case "includeEndTime":
            data.componentAttributes[fileName] = value;
            break;
        case "required":
        case "requiredMessage":
            break;
        case "onValidate":
            data.componentFunctions.validate = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onChange":
            data.componentFunctions.change = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onBlur":
            data.componentFunctions.blur = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onFocus":
            data.componentFunctions.focus = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onClear":
            data.componentFunctions.clear = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        default:
            break;
    }
    (data.settingData as any)[fileName] = value;
}

//
export function useAttributes(widgetTimeSelectData: WidgetTimeSelectData): WidgetTimeSelectData["componentAttributes"] {
    return widgetTimeSelectData.componentAttributes;
}

// 处理事件值改变时处理
export function useEvents(widgetTimeSelectData: WidgetTimeSelectData, formData: Record<string, any>, widgetFormData: WidgetFormData) {
    const events: Record<string, ((e: FocusEvent) => void) | ((value: any) => void) | (() => void)> = {};
    if (widgetTimeSelectData.componentFunctions.change) {
        events.change = function (value: any) {
            new Function("value", "formData", "widgetFormData", widgetTimeSelectData.componentFunctions.change as string)(value, formData, widgetFormData);
        };
    }
    if (widgetTimeSelectData.componentFunctions.blur) {
        events.blur = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetTimeSelectData.componentFunctions.blur as string)(event, formData[widgetTimeSelectData.id], formData, widgetFormData);
        };
    }
    if (widgetTimeSelectData.componentFunctions.focus) {
        events.focus = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetTimeSelectData.componentFunctions.focus as string)(event, formData[widgetTimeSelectData.id], formData, widgetFormData);
        };
    }
    if (widgetTimeSelectData.componentFunctions.clear) {
        events.clear = function () {
            new Function("formData", "widgetFormData", widgetTimeSelectData.componentFunctions.clear as string)(formData, widgetFormData);
        };
    }
    return events;
}
