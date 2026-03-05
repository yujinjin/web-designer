import { randomId } from "@yujinjin/utils";
import { type WidgetSelectData, type WidgetFormData } from "@/views/composables/types";

export const WIDGET_SELECT = {
    code: "select",
    name: "选择器",
    description: "下拉选择器",
    icon: "icon-select"
};

// 创建默认数据
export function useCreateDefaultData(): WidgetSelectData {
    const id = WIDGET_SELECT.code + "_" + randomId();
    return {
        id,
        code: WIDGET_SELECT.code,
        name: WIDGET_SELECT.name,
        isShow: true,
        defaultValue: null,
        propName: id,
        formAttributes: {
            label: WIDGET_SELECT.name,
            prop: id,
            required: false,
            labelPosition: "left"
        },
        componentAttributes: {
            placeholder: "请选择",
            options: [
                { value: "1", label: "选项1" },
                { value: "2", label: "选项2" },
                { value: "3", label: "选项3", disabled: true }
            ]
        },
        componentFunctions: {
            validate: null,
            change: null,
            blur: null,
            focus: null,
            clear: null,
            removeTag: null,
            visibleChange: null,
            filterMethod: null,
            remoteMethod: null
        },
        settingData: {
            propName: id,
            label: WIDGET_SELECT.name,
            labelPosition: "left",
            options: [
                { value: "1", label: "选项1" },
                { value: "2", label: "选项2" },
                { value: "3", label: "选项3", disabled: true }
            ],
            defaultValue: null,
            control: ["isShow"],
            multiple: false,
            multipleLimit: null,
            filterable: false,
            clearable: false,
            placeholder: "请选择",
            collapseTags: false,
            maxCollapseTags: null,
            collapseTagsTooltip: false,
            allowCreate: false,
            remote: false,
            required: false,
            requiredMessage: null,
            remoteMethod: `async function onRemoteMethod(query, widgetSelectData) {
    // 请在这里编写远程方法函数体逻辑，可直接使用 query, widgetSelectData 参数
}`,
            filterMethod: `function onFilterMethod(value, formData, widgetFormData) {
    // 请在这里编写过滤方法函数体逻辑，可直接使用 value, formData, widgetFormData 参数
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
            onRemoveTag: `function onRemoveTag(tagValue, formData, widgetFormData) {
    // 请在这里编写移除标签事件处理函数体逻辑，可直接使用 tagValue, formData, widgetFormData 参数
}`,
            onVisibleChange: `function onVisibleChange(visible, formData, widgetFormData) {
    // 请在这里编写可见性改变事件处理函数体逻辑，可直接使用 visible, formData, widgetFormData 参数
}`
        }
    };
}

// 选择器属性处理
export function useAttributes(widgetSelectData: WidgetSelectData) {
    const functionAttributes: Record<string, (query: string) => void> = {};
    if (widgetSelectData.componentFunctions.remoteMethod) {
        functionAttributes.remoteMethod = function (query: string) {
            new Function("query", "widgetSelectData", widgetSelectData.componentFunctions.remoteMethod as string)(query, widgetSelectData);
        };
    }
    if (widgetSelectData.componentFunctions.filterMethod) {
        functionAttributes.filterMethod = function (value: string) {
            new Function("value", "widgetSelectData", widgetSelectData.componentFunctions.filterMethod as string)(value, widgetSelectData);
        };
    }
    return Object.assign({}, widgetSelectData.componentAttributes, functionAttributes);
}

// 选择器设置数据值改变时处理
export function useSettingDataValueChange(widgetSelectData: WidgetSelectData, fileName: keyof WidgetSelectData["settingData"], value: any) {
    switch (fileName) {
        case "propName":
        case "defaultValue":
            widgetSelectData[fileName] = value;
            break;
        case "label":
        case "labelPosition":
            widgetSelectData.formAttributes[fileName] = value;
            break;
        case "control":
            widgetSelectData.componentAttributes.disabled = value.includes("disabled");
            widgetSelectData.isShow = value.includes("isShow");
            break;
        case "placeholder":
        case "options":
        case "multiple":
        case "multipleLimit":
        case "filterable":
        case "clearable":
        case "collapseTags":
        case "maxCollapseTags":
        case "collapseTagsTooltip":
        case "allowCreate":
        case "remote":
            widgetSelectData.componentAttributes[fileName] = value;
            break;
        case "required":
        case "requiredMessage":
            break;
        case "remoteMethod":
            widgetSelectData.componentFunctions.remoteMethod = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "filterMethod":
            widgetSelectData.componentFunctions.filterMethod = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onValidate":
            widgetSelectData.componentFunctions.validate = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onChange":
            widgetSelectData.componentFunctions.change = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onBlur":
            widgetSelectData.componentFunctions.blur = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onFocus":
            widgetSelectData.componentFunctions.focus = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onClear":
            widgetSelectData.componentFunctions.clear = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onRemoveTag":
            widgetSelectData.componentFunctions.removeTag = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onVisibleChange":
            widgetSelectData.componentFunctions.visibleChange = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        default:
            break;
    }
    (widgetSelectData.settingData as any)[fileName] = value;
}

// 处理事件值改变时处理
export function useEvents(widgetSelectData: WidgetSelectData, formData: Record<string, any>, widgetFormData: WidgetFormData) {
    const events: Record<string, ((e: FocusEvent) => void) | ((value: any) => void) | (() => void)> = {};
    if (widgetSelectData.componentFunctions.change) {
        events.change = function (value: any) {
            new Function("value", "formData", "widgetFormData", widgetSelectData.componentFunctions.change as string)(value, formData, widgetFormData);
        };
    }
    if (widgetSelectData.componentFunctions.blur) {
        events.blur = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetSelectData.componentFunctions.blur as string)(event, formData[widgetSelectData.id], formData, widgetFormData);
        };
    }
    if (widgetSelectData.componentFunctions.focus) {
        events.focus = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetSelectData.componentFunctions.focus as string)(event, formData[widgetSelectData.id], formData, widgetFormData);
        };
    }
    if (widgetSelectData.componentFunctions.clear) {
        events.clear = function () {
            new Function("formData", "widgetFormData", widgetSelectData.componentFunctions.clear as string)(formData, widgetFormData);
        };
    }
    if (widgetSelectData.componentFunctions.removeTag) {
        events.removeTag = function (tagValue: any) {
            new Function("tagValue", "formData", "widgetFormData", widgetSelectData.componentFunctions.removeTag as string)(tagValue, formData, widgetFormData);
        };
    }
    if (widgetSelectData.componentFunctions.visibleChange) {
        events.visibleChange = function (visible: boolean) {
            new Function("visible", "formData", "widgetFormData", widgetSelectData.componentFunctions.visibleChange as string)(visible, formData, widgetFormData);
        };
    }
    return events;
}
