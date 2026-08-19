/**
 * @fileoverview 时间选择器适配模块，支持单时间与时间范围模式，并负责设置同步、禁用时分秒脚本及事件绑定。
 * @remarks
 * 单值和范围值的数据形态不同，模式切换时同时清理根级默认值和设置态副本，防止设置面板保留组件无法解析的旧值。
 * 禁用规则在渲染阶段按需转换为 Element Plus 回调，当前字段值通过闭包注入；未配置规则时只返回静态属性，减少无意义函数创建。
 * 用户脚本需要返回合法的禁用索引数组，其语法和运行错误由组件调用链处理。
 * `visibleChange` 可以在设置态保存，但当前 useEvents 尚未输出该事件；接入时需要补齐事件映射而不是只增加编辑项。
 */
import { randomId } from "@yujinjin/utils";
import { type Dayjs } from "dayjs";
import { type WidgetFormData, type WidgetTimePickerData } from "../types";

/** 注册表使用的时间选择器稳定 code 与组件库展示元数据。 */
export const WIDGET_TIME_PICKER = {
    code: "time-picker",
    name: "时间选择器",
    description: "时间选择器",
    icon: "icon-time-picker"
};

/**
 * @description 创建可选择单个时间或时间范围的独立设计数据。
 * @returns 相互隔离的新时间选择器节点数据。
 * @remarks 初始采用单值字符串模式。
 */
export function useCreateDefaultData(): WidgetTimePickerData {
    // 根据组件 code 生成当前设计节点的唯一 ID。
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

/**
 * @description 同步时间选择器设置到运行态数据。
 * @param data 将被原地更新的时间选择器节点数据。
 * @param fileName 发生变化的设置字段。
 * @param value 设置字段的新值。
 * @returns 无返回值。
 * @remarks 单值与范围模式分别要求标量和数组，切换 isRange 时必须清空根级及设置态默认值。
 */
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
            // 显示状态属于设计器节点，禁用和只读是组件属性，因此不能只维护 settingData。
            data.componentAttributes.disabled = value.includes("disabled");
            data.isShow = value.includes("isShow");
            data.componentAttributes.readonly = value.includes("readonly");
            break;
        case "isRange":
            data.componentAttributes.isRange = value;
            // 两处存储都清理，确保首次渲染值与设置面板回显一致。
            data.defaultValue = null;
            data.settingData.defaultValue = null;
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
            // 从完整函数模板中提取函数体，运行时再按 Element Plus 回调签名注入参数。
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

/**
 * @description 获取时间组件属性，并把可选的禁用时分秒脚本包装为真正回调。
 * @param widgetTimePickerData 当前时间选择器节点数据。
 * @param value 当前字段值，供禁用规则读取。
 * @returns 合并静态属性与已配置禁用回调的新对象。
 * @remarks 脚本需返回 Element Plus 约定的禁用索引数组，且只应来自可信设计配置。
 */
export function useAttributes(widgetTimePickerData: WidgetTimePickerData, value: number | string | object): WidgetTimePickerData["componentAttributes"] {
    // 收集由脚本配置动态生成的组件属性函数。
    const functionAttributes: Record<
        string,
        | ((role: string, comparingDate?: Dayjs) => number[])
        | ((hour: number, role: string, comparingDate?: Dayjs) => number[])
        | ((hour: number, minute: number, role: string, comparingDate?: Dayjs) => number[])
    > = {};
    if (widgetTimePickerData.componentFunctions.disabledHours) {
        /**
         * @description 计算当前面板角色下禁用的小时选项。
         * @param role 范围选择器的开始或结束面板角色。
         * @param comparingDate 用于范围比较的另一端时间。
         * @returns 禁用小时索引数组。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        functionAttributes.disabledHours = function (role: string, comparingDate?: Dayjs) {
            return new Function("role", "comparingDate", "value", widgetTimePickerData.componentFunctions.disabledHours as string)(role, comparingDate, value);
        };
    }
    if (widgetTimePickerData.componentFunctions.disabledMinutes) {
        /**
         * @description 计算指定小时下禁用的分钟选项。
         * @param hour 当前小时。
         * @param role 范围选择器的开始或结束面板角色。
         * @param comparingDate 用于范围比较的另一端时间。
         * @returns 禁用分钟索引数组。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        functionAttributes.disabledMinutes = function (hour: number, role: string, comparingDate?: Dayjs) {
            return new Function("hour", "role", "comparingDate", "value", widgetTimePickerData.componentFunctions.disabledMinutes as string)(hour, role, comparingDate, value);
        };
    }
    if (widgetTimePickerData.componentFunctions.disabledSeconds) {
        /**
         * @description 计算指定小时和分钟下禁用的秒选项。
         * @param hour 当前小时。
         * @param minute 当前分钟。
         * @param role 范围选择器的开始或结束面板角色。
         * @param comparingDate 用于范围比较的另一端时间。
         * @returns 禁用秒索引数组。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        functionAttributes.disabledSeconds = function (hour: number, minute: number, role: string, comparingDate?: Dayjs) {
            return new Function("hour", "minute", "role", "comparingDate", "value", widgetTimePickerData.componentFunctions.disabledSeconds as string)(hour, minute, role, comparingDate, value);
        };
    }
    return Object.assign({}, widgetTimePickerData.componentAttributes, functionAttributes);
}

/**
 * @description 创建已启用的时间组件事件映射。
 * @param widgetTimePickerData 当前时间选择器节点数据。
 * @param formData 当前表单渲染值。
 * @param widgetFormData 所属表单设计数据。
 * @returns 仅包含已配置脚本的事件映射。
 * @remarks 焦点事件读取 formData 中的实时值，而不是可能已经过期的默认值；visibleChange 当前未输出。
 */
export function useEvents(widgetTimePickerData: WidgetTimePickerData, formData: Record<string, any>, widgetFormData: WidgetFormData) {
    // 收集当前组件实际配置的运行时事件处理器。
    const events: Record<string, ((e: FocusEvent) => void) | ((value: any) => void) | (() => void)> = {};
    if (widgetTimePickerData.componentFunctions.change) {
        /**
         * @description 执行时间值变更脚本。
         * @param value 当前单时间或时间范围值。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.change = function (value: any) {
            new Function("value", "formData", "widgetFormData", widgetTimePickerData.componentFunctions.change as string)(value, formData, widgetFormData);
        };
    }
    if (widgetTimePickerData.componentFunctions.blur) {
        /**
         * @description 执行时间选择器失焦脚本并注入当前字段值。
         * @param event 原始焦点事件。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.blur = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetTimePickerData.componentFunctions.blur as string)(event, formData[widgetTimePickerData.id], formData, widgetFormData);
        };
    }
    if (widgetTimePickerData.componentFunctions.focus) {
        /**
         * @description 执行时间选择器聚焦脚本并注入当前字段值。
         * @param event 原始焦点事件。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.focus = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetTimePickerData.componentFunctions.focus as string)(event, formData[widgetTimePickerData.id], formData, widgetFormData);
        };
    }
    if (widgetTimePickerData.componentFunctions.clear) {
        /**
         * @description 执行时间清空脚本。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.clear = function () {
            new Function("formData", "widgetFormData", widgetTimePickerData.componentFunctions.clear as string)(formData, widgetFormData);
        };
    }
    return events;
}
