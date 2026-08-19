/**
 * @fileoverview 评分组件适配模块，管理最大分值、半星、颜色阈值、文本/分数显示及 change 事件。
 * @remarks
 * 最大值和阈值直接交由 Element Plus 解释，本模块不主动交换阈值或裁剪默认值，以免静默改变业务配置。
 * 运行属性保持可序列化，只有实际配置的事件脚本会在渲染阶段创建函数包装。
 */
import { randomId } from "@yujinjin/utils";
import { type WidgetFormData, type WidgetRateData } from "../types";

/** 注册表使用的评分组件稳定 code 与组件库展示元数据。 */
export const WIDGET_RATE = {
    code: "rate",
    name: "评分",
    description: "评分",
    icon: "icon-rate"
};

/**
 * @description 创建评分组件独立数据。
 * @returns 相互隔离的新评分节点数据。
 * @remarks 阈值、最大分值和半星配置共同决定合法值范围，但适配层不主动修剪默认值。
 */
export function useCreateDefaultData(): WidgetRateData {
    // 根据组件 code 生成当前设计节点的唯一 ID。
    const id = WIDGET_RATE.code.replace(/-/g, "_") + "_" + randomId();
    return {
        id,
        code: WIDGET_RATE.code,
        name: WIDGET_RATE.name,
        isShow: true,
        defaultValue: null,
        propName: id,
        formAttributes: {
            prop: id,
            required: false,
            label: WIDGET_RATE.name,
            labelPosition: "left"
        },
        componentAttributes: {
            max: 5
        },
        componentFunctions: {
            validate: null,
            change: null
        },
        settingData: {
            propName: id,
            label: WIDGET_RATE.name,
            labelPosition: "left",
            defaultValue: null,
            control: [],
            max: 5,
            allowHalf: false,
            lowThreshold: 2,
            highThreshold: 4,
            showText: true,
            showScore: true,
            textColor: null,
            clearable: true,
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

/**
 * @description 同步评分组件设置到字段、表单项、组件属性和脚本函数体。
 * @param widgetRateData 将被原地更新的评分节点数据。
 * @param fileName 发生变化的设置字段。
 * @param value 设置字段的新值。
 * @returns 无返回值。
 * @remarks lowThreshold/highThreshold 由 Element Plus 解释颜色分段，当前层保留用户值，不自动交换或限制顺序。
 */
export function useSettingDataValueChange(widgetRateData: WidgetRateData, fileName: keyof WidgetRateData["settingData"], value: any) {
    switch (fileName) {
        case "defaultValue":
        case "propName":
            widgetRateData[fileName] = value;
            break;
        case "label":
        case "labelPosition":
            widgetRateData.formAttributes[fileName] = value;
            break;
        case "control":
            widgetRateData.componentAttributes.disabled = value.includes("disabled");
            widgetRateData.isShow = value.includes("isShow");
            break;
        case "allowHalf":
        case "lowThreshold":
        case "highThreshold":
        case "showText":
        case "showScore":
        case "max":
        case "textColor":
        case "clearable":
            widgetRateData.componentAttributes[fileName] = value;
            break;
        case "required":
        case "requiredMessage":
            break;
        case "onValidate":
            widgetRateData.componentFunctions.validate = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onChange":
            widgetRateData.componentFunctions.change = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        default:
            break;
    }
    (widgetRateData.settingData as any)[fileName] = value;
}

/**
 * @description 获取评分组件运行态属性。
 * @param widgetRateData 当前评分节点数据。
 * @returns componentAttributes 原始引用；调用方约定只读消费。
 */
export function useAttributes(widgetRateData: WidgetRateData): WidgetRateData["componentAttributes"] {
    return widgetRateData.componentAttributes;
}

/**
 * @description 创建评分组件运行态事件映射。
 * @param widgetRateData 当前评分节点数据。
 * @param formData 当前表单渲染值。
 * @param widgetFormData 所属表单设计数据。
 * @returns 未配置 change 脚本时为空的事件映射。
 */
export function useEvents(widgetRateData: WidgetRateData, formData: Record<string, any>, widgetFormData: WidgetFormData) {
    // 收集当前组件实际配置的运行时事件处理器。
    const events: Record<string, ((value: any) => void) | (() => void)> = {};
    if (widgetRateData.componentFunctions.change) {
        /**
         * @description 执行评分值变更脚本并注入表单上下文。
         * @param value 当前评分值。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.change = function (value: any) {
            new Function("value", "formData", "widgetFormData", widgetRateData.componentFunctions.change as string)(value, formData, widgetFormData);
        };
    }
    return events;
}
