import { randomId } from "@yujinjin/utils";
import { type Arrayable } from "element-plus/es/utils/typescript.mjs";
import { type WidgetSliderData, type WidgetFormData } from "../types";

export const WIDGET_SLIDER = {
    code: "slider",
    name: "滑动选择",
    description: "滑动选择",
    icon: "icon-slider"
};

// 创建默认数据
export function useCreateDefaultData(): WidgetSliderData {
    const id = WIDGET_SLIDER.code.replace(/-/g, "_") + "_" + randomId();
    return {
        id,
        code: WIDGET_SLIDER.code,
        name: WIDGET_SLIDER.name,
        isShow: true,
        defaultValue: null,
        propName: id,
        formAttributes: {
            label: WIDGET_SLIDER.name,
            labelPosition: "left",
            prop: id,
            required: false
        },
        componentAttributes: {
            min: 0,
            max: 100
        },
        componentFunctions: {
            validate: null,
            change: null,
            input: null,
            formatTooltip: null,
            formatValueText: null
        },
        settingData: {
            propName: id,
            label: WIDGET_SLIDER.name,
            labelPosition: "left",
            defaultValue: null,
            control: [],
            min: 0,
            max: 100,
            step: 1,
            showInput: false,
            showInputControls: false,
            showTooltip: true,
            showStops: false,
            range: false,
            vertical: false,
            height: null,
            rangeStartLabel: null,
            rangeEndLabel: null,
            placement: "top",
            marks: null,
            persistent: null,
            required: false,
            requiredMessage: null,
            formatTooltip: `function formatTooltip(value) {
    // 请在这里编写格式化提示文本函数体逻辑，可直接使用 value 参数
}`,
            formatValueText: `function formatValueText(value) {
    // 请在这里编写格式化值文本函数体逻辑，可直接使用 value 参数
}`,
            onValidate: `function onValidate(value, callback, formData, widgetFormData) {
    // 请在这里编写验证函数体逻辑，可直接使用 value, callback, formData, widgetFormData 参数
}`,
            onChange: `function onChange(value, formData, widgetFormData) {
    // 请在这里编写改变事件处理函数体逻辑，可直接使用 value, formData, widgetFormData 参数
}`,
            onInput: `function onInput(value, formData, widgetFormData) {
    // 请在这里编写输入事件处理函数体逻辑，可直接使用 value, formData, widgetFormData 参数
}`
        }
    };
}

// 获取滑块组件属性值
export function useAttributes(widgetSliderData: WidgetSliderData, value?: number | number[]): WidgetSliderData["componentAttributes"] {
    const functionAttributes: Record<string, (value: number) => string> = {};
    if (widgetSliderData.componentFunctions.formatTooltip) {
        functionAttributes.formatTooltip = function (value: number) {
            return new Function("value", widgetSliderData.componentFunctions.formatTooltip as string)(value);
        };
    }
    if (widgetSliderData.componentFunctions.formatValueText) {
        functionAttributes.formatValueText = function (value: number) {
            return new Function("value", widgetSliderData.componentFunctions.formatValueText as string)(value);
        };
    }
    return Object.assign({}, widgetSliderData.componentAttributes, functionAttributes);
}

// 处理事件值改变时处理
export function useSettingDataValueChange(widgetSliderData: WidgetSliderData, fileName: keyof WidgetSliderData["settingData"], value: any) {
    switch (fileName) {
        case "defaultValue":
        case "propName":
            widgetSliderData[fileName] = value;
            break;
        case "label":
        case "labelPosition":
            widgetSliderData.formAttributes[fileName] = value;
            break;
        case "control":
            widgetSliderData.componentAttributes.disabled = value.includes("disabled");
            widgetSliderData.isShow = value.includes("isShow");
            break;
        case "min":
        case "max":
        case "step":
        case "showInput":
        case "showInputControls":
        case "showTooltip":
        case "showStops":
        case "range":
        case "vertical":
        case "height":
        case "rangeStartLabel":
        case "rangeEndLabel":
        case "placement":
        case "marks":
        case "persistent":
            widgetSliderData.componentAttributes[fileName] = value;
            break;
        case "required":
        case "requiredMessage":
            break;
        case "formatTooltip":
            widgetSliderData.componentFunctions.formatTooltip = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "formatValueText":
            widgetSliderData.componentFunctions.formatValueText = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onValidate":
            widgetSliderData.componentFunctions.validate = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onChange":
            widgetSliderData.componentFunctions.change = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onInput":
            widgetSliderData.componentFunctions.input = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        default:
            break;
    }
    (widgetSliderData.settingData as any)[fileName] = value;
}

// 处理事件值改变时处理
export function useEvents(widgetSliderData: WidgetSliderData, formData: Record<string, any>, widgetFormData: WidgetFormData) {
    const events: Record<string, (value: Arrayable<number>) => boolean> = {};
    if (widgetSliderData.componentFunctions.change) {
        events.change = function (value: Arrayable<number>) {
            return new Function("value", "formData", "widgetFormData", widgetSliderData.componentFunctions.change as string)(value, formData, widgetFormData);
        };
    }
    if (widgetSliderData.componentFunctions.input) {
        events.input = function (value: Arrayable<number>) {
            return new Function("value", "formData", "widgetFormData", widgetSliderData.componentFunctions.input as string)(value, formData, widgetFormData);
        };
    }
    return events;
}
