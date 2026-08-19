/**
 * @fileoverview 颜色选择器适配模块，维护颜色格式、透明度、清空能力及确认值/临时激活值两类事件。
 * @remarks
 * `activeChange` 表示面板交互过程中的临时颜色，`change` 表示最终模型值，二者分别包装以避免混淆业务触发时机。
 * 切换 colorFormat 或透明度模式不会转换已有颜色字符串，配置者需要保证默认值与目标格式兼容。
 */
import { randomId } from "@yujinjin/utils";
import { type WidgetColorPickerData, type WidgetFormData } from "../types";

/** 注册表使用的颜色选择器稳定 code 与组件库展示元数据。 */
export const WIDGET_COLOR_PICKER = {
    code: "color-picker",
    name: "颜色选择",
    description: "颜色选择",
    icon: "icon-color-picker"
};

/**
 * @description 创建颜色选择器独立数据。
 * @returns 相互隔离的新颜色选择器节点数据。
 * @remarks 默认值为 null，颜色字符串格式由 colorFormat/showAlpha 共同决定。
 */
export function useCreateDefaultData(): WidgetColorPickerData {
    // 根据组件 code 生成当前设计节点的唯一 ID。
    const id = WIDGET_COLOR_PICKER.code.replace(/-/g, "_") + "_" + randomId();
    return {
        id,
        code: WIDGET_COLOR_PICKER.code,
        name: WIDGET_COLOR_PICKER.name,
        isShow: true,
        defaultValue: null,
        propName: id,
        formAttributes: {
            label: WIDGET_COLOR_PICKER.name,
            labelPosition: "left",
            prop: id,
            required: false
        },
        componentAttributes: {
            clearable: false
        },
        componentFunctions: {
            validate: null,
            change: null,
            blur: null,
            focus: null,
            clear: null,
            activeChange: null
        },
        settingData: {
            propName: id,
            label: WIDGET_COLOR_PICKER.name,
            labelPosition: "left",
            control: [],
            defaultValue: null,
            required: false,
            requiredMessage: null,
            clearable: false,
            showAlpha: false,
            colorFormat: "hex",
            onValidate: `function onValidate(value, callback, formData, widgetFormData) {
    // 请在这里编写验证函数体逻辑，可直接使用 value, callback, formData, widgetFormData 参数
}`,
            onChange: `function onChange(value, formData, widgetFormData) {
    // 请在这里编写改变事件处理函数体逻辑，可直接使用 value, formData, widgetFormData 参数
}`,
            onActiveChange: `function onActiveChange(value, formData, widgetFormData) {
    // 请在这里编写激活事件处理函数体逻辑，可直接使用 value, formData, widgetFormData 参数
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
 * @description 获取颜色选择器运行态属性。
 * @param widgetColorPickerData 当前颜色选择器节点数据。
 * @returns componentAttributes 原始引用；渲染层不得直接修改。
 */
export function useAttributes(widgetColorPickerData: WidgetColorPickerData): WidgetColorPickerData["componentAttributes"] {
    return widgetColorPickerData.componentAttributes;
}

/**
 * @description 同步颜色设置和动态事件函数体。
 * @param widgetColorPickerData 将被原地更新的颜色选择器节点数据。
 * @param fileName 发生变化的设置字段。
 * @param value 设置字段的新值。
 * @returns 无返回值。
 * @remarks colorFormat 或透明度模式变化不会转换已有颜色值，配置者需保证默认值与目标格式兼容，否则组件可能回显为空。
 */
export function useSettingDataValueChange(widgetColorPickerData: WidgetColorPickerData, fileName: keyof WidgetColorPickerData["settingData"], value: any) {
    console.log(fileName, value);
    switch (fileName) {
        case "propName":
            widgetColorPickerData.propName = value;
            break;
        case "label":
        case "labelPosition":
            widgetColorPickerData.formAttributes[fileName] = value;
            break;
        case "control":
            // 设置面板将禁用与可见性合并展示，运行态需分别写入组件属性和节点状态。
            widgetColorPickerData.componentAttributes.disabled = value.includes("disabled");
            widgetColorPickerData.isShow = value.includes("isShow");
            break;
        case "clearable":
        case "showAlpha":
        case "colorFormat":
            widgetColorPickerData.componentAttributes[fileName] = value;
            break;
        case "required":
        case "requiredMessage":
            break;
        case "onValidate":
            widgetColorPickerData.componentFunctions.validate = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onChange":
            widgetColorPickerData.componentFunctions.change = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onActiveChange":
            widgetColorPickerData.componentFunctions.activeChange = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onBlur":
            widgetColorPickerData.componentFunctions.blur = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onFocus":
            widgetColorPickerData.componentFunctions.focus = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onClear":
            widgetColorPickerData.componentFunctions.clear = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        default:
            break;
    }
    (widgetColorPickerData.settingData as any)[fileName] = value;
}

/**
 * @description 创建颜色选择器运行态事件映射。
 * @param widgetColorPickerData 当前颜色选择器节点数据。
 * @param formData 当前表单渲染值。
 * @param widgetFormData 所属表单设计数据。
 * @returns 仅包含已配置脚本的事件映射。
 * @remarks activeChange 表示面板交互中的临时颜色，change 表示确认后的模型值，两者不能合并。
 */
export function useEvents(widgetColorPickerData: WidgetColorPickerData, formData: Record<string, any>, widgetFormData: WidgetFormData) {
    // 收集当前组件实际配置的运行时事件处理器。
    const events: Record<string, ((e: FocusEvent) => void) | ((value: any) => void) | (() => void)> = {};
    if (widgetColorPickerData.componentFunctions.change) {
        /**
         * @description 执行最终颜色值变更脚本。
         * @param value 确认后的颜色值。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.change = function (value: any) {
            new Function("value", "formData", "widgetFormData", widgetColorPickerData.componentFunctions.change as string)(value, formData, widgetFormData);
        };
    }
    if (widgetColorPickerData.componentFunctions.blur) {
        /**
         * @description 执行颜色选择器失焦脚本并注入当前字段值。
         * @param event 原始焦点事件。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.blur = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetColorPickerData.componentFunctions.blur as string)(event, formData[widgetColorPickerData.id], formData, widgetFormData);
        };
    }
    if (widgetColorPickerData.componentFunctions.focus) {
        /**
         * @description 执行颜色选择器聚焦脚本并注入当前字段值。
         * @param event 原始焦点事件。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.focus = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetColorPickerData.componentFunctions.focus as string)(event, formData[widgetColorPickerData.id], formData, widgetFormData);
        };
    }
    if (widgetColorPickerData.componentFunctions.clear) {
        /**
         * @description 执行清空颜色脚本。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.clear = function () {
            new Function("formData", "widgetFormData", widgetColorPickerData.componentFunctions.clear as string)(formData, widgetFormData);
        };
    }
    if (widgetColorPickerData.componentFunctions.activeChange) {
        /**
         * @description 执行颜色面板交互过程中的临时值脚本。
         * @param value 当前激活但未必最终确认的颜色值。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.activeChange = function (value: any) {
            new Function("value", "formData", "widgetFormData", widgetColorPickerData.componentFunctions.activeChange as string)(value, formData, widgetFormData);
        };
    }
    return events;
}
