import { randomId } from "@yujinjin/utils";
import { type WidgetTextData, type WidgetFormData } from "../types";

export const WIDGET_TEXT = {
    code: "text",
    name: "文本框",
    description: "普通的文本输入框",
    icon: "icon-text"
};

// 创建默认文本框数据
export function useCreateDefaultData(): WidgetTextData {
    const id = WIDGET_TEXT.code + "_" + randomId();
    return {
        id: id,
        code: WIDGET_TEXT.code,
        name: WIDGET_TEXT.name,
        isShow: true,
        defaultValue: null,
        propName: id,
        formAttributes: {
            label: "文本框",
            prop: id,
            required: false,
            labelPosition: "left"
        },
        componentAttributes: {
            type: "text",
            placeholder: "请输入内容",
            showWordLimit: false,
            disabled: false,
            clearable: true,
            readonly: false,
            maxlength: undefined,
            minlength: undefined
        },
        componentEvents: {
            validate: null,
            blur: null,
            focus: null,
            input: null,
            change: null
        },
        settingData: {
            propName: id,
            label: "文本框",
            labelPosition: "left",
            type: "text",
            placeholder: null,
            defaultValue: null,
            rows: null,
            showWordLimit: null,
            control: [],
            maxlength: null,
            minlength: null,
            required: false,
            requiredMessage: null,
            regExp: null,
            regExpMessage: null,
            onValidate: `function onValidate(value, callback, formData, widgetFormData) {
    // 请在这里编写验证函数体逻辑，可直接使用 value, callback, formData, widgetFormData 参数
}`,
            onBlur: `function onBlur(event, value, formData, widgetFormData) {
    // 请在这里编写失去焦点事件处理函数体逻辑，可直接使用 event, value, formData, widgetFormData 参数
}`,
            onFocus: `function onFocus(event, value, formData, widgetFormData) {
    // 请在这里编写获得焦点事件处理函数体逻辑，可直接使用 event, value, formData, widgetFormData 参数
}`,
            onInput: `function onInput(value, formData, widgetFormData) {
    // 请在这里编写输入事件处理函数体逻辑，可直接使用 value, formData, widgetFormData 参数
}`,
            onChange: `function onChange(value, formData, widgetFormData) {
    // 请在这里编写改变事件处理函数体逻辑，可直接使用 value, formData, widgetFormData 参数
}`
        }
    };
}

// 处理文本框设置数据值改变
export function useSettingDataValueChange(data: WidgetTextData, fileName: keyof WidgetTextData["settingData"], value: any) {
    switch (fileName) {
        case "propName":
            data.propName = value;
            break;
        case "label":
            data.formAttributes.label = value;
            break;
        case "labelPosition":
            data.formAttributes.labelPosition = value;
            break;
        case "type":
            data.componentAttributes.type = value;
            if (value === "textarea") {
                if (!data.settingData.rows) {
                    data.settingData.rows = 2;
                }
                data.componentAttributes.rows = data.settingData.rows;
            } else {
                delete data.componentAttributes.rows;
            }
            break;
        case "placeholder":
            data.componentAttributes.placeholder = value;
            break;
        case "required": {
            break;
        }
        case "requiredMessage": {
            break;
        }
        case "regExp": {
            break;
        }
        case "regExpMessage": {
            break;
        }
        case "defaultValue":
            data.defaultValue = value;
            break;
        case "rows":
            data.componentAttributes.rows = value;
            break;
        case "showWordLimit":
            data.componentAttributes.showWordLimit = value;
            break;
        case "control":
            data.componentAttributes.disabled = value.includes("disabled");
            data.isShow = value.includes("isShow");
            data.componentAttributes.readonly = value.includes("readonly");
            break;
        case "maxlength":
            data.componentAttributes.maxlength = value;
            break;
        case "minlength":
            data.componentAttributes.minlength = value;
            break;
        case "onValidate":
            data.componentEvents.validate = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onBlur":
            data.componentEvents.blur = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onFocus":
            data.componentEvents.focus = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onInput":
            data.componentEvents.input = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onChange":
            data.componentEvents.change = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
    }
    (data.settingData as any)[fileName] = value;
}

// 处理事件
export function useEvents(widgetTextData: WidgetTextData, formData: Record<string, any>, widgetFormData: WidgetFormData) {
    const events: Record<string, ((e: FocusEvent) => void) | ((value: string | number) => void) | ((value: string | number, event: Event) => void)> = {};
    if (widgetTextData.componentEvents.blur) {
        events.blur = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetTextData.componentEvents.blur as string)(event, formData[widgetTextData.id], formData, widgetFormData);
        };
    }
    if (widgetTextData.componentEvents.focus) {
        events.focus = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetTextData.componentEvents.focus as string)(event, formData[widgetTextData.id], formData, widgetFormData);
        };
    }
    if (widgetTextData.componentEvents.input) {
        events.input = function (value: string | number) {
            new Function("value", "formData", "widgetFormData", widgetTextData.componentEvents.input as string)(value, formData, widgetFormData);
        };
    }
    if (widgetTextData.componentEvents.change) {
        events.change = function (value: string | number, event: Event) {
            new Function("value", "formData", "widgetFormData", widgetTextData.componentEvents.change as string)(value, formData, widgetFormData);
        };
    }
    return events;
}
