/**
 * @fileoverview 开关组件适配模块，维护布尔默认值、提示文案、校验事件和切换前异步拦截逻辑。
 * @remarks
 * 默认值使用布尔类型以满足 Element Plus 的严格匹配；字符串 `"true"`/`"false"` 会导致设置面板选中状态与实际值不一致。
 * `beforeChange` 作为组件属性按需包装，可返回 boolean 或 Promise<boolean> 决定是否允许切换；拒绝和异常由组件调用链处理。
 */
import { randomId } from "@yujinjin/utils";
import { type WidgetFormData, type WidgetSwitchData } from "../types";

/** 注册表使用的开关稳定 code 与组件库展示元数据。 */
export const WIDGET_SWITCH = {
    code: "switch",
    name: "开关",
    description: "开关",
    icon: "icon-switch"
};

/**
 * @description 创建开关独立数据。
 * @returns 相互隔离的新开关节点数据。
 * @remarks 默认值使用布尔值而不是字符串，确保设置面板单选项和 ElSwitch 严格相等匹配。
 */
export function useCreateDefaultData(): WidgetSwitchData {
    // 根据组件 code 生成当前设计节点的唯一 ID。
    const id = WIDGET_SWITCH.code.replace(/-/g, "_") + "_" + randomId();
    return {
        id,
        code: WIDGET_SWITCH.code,
        name: WIDGET_SWITCH.name,
        isShow: true,
        defaultValue: false,
        propName: id,
        formAttributes: {
            label: WIDGET_SWITCH.name,
            prop: id,
            required: false,
            labelPosition: "left"
        },
        componentAttributes: {
            loading: false
        },
        componentFunctions: {
            validate: null,
            change: null,
            beforeChange: null
        },
        settingData: {
            propName: id,
            label: WIDGET_SWITCH.name,
            labelPosition: "left",
            activeText: null,
            inactiveText: null,
            control: [],
            defaultValue: false,
            required: false,
            requiredMessage: null,
            inlinePrompt: null,
            beforeChange: `async function beforeChange(value) {
    // 请在这里编写改变事件处理函数体逻辑，可直接使用 value 参数
}`,
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
 * @description 同步开关设置到字段、表单项、组件属性和函数体。
 * @param widgetSwitchData 将被原地更新的开关节点数据。
 * @param fileName 发生变化的设置字段。
 * @param value 设置字段的新值。
 * @returns 无返回值。
 * @remarks `beforeChange` 与普通事件不同，它是决定本次切换能否继续的组件属性函数，因此由 useAttributes 包装。
 */
export function useSettingDataValueChange(widgetSwitchData: WidgetSwitchData, fileName: keyof WidgetSwitchData["settingData"], value: any) {
    switch (fileName) {
        case "defaultValue":
        case "propName":
            widgetSwitchData[fileName] = value;
            break;
        case "label":
        case "labelPosition":
            widgetSwitchData.formAttributes[fileName] = value;
            break;
        case "control":
            widgetSwitchData.componentAttributes.disabled = value.includes("disabled");
            widgetSwitchData.isShow = value.includes("isShow");
            break;
        case "activeText":
        case "inactiveText":
        case "inlinePrompt":
            widgetSwitchData.componentAttributes[fileName] = value;
            break;
        case "required":
        case "requiredMessage":
            break;
        case "beforeChange":
            // 设置态保留 async 函数声明，运行态只保留函数体；返回值必须满足 Element Plus 的 boolean/Promise<boolean> 约定。
            widgetSwitchData.componentFunctions.beforeChange = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onValidate":
            widgetSwitchData.componentFunctions.validate = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onChange":
            widgetSwitchData.componentFunctions.change = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        default:
            break;
    }
    (widgetSwitchData.settingData as any)[fileName] = value;
}

/**
 * @description 合并开关静态属性与异步 beforeChange。
 * @param widgetSwitchData 当前开关节点数据。
 * @param value 当前开关值，供 beforeChange 脚本判断。
 * @returns 新的组件属性对象，不修改原 componentAttributes。
 * @remarks 当前值通过闭包注入脚本；脚本拒绝或抛错会阻止切换并由组件调用链处理，本层不转换为允许状态。
 */
export function useAttributes(widgetSwitchData: WidgetSwitchData, value: number | string | boolean): WidgetSwitchData["componentAttributes"] {
    // 收集由脚本配置动态生成的组件属性函数和值。
    const functionAttributes: Record<string, (() => Promise<boolean>) | boolean> = {};
    if (widgetSwitchData.componentFunctions.beforeChange) {
        /**
         * @description 执行切换前拦截脚本。
         * @returns 是否允许本次切换的异步结果。
         * @throws 配置脚本语法错误、执行失败或 Promise 拒绝时原样传播。
         */
        functionAttributes.beforeChange = async function () {
            return (await new Function("value", widgetSwitchData.componentFunctions.beforeChange as string)(value)) as Promise<boolean>;
        };
    }
    return Object.assign({}, widgetSwitchData.componentAttributes, functionAttributes);
}

/**
 * @description 创建开关运行态事件映射。
 * @param widgetSwitchData 当前开关节点数据。
 * @param formData 当前表单渲染值。
 * @param widgetFormData 所属表单设计数据。
 * @returns 未配置 change 脚本时为空的事件映射。
 * @remarks 校验函数由统一表单规则层处理，不在此重复绑定。
 */
export function useEvents(widgetSwitchData: WidgetSwitchData, formData: Record<string, any>, widgetFormData: WidgetFormData) {
    // 收集当前组件实际配置的运行时事件处理器。
    const events: Record<string, (value: any) => void> = {};
    if (widgetSwitchData.componentFunctions.change) {
        /**
         * @description 执行开关值变更脚本。
         * @param value 变更后的开关值。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.change = function (value: any) {
            new Function("value", "formData", "widgetFormData", widgetSwitchData.componentFunctions.change as string)(value, formData, widgetFormData);
        };
    }
    return events;
}
