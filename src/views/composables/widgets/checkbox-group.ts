/**
 * @fileoverview 复选组适配模块，负责选项、选择数量限制、按钮样式、数组默认值及 change 事件的转换。
 * @remarks
 * 默认值必须是与 option.value 类型一致的数组；min/max 只约束后续交互，不会自动修剪已经保存的默认值或当前值。
 * 组件可见性和禁用状态由同一个 control 配置拆分到节点状态与 Element Plus 属性，保证设计器和预览行为一致。
 */
import { randomId } from "@yujinjin/utils";
import { type WidgetFormData, type WidgetCheckboxGroupData } from "../types";

/** 注册表使用的复选组稳定 code 与组件库展示元数据。 */
export const WIDGET_CHECKBOX_GROUP = {
    code: "checkbox-group",
    name: "复选框组",
    description: "普通的复选框组",
    icon: "icon-checkbox-group"
};

/**
 * @description 创建复选组独立数据。
 * @returns 相互隔离的新复选组节点数据。
 * @remarks 默认值必须是与选项 value 类型一致的数组，空数组表示尚未选择。
 */
export function useCreateDefaultData(): WidgetCheckboxGroupData {
    // 根据组件 code 生成当前设计节点的唯一 ID。
    const id = WIDGET_CHECKBOX_GROUP.code.replace(/-/g, "_") + "_" + randomId();
    return {
        id: id,
        code: WIDGET_CHECKBOX_GROUP.code,
        name: WIDGET_CHECKBOX_GROUP.name,
        isShow: true,
        defaultValue: [],
        propName: id,
        formAttributes: {
            label: WIDGET_CHECKBOX_GROUP.name,
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
            type: "checkbox"
        },
        componentFunctions: {
            validate: null,
            change: null
        },
        settingData: {
            propName: id,
            label: WIDGET_CHECKBOX_GROUP.name,
            labelPosition: "left",
            options: [
                { value: "1", label: "选项1" },
                { value: "2", label: "选项2" },
                { value: "3", label: "选项3", disabled: true }
            ],
            defaultValue: [],
            control: [],
            type: "checkbox",
            min: null,
            max: null,
            textColor: null,
            fill: null,
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
 * @description 获取复选组运行态属性。
 * @param widgetCheckboxGroupData 当前复选组节点数据。
 * @returns componentAttributes 原始引用；选项、最少和最多选择数均已由设置同步函数写入。
 */
export function useAttributes(widgetCheckboxGroupData: WidgetCheckboxGroupData): WidgetCheckboxGroupData["componentAttributes"] {
    return widgetCheckboxGroupData.componentAttributes;
}

/**
 * @description 同步复选组设置到字段、表单项、组件属性及动态函数体。
 * @param widgetCheckboxGroupData 将被原地更新的复选组节点数据。
 * @param fileName 发生变化的设置字段。
 * @param value 设置字段的新值。
 * @returns 无返回值。
 * @remarks min/max 只限制交互选择数量，不会自动修剪已经保存的默认值，配置者需要自行保证默认数组合法。
 */
export function useSettingDataValueChange(widgetCheckboxGroupData: WidgetCheckboxGroupData, fileName: keyof WidgetCheckboxGroupData["settingData"], value: any) {
    switch (fileName) {
        case "propName":
        case "defaultValue":
            // Element Plus 复选组只接受数组；设置面板清空时也必须保持该模型不变量。
            value = Array.isArray(value) ? value : [];
            widgetCheckboxGroupData[fileName] = value;
            break;
        case "label":
        case "labelPosition":
            widgetCheckboxGroupData.formAttributes[fileName] = value;
            break;
        case "control":
            // control 的可见性和禁用状态分别落在节点数据与组件属性中。
            widgetCheckboxGroupData.componentAttributes.disabled = value.includes("disabled");
            widgetCheckboxGroupData.isShow = value.includes("isShow");
            break;
        case "options":
        case "type":
        case "min":
        case "max":
        case "textColor":
        case "fill":
            widgetCheckboxGroupData.componentAttributes[fileName] = value;
            break;
        case "required":
        case "requiredMessage":
            break;
        case "onValidate":
            widgetCheckboxGroupData.componentFunctions.validate = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onChange":
            widgetCheckboxGroupData.componentFunctions.change = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        default:
            break;
    }
    (widgetCheckboxGroupData.settingData as any)[fileName] = value;
}

/**
 * @description 创建复选组运行态事件映射。
 * @param widgetCheckboxGroupData 当前复选组节点数据。
 * @param formData 当前表单渲染值。
 * @param widgetFormData 所属表单设计数据。
 * @returns 仅包含已配置事件的映射；未配置 change 脚本时返回空对象。
 */
export function useEvents(widgetCheckboxGroupData: WidgetCheckboxGroupData, formData: Record<string, any>, widgetFormData: WidgetFormData) {
    // 收集当前组件实际配置的运行时事件处理器。
    const events: Record<string, (value: string[] | number[]) => void> = {};
    if (widgetCheckboxGroupData.componentFunctions.change) {
        /**
         * @description 执行设计器配置的 change 脚本，事件值保持 Element Plus 提供的数组。
         * @param value 当前选中的选项值数组。
         * @returns 无返回值。
         * @throws 配置脚本存在语法错误或运行时异常时原样抛出。
         */
        events.change = function (value: string[] | number[]) {
            new Function("value", "formData", "widgetFormData", widgetCheckboxGroupData.componentFunctions.change as string)(value, formData, widgetFormData);
        };
    }
    return events;
}
