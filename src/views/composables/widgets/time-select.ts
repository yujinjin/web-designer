/**
 * @fileoverview 固定时间选项组件适配模块，根据 start、end 和 step 生成可选时间列表，并管理字符串默认值与常规输入事件。
 * @remarks
 * 它不同于 time-picker：只处理格式化后的离散字符串，不支持范围数组；默认值需要落在生成列表中才能正常回显。
 * 时间格式合法性和步长解析交由 Element Plus 处理，本模块保持配置原文以便设置面板再次编辑。
 * 初始 componentAttributes.format 为 `HH:mm:ss`，settingData.format 为 `HH:mm`；首次修改格式前两处并不一致，维护默认值时需要同时核对。
 */
import { randomId } from "@yujinjin/utils";
import { type WidgetTimeSelectData, type WidgetFormData } from "@/views/composables/types";

/** 注册表使用的固定时间选项组件稳定 code 与组件库展示元数据。 */
export const WIDGET_TIME_SELECT = {
    code: "time-select",
    name: "选择时间",
    description: "选择时间",
    icon: "icon-time-select"
};

/**
 * @description 创建固定步长时间选项组件数据。
 * @returns 相互隔离的新时间选项节点数据。
 * @remarks start/end/step 共同决定可选列表，默认值应落在生成的选项范围内。
 */
export function useCreateDefaultData(): WidgetTimeSelectData {
    // 根据组件 code 生成当前设计节点的唯一 ID。
    const id = WIDGET_TIME_SELECT.code.replace(/-/g, "_") + "_" + randomId();
    return {
        id,
        code: WIDGET_TIME_SELECT.code,
        name: WIDGET_TIME_SELECT.name,
        isShow: true,
        defaultValue: null,
        propName: id,
        formAttributes: {
            label: WIDGET_TIME_SELECT.name,
            prop: id,
            required: false,
            labelPosition: "left"
        },
        componentAttributes: {
            placeholder: "请选择时间",
            format: "HH:mm:ss"
        },
        componentFunctions: {
            validate: null,
            change: null,
            blur: null,
            focus: null,
            clear: null
        },
        settingData: {
            propName: id,
            label: WIDGET_TIME_SELECT.name,
            labelPosition: "left",
            defaultValue: null,
            control: [],
            clearable: true,
            placeholder: "请选择时间",
            format: "HH:mm",
            editable: true,
            start: "09:00",
            end: "18:00",
            step: "00:30",
            minTime: null,
            maxTime: null,
            includeEndTime: false,
            required: false,
            requiredMessage: null,
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
}`
        }
    };
}

/**
 * @description 同步时间选项设置到字段、表单项、组件属性和事件函数体。
 * @param data 将被原地更新的时间选项节点数据。
 * @param fileName 发生变化的设置字段。
 * @param value 设置字段的新值。
 * @returns 无返回值。
 * @remarks 本组件与 time-picker 不同，只处理格式化后的字符串选项，不支持时间范围数组。
 */
export function useSettingDataValueChange(data: WidgetTimeSelectData, fileName: keyof WidgetTimeSelectData["settingData"], value: any) {
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
            // control 拆分为组件禁用状态和设计器节点可见性。
            data.componentAttributes.disabled = value.includes("disabled");
            data.isShow = value.includes("isShow");
            break;
        case "clearable":
        case "placeholder":
        case "format":
        case "editable":
        case "start":
        case "end":
        case "step":
        case "minTime":
        case "maxTime":
        case "includeEndTime":
            data.componentAttributes[fileName] = value;
            break;
        case "required":
        case "requiredMessage":
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
        default:
            break;
    }
    (data.settingData as any)[fileName] = value;
}

/**
 * @description 获取时间选项组件运行态属性。
 * @param widgetTimeSelectData 当前时间选项节点数据。
 * @returns componentAttributes 原始引用；start/end/step 的格式合法性由 Element Plus 解析。
 */
export function useAttributes(widgetTimeSelectData: WidgetTimeSelectData): WidgetTimeSelectData["componentAttributes"] {
    return widgetTimeSelectData.componentAttributes;
}

/**
 * @description 创建时间选项组件运行态事件映射。
 * @param widgetTimeSelectData 当前时间选项节点数据。
 * @param formData 当前表单渲染值。
 * @param widgetFormData 所属表单设计数据。
 * @returns 仅包含已配置脚本的事件映射。
 * @remarks 焦点事件注入当前字段值，clear 只注入表单上下文。
 */
export function useEvents(widgetTimeSelectData: WidgetTimeSelectData, formData: Record<string, any>, widgetFormData: WidgetFormData) {
    // 收集当前组件实际配置的运行时事件处理器。
    const events: Record<string, ((e: FocusEvent) => void) | ((value: any) => void) | (() => void)> = {};
    if (widgetTimeSelectData.componentFunctions.change) {
        /**
         * @description 执行时间选项值变更脚本。
         * @param value 当前时间字符串。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.change = function (value: any) {
            new Function("value", "formData", "widgetFormData", widgetTimeSelectData.componentFunctions.change as string)(value, formData, widgetFormData);
        };
    }
    if (widgetTimeSelectData.componentFunctions.blur) {
        /**
         * @description 执行时间选项失焦脚本并注入当前字段值。
         * @param event 原始焦点事件。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.blur = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetTimeSelectData.componentFunctions.blur as string)(event, formData[widgetTimeSelectData.id], formData, widgetFormData);
        };
    }
    if (widgetTimeSelectData.componentFunctions.focus) {
        /**
         * @description 执行时间选项聚焦脚本并注入当前字段值。
         * @param event 原始焦点事件。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.focus = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetTimeSelectData.componentFunctions.focus as string)(event, formData[widgetTimeSelectData.id], formData, widgetFormData);
        };
    }
    if (widgetTimeSelectData.componentFunctions.clear) {
        /**
         * @description 执行时间选项清空脚本。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.clear = function () {
            new Function("formData", "widgetFormData", widgetTimeSelectData.componentFunctions.clear as string)(formData, widgetFormData);
        };
    }
    return events;
}
