/**
 * @fileoverview 单选组适配模块，统一管理选项、展示形态、按钮样式、字段默认值及 change 事件。
 * @remarks
 * 选项同时存在于设置态和运行属性中，所有修改必须经过同步入口；默认值与 option.value 采用严格类型匹配，字符串、数字和布尔值不能混用。
 * 事件映射仅在配置了脚本时创建，避免给每个单选组绑定无行为处理器。
 */
import { randomId } from "@yujinjin/utils";
import { type WidgetFormData, type WidgetRadioGroupData } from "../types";

/** 注册表使用的单选组稳定 code 与组件库展示元数据。 */
export const WIDGET_RADIO_GROUP = {
    code: "radio-group",
    name: "单选框组",
    description: "普通的单选框组",
    icon: "icon-radio"
};

/**
 * @description 创建单选组独立数据。
 * @returns 相互隔离的新单选组节点数据。
 * @remarks 选项分别存在设置态和组件属性中，修改必须经过同步入口，避免预览与设置面板不一致。
 */
export function useCreateDefaultData(): WidgetRadioGroupData {
    // 根据组件 code 生成当前设计节点的唯一 ID。
    const id = WIDGET_RADIO_GROUP.code.replace(/-/g, "_") + "_" + randomId();
    return {
        id: id,
        code: WIDGET_RADIO_GROUP.code,
        name: WIDGET_RADIO_GROUP.name,
        isShow: true,
        defaultValue: null,
        propName: id,
        formAttributes: {
            label: "单选框",
            prop: id,
            required: false,
            labelPosition: "left"
        },
        componentAttributes: {
            options: [
                { value: "1", label: "选项1" },
                { value: "2", label: "选项2" },
                { value: "3", label: "选项3", disabled: true }
            ],
            disabled: false,
            type: "radio"
        },
        componentFunctions: {
            validate: null,
            change: null
        },
        settingData: {
            propName: id,
            label: "单选框",
            labelPosition: "left",
            options: [
                { value: "1", label: "选项1" },
                { value: "2", label: "选项2" },
                { value: "3", label: "选项3", disabled: true }
            ],
            defaultValue: null,
            control: [],
            type: "radio",
            required: false,
            requiredMessage: null,
            textColor: null,
            fill: null,
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
 * @description 获取单选组运行态属性。
 * @param widgetRadioGroupData 当前单选组节点数据。
 * @returns componentAttributes 原始引用；渲染层只消费，不负责修改选项或样式配置。
 */
export function useAttributes(widgetRadioGroupData: WidgetRadioGroupData): WidgetRadioGroupData["componentAttributes"] {
    return widgetRadioGroupData.componentAttributes;
}

/**
 * @description 同步单选组字段、表单项和组件属性，并把脚本模板转换为运行时函数体。
 * @param widgetRadioGroupData 将被原地更新的单选组节点数据。
 * @param fileName 发生变化的设置字段。
 * @param value 设置字段的新值。
 * @returns 无返回值。
 * @remarks 选项值允许字符串、数字或布尔值，默认值类型必须与 option.value 保持一致，否则 Element Plus 无法选中对应项。
 */
export function useSettingDataValueChange(widgetRadioGroupData: WidgetRadioGroupData, fileName: keyof WidgetRadioGroupData["settingData"], value: any) {
    switch (fileName) {
        case "defaultValue":
        case "propName":
            widgetRadioGroupData[fileName] = value;
            break;
        case "label":
        case "labelPosition":
            widgetRadioGroupData.formAttributes[fileName] = value;
            break;
        case "control":
            // 可见性属于设计器节点，disabled 属于单选组组件，需要从 control 分别同步。
            widgetRadioGroupData.componentAttributes.disabled = value.includes("disabled");
            widgetRadioGroupData.isShow = value.includes("isShow");
            break;
        case "options":
        case "type":
        case "textColor":
        case "fill":
            widgetRadioGroupData.componentAttributes[fileName] = value;
            break;
        case "required":
        case "requiredMessage":
            break;
        case "onValidate":
            widgetRadioGroupData.componentFunctions.validate = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onChange":
            widgetRadioGroupData.componentFunctions.change = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
    }
    (widgetRadioGroupData.settingData as any)[fileName] = value;
}

/**
 * @description 创建单选组运行态事件映射。
 * @param widgetRadioGroupData 当前单选组节点数据。
 * @param formData 当前表单渲染值。
 * @param widgetFormData 所属表单设计数据。
 * @returns 仅包含已配置事件的映射；未配置 change 脚本时返回空对象。
 */
export function useEvents(widgetRadioGroupData: WidgetRadioGroupData, formData: Record<string, any>, widgetFormData: WidgetFormData) {
    // 收集当前组件实际配置的运行时事件处理器。
    const events: Record<string, (value: string | number | boolean) => void> = {};
    if (widgetRadioGroupData.componentFunctions.change) {
        /**
         * @description 执行设计器配置的 change 脚本。
         * @param value 当前选中的单选值。
         * @returns 无返回值。
         * @throws 配置脚本存在语法错误或运行时异常时原样抛出。
         */
        events.change = function (value: string | number | boolean) {
            new Function("value", "formData", "widgetFormData", widgetRadioGroupData.componentFunctions.change as string)(value, formData, widgetFormData);
        };
    }
    return events;
}
