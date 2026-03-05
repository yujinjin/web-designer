import { randomId } from "@yujinjin/utils";
import { type WidgetFormData, type WidgetInputNumberData } from "@/views/composables/types";

export const WIDGET_INPUT_NUMBER = {
    code: "input-number",
    name: "输入数字",
    description: "普通的输入数字组件",
    icon: "icon-input-number"
};

// 创建默认输入数字数据
export function useCreateDefaultData(): WidgetInputNumberData {
    const id = WIDGET_INPUT_NUMBER.code + "_" + randomId();
    return {
        id: id,
        code: WIDGET_INPUT_NUMBER.code,
        name: WIDGET_INPUT_NUMBER.name,
        isShow: true,
        defaultValue: null,
        propName: id,
        formAttributes: {
            label: "输入数字",
            prop: id,
            required: false,
            labelPosition: "left"
        },
        componentAttributes: {
            placeholder: "请输入",
            disabledScientific: true
        },
        componentFunctions: {
            validate: null,
            change: null,
            blur: null,
            focus: null
        },
        settingData: {
            propName: id,
            label: "输入数字",
            labelPosition: "left",
            placeholder: "请输入",
            control: [],
            defaultValue: null,
            min: null,
            max: null,
            stepStrictly: false,
            step: 1,
            precision: null,
            controls: true,
            controlsPosition: null,
            align: "center",
            required: false,
            requiredMessage: null,
            onValidate: `function onValidate(value, callback, formData, widgetFormData) {
    // 请在这里编写验证函数体逻辑，可直接使用 value, callback, formData, widgetFormData 参数
}`,
            onBlur: `function onBlur(event, value, formData, widgetFormData) {
    // 请在这里编写失去焦点事件处理函数体逻辑，可直接使用 event, value, formData, widgetFormData 参数
}`,
            onFocus: `function onFocus(event, value, formData, widgetFormData) {
    // 请在这里编写获得焦点事件处理函数体逻辑，可直接使用 event, value, formData, widgetFormData 参数
}`,
            onChange: `function onChange(value, formData, widgetFormData) {
    // 请在这里编写改变事件处理函数体逻辑，可直接使用 value, formData, widgetFormData 参数
}`
        }
    };
}

// 输入数字设置数据值改变时处理
export function useSettingDataValueChange(data: WidgetInputNumberData, fileName: keyof WidgetInputNumberData["settingData"], value: any) {
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
            data.componentAttributes.readonly = value.includes("readonly");
            break;
        case "placeholder":
        case "min":
        case "max":
        case "stepStrictly":
        case "step":
        case "precision":
        case "controls":
        case "controlsPosition":
        case "align":
            data.componentAttributes[fileName] = value;
            break;
        case "required":
        case "requiredMessage":
            break;
        case "onValidate":
            data.componentFunctions.validate = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onBlur":
            data.componentFunctions.blur = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onFocus":
            data.componentFunctions.focus = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onChange":
            data.componentFunctions.change = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        default:
            break;
    }
    (data.settingData as any)[fileName] = value;
}

// 获取文本框绑定的属性值
export function useAttributes(widgetInputNumberData: WidgetInputNumberData): WidgetInputNumberData["componentAttributes"] {
    return widgetInputNumberData.componentAttributes;
}

// 处理事件值改变时处理
export function useEvents(widgetInputNumberData: WidgetInputNumberData, formData: Record<string, any>, widgetFormData: WidgetFormData) {
    const events: Record<string, ((e: FocusEvent) => void) | ((currentValue: number | undefined, oldValue: number | undefined) => void)> = {};
    if (widgetInputNumberData.componentFunctions.blur) {
        events.blur = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetInputNumberData.componentFunctions.blur as string)(event, formData[widgetInputNumberData.id], formData, widgetFormData);
        };
    }
    if (widgetInputNumberData.componentFunctions.focus) {
        events.focus = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetInputNumberData.componentFunctions.focus as string)(event, formData[widgetInputNumberData.id], formData, widgetFormData);
        };
    }
    if (widgetInputNumberData.componentFunctions.change) {
        events.change = function (currentValue: number | undefined, oldValue: number | undefined) {
            new Function("currentValue", "oldValue", "formData", "widgetFormData", widgetInputNumberData.componentFunctions.change as string)(currentValue, oldValue, formData, widgetFormData);
        };
    }
    return events;
}
