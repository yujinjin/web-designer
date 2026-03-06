import { randomId } from "@yujinjin/utils";
import { type WidgetColorPickerData, type WidgetFormData } from "../types";

export const WIDGET_COLOR_PICKER = {
    code: "color-picker",
    name: "颜色选择",
    description: "颜色选择",
    icon: "icon-color-picker"
};

// 创建默认数据
export function useCreateDefaultData(): WidgetColorPickerData {
    const id = WIDGET_COLOR_PICKER.code.replace(/-/g, "_") + "_" + randomId();
    return {
        id,
        code: WIDGET_COLOR_PICKER.code,
        name: WIDGET_COLOR_PICKER.name,
        isShow: true,
        defaultValue: null,
        propName: id,
        formAttributes: {
            label: WIDGET_COLOR_PICKER.name,
            labelPosition: "left",
            prop: id,
            required: false
        },
        componentAttributes: {
            clearable: false
        },
        componentFunctions: {
            validate: null,
            change: null,
            blur: null,
            focus: null,
            clear: null,
            activeChange: null
        },
        settingData: {
            propName: id,
            label: WIDGET_COLOR_PICKER.name,
            labelPosition: "left",
            control: [],
            defaultValue: null,
            required: false,
            requiredMessage: null,
            clearable: false,
            showAlpha: false,
            colorFormat: "hex",
            onValidate: `function onValidate(value, callback, formData, widgetFormData) {
    // 请在这里编写验证函数体逻辑，可直接使用 value, callback, formData, widgetFormData 参数
}`,
            onChange: `function onChange(value, formData, widgetFormData) {
    // 请在这里编写改变事件处理函数体逻辑，可直接使用 value, formData, widgetFormData 参数
}`,
            onActiveChange: `function onActiveChange(value, formData, widgetFormData) {
    // 请在这里编写激活事件处理函数体逻辑，可直接使用 value, formData, widgetFormData 参数
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

// 获取颜色选择器属性值
export function useAttributes(widgetColorPickerData: WidgetColorPickerData): WidgetColorPickerData["componentAttributes"] {
    return widgetColorPickerData.componentAttributes;
}

// 颜色选择器事件值改变时处理
export function useSettingDataValueChange(widgetColorPickerData: WidgetColorPickerData, fileName: keyof WidgetColorPickerData["settingData"], value: any) {
    console.log(fileName, value);
    switch (fileName) {
        case "propName":
            widgetColorPickerData.propName = value;
            break;
        case "label":
        case "labelPosition":
            widgetColorPickerData.formAttributes[fileName] = value;
            break;
        case "control":
            widgetColorPickerData.componentAttributes.disabled = value.includes("disabled");
            widgetColorPickerData.isShow = value.includes("isShow");
            break;
        case "clearable":
        case "showAlpha":
        case "colorFormat":
            widgetColorPickerData.componentAttributes[fileName] = value;
            break;
        case "required":
        case "requiredMessage":
            break;
        case "onValidate":
            widgetColorPickerData.componentFunctions.validate = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onChange":
            widgetColorPickerData.componentFunctions.change = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onActiveChange":
            widgetColorPickerData.componentFunctions.activeChange = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onBlur":
            widgetColorPickerData.componentFunctions.blur = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onFocus":
            widgetColorPickerData.componentFunctions.focus = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onClear":
            widgetColorPickerData.componentFunctions.clear = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        default:
            break;
    }
    (widgetColorPickerData.settingData as any)[fileName] = value;
}

// 处理事件值改变时处理
export function useEvents(widgetColorPickerData: WidgetColorPickerData, formData: Record<string, any>, widgetFormData: WidgetFormData) {
    const events: Record<string, ((e: FocusEvent) => void) | ((value: any) => void) | (() => void)> = {};
    if (widgetColorPickerData.componentFunctions.change) {
        events.change = function (value: any) {
            new Function("value", "formData", "widgetFormData", widgetColorPickerData.componentFunctions.change as string)(value, formData, widgetFormData);
        };
    }
    if (widgetColorPickerData.componentFunctions.blur) {
        events.blur = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetColorPickerData.componentFunctions.blur as string)(event, formData[widgetColorPickerData.id], formData, widgetFormData);
        };
    }
    if (widgetColorPickerData.componentFunctions.focus) {
        events.focus = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetColorPickerData.componentFunctions.focus as string)(event, formData[widgetColorPickerData.id], formData, widgetFormData);
        };
    }
    if (widgetColorPickerData.componentFunctions.clear) {
        events.clear = function () {
            new Function("formData", "widgetFormData", widgetColorPickerData.componentFunctions.clear as string)(formData, widgetFormData);
        };
    }
    if (widgetColorPickerData.componentFunctions.activeChange) {
        events.activeChange = function (value: any) {
            new Function("value", "formData", "widgetFormData", widgetColorPickerData.componentFunctions.activeChange as string)(value, formData, widgetFormData);
        };
    }
    return events;
}
