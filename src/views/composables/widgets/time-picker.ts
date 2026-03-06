import { randomId } from "@yujinjin/utils";
import { type Dayjs } from "dayjs";
import { type WidgetFormData, type WidgetTimePickerData } from "../types";

export const WIDGET_TIME_PICKER = {
    code: "time-picker",
    name: "时间选择器",
    description: "时间选择器",
    icon: "icon-time-picker"
};

// 创建默认数据
export function useCreateDefaultData(): WidgetTimePickerData {
    const id = WIDGET_TIME_PICKER.code.replace(/-/g, "_") + "_" + randomId();
    return {
        id,
        code: WIDGET_TIME_PICKER.code,
        name: WIDGET_TIME_PICKER.name,
        isShow: true,
        defaultValue: null,
        propName: id,
        formAttributes: {
            label: WIDGET_TIME_PICKER.name,
            prop: id,
            required: false,
            labelPosition: "left"
        },
        componentAttributes: {
            placeholder: "请选择时间"
        },
        componentFunctions: {
            validate: null,
            change: null,
            blur: null,
            focus: null,
            clear: null,
            visibleChange: null,
            disabledHours: null,
            disabledMinutes: null,
            disabledSeconds: null
        },
        settingData: {
            propName: id,
            label: WIDGET_TIME_PICKER.name,
            labelPosition: "left",
            defaultValue: null,
            control: [],
            clearable: true,
            placeholder: "请选择时间",
            startPlaceholder: "开始时间",
            endPlaceholder: "结束时间",
            format: "HH:mm:ss",
            editable: true,
            isRange: false,
            valueFormat: "HH:mm:ss",
            rangeSeparator: "-",
            required: false,
            requiredMessage: null,
            disabledHours: `function disabledHours(role, comparingDate, value) {
    // 请在这里编写禁用小时函数体逻辑，可直接使用 role, comparingDate, value 参数,返回数组 表示禁用该小时选项
}`,
            disabledMinutes: `function disabledMinutes(hour, role, comparingDate, value) {
    // 请在这里编写禁用分钟函数体逻辑，可直接使用 hour, role, comparingDate, value 参数,返回数组 表示禁用该分钟选项
}`,
            disabledSeconds: `function disabledSeconds(hour, minute, role, comparingDate, value) {
    // 请在这里编写禁用秒数函数体逻辑，可直接使用 hour, minute, role, comparingDate, value 参数,返回数组 表示禁用该秒数选项
}`,
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
}`,
            onVisibleChange: `function onVisibleChange(visible, formData, widgetFormData) {
    // 请在这里编写可见性改变事件处理函数体逻辑，可直接使用 visible, formData, widgetFormData 参数
}`
        }
    };
}

// 选择器设置数据值改变时处理
export function useSettingDataValueChange(data: WidgetTimePickerData, fileName: keyof WidgetTimePickerData["settingData"], value: any) {
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
        case "isRange":
            data.componentAttributes.isRange = value;
            data.defaultValue = null;
            break;
        case "placeholder":
        case "startPlaceholder":
        case "endPlaceholder":
        case "format":
        case "editable":
        case "valueFormat":
        case "rangeSeparator":
            data.componentAttributes[fileName] = value;
            break;
        case "required":
        case "requiredMessage":
            break;
        case "disabledHours":
            data.componentFunctions.disabledHours = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "disabledMinutes":
            data.componentFunctions.disabledMinutes = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "disabledSeconds":
            data.componentFunctions.disabledSeconds = value ? value.split("\n").slice(1, -1).join("\n") : null;
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
        case "onVisibleChange":
            data.componentFunctions.visibleChange = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        default:
            break;
    }
    (data.settingData as any)[fileName] = value;
}

// 处理属性值改变时处理
export function useAttributes(widgetTimePickerData: WidgetTimePickerData, value: number | string | object): WidgetTimePickerData["componentAttributes"] {
    const functionAttributes: Record<
        string,
        | ((role: string, comparingDate?: Dayjs) => number[])
        | ((hour: number, role: string, comparingDate?: Dayjs) => number[])
        | ((hour: number, minute: number, role: string, comparingDate?: Dayjs) => number[])
    > = {};
    if (widgetTimePickerData.componentFunctions.disabledHours) {
        functionAttributes.disabledHours = function (role: string, comparingDate?: Dayjs) {
            return new Function("role", "comparingDate", "value", widgetTimePickerData.componentFunctions.disabledHours as string)(role, comparingDate, value);
        };
    }
    if (widgetTimePickerData.componentFunctions.disabledMinutes) {
        functionAttributes.disabledMinutes = function (hour: number, role: string, comparingDate?: Dayjs) {
            return new Function("hour", "role", "comparingDate", "value", widgetTimePickerData.componentFunctions.disabledMinutes as string)(hour, role, comparingDate, value);
        };
    }
    if (widgetTimePickerData.componentFunctions.disabledSeconds) {
        functionAttributes.disabledSeconds = function (hour: number, minute: number, role: string, comparingDate?: Dayjs) {
            return new Function("hour", "minute", "role", "comparingDate", "value", widgetTimePickerData.componentFunctions.disabledSeconds as string)(hour, minute, role, comparingDate, value);
        };
    }
    return Object.assign({}, widgetTimePickerData.componentAttributes, functionAttributes);
}

// 处理事件值改变时处理
export function useEvents(widgetTimePickerData: WidgetTimePickerData, formData: Record<string, any>, widgetFormData: WidgetFormData) {
    const events: Record<string, ((e: FocusEvent) => void) | ((value: any) => void) | (() => void)> = {};
    if (widgetTimePickerData.componentFunctions.change) {
        events.change = function (value: any) {
            new Function("value", "formData", "widgetFormData", widgetTimePickerData.componentFunctions.change as string)(value, formData, widgetFormData);
        };
    }
    if (widgetTimePickerData.componentFunctions.blur) {
        events.blur = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetTimePickerData.componentFunctions.blur as string)(event, formData[widgetTimePickerData.id], formData, widgetFormData);
        };
    }
    if (widgetTimePickerData.componentFunctions.focus) {
        events.focus = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetTimePickerData.componentFunctions.focus as string)(event, formData[widgetTimePickerData.id], formData, widgetFormData);
        };
    }
    if (widgetTimePickerData.componentFunctions.clear) {
        events.clear = function () {
            new Function("formData", "widgetFormData", widgetTimePickerData.componentFunctions.clear as string)(formData, widgetFormData);
        };
    }
    return events;
}
