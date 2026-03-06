import { randomId } from "@yujinjin/utils";
import { type WidgetDatePickerData, type WidgetFormData } from "@/views/composables/types";

export const WIDGET_DATE_PICKER = {
    code: "date-picker",
    name: "选择日期",
    description: "选择日期",
    icon: "icon-date-picker"
};

// 创建默认数据
export function useCreateDefaultData(): WidgetDatePickerData {
    const id = WIDGET_DATE_PICKER.code.replace(/-/g, "_") + "_" + randomId();
    return {
        id,
        code: WIDGET_DATE_PICKER.code,
        name: WIDGET_DATE_PICKER.name,
        isShow: true,
        defaultValue: null,
        propName: id,
        formAttributes: {
            prop: id,
            required: false,
            label: WIDGET_DATE_PICKER.name,
            labelPosition: "left"
        },
        componentAttributes: {
            type: "date",
            placeholder: "请选择日期",
            clearable: true,
            startPlaceholder: "开始日期",
            endPlaceholder: "结束日期",
            valueFormat: "YYYY-MM-DD"
        },
        componentFunctions: {
            validate: null,
            change: null,
            blur: null,
            focus: null,
            clear: null,
            visibleChange: null,
            disabledDate: null,
            disabledHours: null,
            disabledMinutes: null,
            disabledSeconds: null
        },
        settingData: {
            propName: id,
            label: WIDGET_DATE_PICKER.name,
            labelPosition: "left",
            type: "date",
            control: [],
            defaultValue: null,
            defaultTime: null,
            clearable: true,
            placeholder: "请选择日期",
            startPlaceholder: "开始日期",
            endPlaceholder: "结束日期",
            valueFormat: "YYYY-MM-DD",
            format: "YYYY-MM-DD",
            dateFormat: "YYYY-MM-DD",
            timeFormat: "HH:mm:ss",
            editable: true,
            rangeSeparator: "-",
            required: false,
            requiredMessage: null,
            disabledDate: `function disabledDate(date, value) {
    // 请在这里编写禁用日期函数体逻辑，可直接使用 date, value 参数,返回 true 表示禁用该日期
}`,
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
export function useSettingDataValueChange(data: WidgetDatePickerData, fileName: keyof WidgetDatePickerData["settingData"], value: any) {
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
        case "type":
            data.componentAttributes.type = value || "date";
            data.settingData.defaultValue = null;
            break;
        case "placeholder":
        case "startPlaceholder":
        case "endPlaceholder":
        case "defaultTime":
        case "editable":
        case "rangeSeparator":
        case "valueFormat":
        case "format":
        case "dateFormat":
        case "timeFormat":
            data.componentAttributes[fileName] = value;
            break;
        case "required":
        case "requiredMessage":
            break;
        case "disabledDate":
            data.componentFunctions.disabledDate = value ? value.split("\n").slice(1, -1).join("\n") : null;
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

// 获取选择器绑定的属性值
export function useAttributes(widgetDatePickerData: WidgetDatePickerData, value: Date | string | number | Array<Date | string | number> | null): WidgetDatePickerData["componentAttributes"] {
    const functionAttributes: Record<
        string,
        | ((date: Date) => boolean)
        | ((role: string, comparingDate: Date, value: string | number) => boolean)
        | ((hour: number, role: string, comparingDate: Date, value: string | number) => boolean)
        | ((hour: number, minute: number, role: string, comparingDate: Date, value: string | number) => boolean)
    > = {};
    if (widgetDatePickerData.componentFunctions.disabledDate) {
        functionAttributes.disabledDate = function (date: Date) {
            return new Function("date", "value", "widgetDatePickerData", widgetDatePickerData.componentFunctions.disabledDate as string)(date, value, widgetDatePickerData);
        };
    }
    if (widgetDatePickerData.componentFunctions.disabledHours) {
        functionAttributes.disabledHours = function (role: string, comparingDate: Date, value: string | number) {
            return new Function("role", "comparingDate", "value", "widgetDatePickerData", widgetDatePickerData.componentFunctions.disabledHours as string)(
                role,
                comparingDate,
                value,
                widgetDatePickerData
            );
        };
    }
    if (widgetDatePickerData.componentFunctions.disabledMinutes) {
        functionAttributes.disabledMinutes = function (hour: number, role: string, comparingDate: Date, value: string | number) {
            return new Function("hour", "role", "comparingDate", "value", "widgetDatePickerData", widgetDatePickerData.componentFunctions.disabledMinutes as string)(
                hour,
                role,
                comparingDate,
                value,
                widgetDatePickerData
            );
        };
    }
    if (widgetDatePickerData.componentFunctions.disabledSeconds) {
        functionAttributes.disabledSeconds = function (hour: number, minute: number, role: string, comparingDate: Date, value: string | number) {
            return new Function("hour", "minute", "role", "comparingDate", "value", "widgetDatePickerData", widgetDatePickerData.componentFunctions.disabledSeconds as string)(
                hour,
                minute,
                role,
                comparingDate,
                value,
                widgetDatePickerData
            );
        };
    }
    return Object.assign({}, widgetDatePickerData.componentAttributes, functionAttributes);
}

// 处理事件值改变时处理
export function useEvents(widgetDatePickerData: WidgetDatePickerData, formData: Record<string, any>, widgetFormData: WidgetFormData) {
    const events: Record<string, ((e: FocusEvent) => void) | ((value: any) => void) | (() => void)> = {};
    if (widgetDatePickerData.componentFunctions.change) {
        events.change = function (value: any) {
            new Function("value", "formData", "widgetFormData", widgetDatePickerData.componentFunctions.change as string)(value, formData, widgetFormData);
        };
    }
    if (widgetDatePickerData.componentFunctions.blur) {
        events.blur = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetDatePickerData.componentFunctions.blur as string)(event, formData[widgetDatePickerData.id], formData, widgetFormData);
        };
    }
    if (widgetDatePickerData.componentFunctions.focus) {
        events.focus = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetDatePickerData.componentFunctions.focus as string)(event, formData[widgetDatePickerData.id], formData, widgetFormData);
        };
    }
    if (widgetDatePickerData.componentFunctions.clear) {
        events.clear = function () {
            new Function("formData", "widgetFormData", widgetDatePickerData.componentFunctions.clear as string)(formData, widgetFormData);
        };
    }
    if (widgetDatePickerData.componentFunctions.visibleChange) {
        events.visibleChange = function (visible: boolean) {
            new Function("visible", "formData", "widgetFormData", widgetDatePickerData.componentFunctions.visibleChange as string)(visible, formData, widgetFormData);
        };
    }
    return events;
}
