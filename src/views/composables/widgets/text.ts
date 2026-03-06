import { randomId } from "@yujinjin/utils";
import { type WidgetTextData, type WidgetFormData } from "../types";

export const WIDGET_TEXT = {
    code: "text",
    name: "文本框",
    description: "普通的文本输入框",
    icon: "icon-input"
};

// 创建默认文本框数据
export function useCreateDefaultData(): WidgetTextData {
    const id = WIDGET_TEXT.code.replace(/-/g, "_") + "_" + randomId();
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
        componentFunctions: {
            validate: null,
            blur: null,
            focus: null,
            input: null,
            change: null,
            formatter: null,
            parser: null
        },
        settingData: {
            propName: id,
            label: "文本框",
            labelPosition: "left",
            type: "text",
            placeholder: "请输入内容",
            defaultValue: null,
            rows: null,
            showWordLimit: null,
            control: ["isShow"],
            maxlength: null,
            minlength: null,
            clearable: true,
            required: false,
            requiredMessage: null,
            regExp: null,
            regExpMessage: null,
            formatter: `function formatter(value) {
    // 请在这里编写格式化函数体逻辑，可直接使用 value 参数
}`,
            parser: `function parser(value) {
    // 请在这里编写解析函数体逻辑，可直接使用 value 参数
}`,
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
        case "defaultValue":
            data[fileName] = value;
            break;
        case "label":
        case "labelPosition":
            data.formAttributes[fileName] = value;
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
        case "control":
            data.componentAttributes.disabled = value.includes("disabled");
            data.isShow = value.includes("isShow");
            data.componentAttributes.readonly = value.includes("readonly");
            break;
        case "placeholder":
        case "formatter":
        case "rows":
        case "showWordLimit":
        case "maxlength":
        case "minlength":
        case "parser":
            data.componentAttributes[fileName] = value;
            break;
        case "required":
        case "requiredMessage":
        case "regExp":
        case "regExpMessage":
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
        case "onInput":
            data.componentFunctions.input = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onChange":
            data.componentFunctions.change = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
    }
    (data.settingData as any)[fileName] = value;
}

// 获取文本框绑定的属性值
export function useAttributes(widgetTextData: WidgetTextData): WidgetTextData["componentAttributes"] {
    const functionAttributes: Record<string, (value: string | number) => string> = {};
    if (widgetTextData.componentAttributes.type === "text") {
        if (widgetTextData.componentFunctions.formatter) {
            functionAttributes.formatter = function (value: string | number) {
                return new Function("value", widgetTextData.componentFunctions.formatter as string)(value);
            };
        }
        if (widgetTextData.componentFunctions.parser) {
            functionAttributes.parser = function (value: string | number) {
                return new Function("value", widgetTextData.componentFunctions.parser as string)(value);
            };
        }
    }
    return Object.assign({}, widgetTextData.componentAttributes, functionAttributes);
}

// 处理事件
export function useEvents(widgetTextData: WidgetTextData, formData: Record<string, any>, widgetFormData: WidgetFormData) {
    const events: Record<string, ((e: FocusEvent) => void) | ((value: string | number) => void) | ((value: string | number, event: Event) => void)> = {};
    if (widgetTextData.componentFunctions.blur) {
        events.blur = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetTextData.componentFunctions.blur as string)(event, formData[widgetTextData.id], formData, widgetFormData);
        };
    }
    if (widgetTextData.componentFunctions.focus) {
        events.focus = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetTextData.componentFunctions.focus as string)(event, formData[widgetTextData.id], formData, widgetFormData);
        };
    }
    if (widgetTextData.componentFunctions.input) {
        events.input = function (value: string | number) {
            new Function("value", "formData", "widgetFormData", widgetTextData.componentFunctions.input as string)(value, formData, widgetFormData);
        };
    }
    if (widgetTextData.componentFunctions.change) {
        events.change = function (value: string | number, event: Event) {
            new Function("value", "formData", "widgetFormData", widgetTextData.componentFunctions.change as string)(value, formData, widgetFormData);
        };
    }
    return events;
}
