/**
 * @fileoverview 滑块组件适配模块，支持单值/范围、横向/纵向、输入框、刻度及提示文本格式化等配置。
 * @remarks
 * 单值与范围模式分别使用 number 和 number[]，模式切换不会隐式转换默认值，避免无法确定的业务取值被自动改写。
 * 提示格式化函数按需创建且只接收当前刻度值，使纯展示逻辑不依赖整个表单；change/input 事件则注入完整表单上下文。
 */
import { randomId } from "@yujinjin/utils";
import { type Arrayable } from "element-plus/es/utils/typescript.mjs";
import { type WidgetSliderData, type WidgetFormData } from "../types";

/** 注册表使用的滑块稳定 code 与组件库展示元数据。 */
export const WIDGET_SLIDER = {
    code: "slider",
    name: "滑动选择",
    description: "滑动选择",
    icon: "icon-slider"
};

/**
 * @description 创建滑块独立数据。
 * @returns 相互隔离的新滑块节点数据。
 * @remarks 默认值保持 null，由首次渲染阶段决定是否应用；范围模式下调用方应提供二元数组。
 */
export function useCreateDefaultData(): WidgetSliderData {
    // 根据组件 code 生成当前设计节点的唯一 ID。
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

/**
 * @description 合并滑块静态属性和提示文本格式化函数。
 * @param widgetSliderData 当前滑块节点数据。
 * @param value 当前滑块值；保留该参数用于统一适配签名，格式化脚本按组件回调参数获取刻度值。
 * @returns 新的组件属性对象，不修改原 componentAttributes。
 * @remarks 格式化脚本只获得当前刻度值，不注入整个表单，避免纯展示函数产生不必要的上下文依赖。
 */
export function useAttributes(widgetSliderData: WidgetSliderData, value?: number | number[]): WidgetSliderData["componentAttributes"] {
    // 收集由脚本配置动态生成的组件属性函数。
    const functionAttributes: Record<string, (value: number) => string> = {};
    if (widgetSliderData.componentFunctions.formatTooltip) {
        /**
         * @description 执行滑块提示文本格式化脚本。
         * @param value 当前刻度值。
         * @returns 格式化后的提示文本。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        functionAttributes.formatTooltip = function (value: number) {
            return new Function("value", widgetSliderData.componentFunctions.formatTooltip as string)(value);
        };
    }
    if (widgetSliderData.componentFunctions.formatValueText) {
        /**
         * @description 执行滑块无障碍值文本格式化脚本。
         * @param value 当前刻度值。
         * @returns 格式化后的值文本。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        functionAttributes.formatValueText = function (value: number) {
            return new Function("value", widgetSliderData.componentFunctions.formatValueText as string)(value);
        };
    }
    return Object.assign({}, widgetSliderData.componentAttributes, functionAttributes);
}

/**
 * @description 同步滑块设置到字段、表单项、组件属性和函数体。
 * @param widgetSliderData 将被原地更新的滑块节点数据。
 * @param fileName 发生变化的设置字段。
 * @param value 设置字段的新值。
 * @returns 无返回值。
 * @remarks range、min/max 等配置只改变组件属性，不自动改写已有默认值；动态源码保存为函数体，完整模板继续保留在 settingData。
 */
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
            // disabled 控制组件交互，isShow 控制设计器节点，两者来源于同一组复选设置。
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

/**
 * @description 创建滑块 change/input 事件映射。
 * @param widgetSliderData 当前滑块节点数据。
 * @param formData 当前表单渲染值。
 * @param widgetFormData 所属表单设计数据。
 * @returns 仅包含已配置脚本的事件映射。
 * @remarks 保留 Element Plus 的单值或数组值形态；当前类型声明允许脚本返回 boolean，但组件不会消费该返回值。
 */
export function useEvents(widgetSliderData: WidgetSliderData, formData: Record<string, any>, widgetFormData: WidgetFormData) {
    // 收集当前组件实际配置的运行时事件处理器。
    const events: Record<string, (value: Arrayable<number>) => boolean> = {};
    if (widgetSliderData.componentFunctions.change) {
        /**
         * @description 执行滑块 change 脚本。
         * @param value 交互结束后的单值或范围值。
         * @returns 配置脚本的原始返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.change = function (value: Arrayable<number>) {
            return new Function("value", "formData", "widgetFormData", widgetSliderData.componentFunctions.change as string)(value, formData, widgetFormData);
        };
    }
    if (widgetSliderData.componentFunctions.input) {
        /**
         * @description 执行滑块拖动过程中的 input 脚本。
         * @param value 当前单值或范围值。
         * @returns 配置脚本的原始返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.input = function (value: Arrayable<number>) {
            return new Function("value", "formData", "widgetFormData", widgetSliderData.componentFunctions.input as string)(value, formData, widgetFormData);
        };
    }
    return events;
}
