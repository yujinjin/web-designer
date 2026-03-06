import { randomId } from "@yujinjin/utils";
import { type WidgetFormData, type WidgetCheckboxGroupData } from "../types";

export const WIDGET_CHECKBOX_GROUP = {
    code: "checkbox-group",
    name: "复选框组",
    description: "普通的复选框组",
    icon: "icon-checkbox-group"
};

// 创建默认复选框组数据
export function useCreateDefaultData(): WidgetCheckboxGroupData {
    const id = WIDGET_CHECKBOX_GROUP.code.replace(/-/g, "_") + "_" + randomId();
    return {
        id: id,
        code: WIDGET_CHECKBOX_GROUP.code,
        name: WIDGET_CHECKBOX_GROUP.name,
        isShow: true,
        defaultValue: null,
        propName: id,
        formAttributes: {
            label: WIDGET_CHECKBOX_GROUP.name,
            prop: id,
            required: false,
            labelPosition: "left"
        },
        componentAttributes: {
            options: [
                { value: "1", label: "选项1" },
                { value: "2", label: "选项2" },
                { value: "3", label: "选项3", disabled: true }
            ],
            type: "checkbox"
        },
        componentFunctions: {
            validate: null,
            change: null
        },
        settingData: {
            propName: id,
            label: WIDGET_CHECKBOX_GROUP.name,
            labelPosition: "left",
            options: [
                { value: "1", label: "选项1" },
                { value: "2", label: "选项2" },
                { value: "3", label: "选项3", disabled: true }
            ],
            defaultValue: null,
            control: [],
            type: "checkbox",
            min: null,
            max: null,
            textColor: null,
            fill: null,
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

// 获取复选框组绑定的属性值
export function useAttributes(widgetCheckboxGroupData: WidgetCheckboxGroupData): WidgetCheckboxGroupData["componentAttributes"] {
    return widgetCheckboxGroupData.componentAttributes;
}

// 复选框组设置数据值改变时处理
export function useSettingDataValueChange(widgetCheckboxGroupData: WidgetCheckboxGroupData, fileName: keyof WidgetCheckboxGroupData["settingData"], value: any) {
    switch (fileName) {
        case "propName":
        case "defaultValue":
            widgetCheckboxGroupData[fileName] = value;
            break;
        case "label":
        case "labelPosition":
            widgetCheckboxGroupData.formAttributes[fileName] = value;
            break;
        case "control":
            widgetCheckboxGroupData.componentAttributes.disabled = value.includes("disabled");
            widgetCheckboxGroupData.isShow = value.includes("isShow");
            break;
        case "options":
        case "type":
        case "min":
        case "max":
        case "textColor":
        case "fill":
            widgetCheckboxGroupData.componentAttributes[fileName] = value;
            break;
        case "required":
        case "requiredMessage":
            break;
        case "onValidate":
            widgetCheckboxGroupData.componentFunctions.validate = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onChange":
            widgetCheckboxGroupData.componentFunctions.change = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        default:
            break;
    }
    (widgetCheckboxGroupData.settingData as any)[fileName] = value;
}

// 处理事件值改变时处理
export function useEvents(widgetCheckboxGroupData: WidgetCheckboxGroupData, formData: Record<string, any>, widgetFormData: WidgetFormData) {
    const events: Record<string, (value: string[] | number[]) => void> = {};
    if (widgetCheckboxGroupData.componentFunctions.change) {
        events.change = function (value: string[] | number[]) {
            new Function("value", "formData", "widgetFormData", widgetCheckboxGroupData.componentFunctions.change as string)(value, formData, widgetFormData);
        };
    }
    return events;
}
