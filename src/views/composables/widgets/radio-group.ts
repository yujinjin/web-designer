import { randomId } from "@yujinjin/utils";
import { type WidgetFormData, type WidgetRadioGroupData } from "../types";

export const WIDGET_RADIO_GROUP = {
    code: "radio-group",
    name: "单选框组",
    description: "普通的单选框组",
    icon: "icon-radio"
};

// 创建默认单选框数据
export function useCreateDefaultData(): WidgetRadioGroupData {
    const id = WIDGET_RADIO_GROUP.code + "_" + randomId();
    return {
        id: id,
        code: WIDGET_RADIO_GROUP.code,
        name: WIDGET_RADIO_GROUP.name,
        isShow: true,
        defaultValue: null,
        propName: id,
        formAttributes: {
            label: "单选框",
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
            disabled: false,
            type: "radio"
        },
        componentFunctions: {
            validate: null,
            change: null
        },
        settingData: {
            propName: id,
            label: "单选框",
            labelPosition: "left",
            options: [
                { value: "1", label: "选项1" },
                { value: "2", label: "选项2" },
                { value: "3", label: "选项3", disabled: true }
            ],
            defaultValue: null,
            control: [],
            type: "radio",
            required: false,
            requiredMessage: null,
            textColor: null,
            fill: null,
            onValidate: `function onValidate(value, callback, formData, widgetFormData) {
    // 请在这里编写验证函数体逻辑，可直接使用 value, callback, formData, widgetFormData 参数
}`,
            onChange: `function onChange(value, formData, widgetFormData) {
    // 请在这里编写改变事件处理函数体逻辑，可直接使用 value, formData, widgetFormData 参数
}`
        }
    };
}

// 获取单选框绑定的属性值
export function useAttributes(widgetRadioGroupData: WidgetRadioGroupData): WidgetRadioGroupData["componentAttributes"] {
    return widgetRadioGroupData.componentAttributes;
}

// 处理文本框设置数据值改变
export function useSettingDataValueChange(widgetRadioGroupData: WidgetRadioGroupData, fileName: keyof WidgetRadioGroupData["settingData"], value: any) {
    switch (fileName) {
        case "defaultValue":
        case "propName":
            widgetRadioGroupData[fileName] = value;
            break;
        case "label":
        case "labelPosition":
            widgetRadioGroupData.formAttributes[fileName] = value;
            break;
        case "control":
            widgetRadioGroupData.componentAttributes.disabled = value.includes("disabled");
            widgetRadioGroupData.isShow = value.includes("isShow");
            break;
        case "options":
        case "type":
        case "textColor":
        case "fill":
            widgetRadioGroupData.componentAttributes[fileName] = value;
            break;
        case "required":
        case "requiredMessage":
            break;
        case "onValidate":
            widgetRadioGroupData.componentFunctions.validate = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onChange":
            widgetRadioGroupData.componentFunctions.change = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
    }
    (widgetRadioGroupData.settingData as any)[fileName] = value;
}

export function useEvents(widgetRadioGroupData: WidgetRadioGroupData, formData: Record<string, any>, widgetFormData: WidgetFormData) {
    const events: Record<string, (value: string | number | boolean) => void> = {};
    if (widgetRadioGroupData.componentFunctions.change) {
        events.change = function (value: string | number | boolean) {
            new Function("value", "formData", "widgetFormData", widgetRadioGroupData.componentFunctions.change as string)(value, formData, widgetFormData);
        };
    }
    return events;
}
