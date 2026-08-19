/**
 * @fileoverview 数字输入组件适配模块，负责数值边界、步长、精度、控制按钮及焦点/变更事件的设计态到运行态转换。
 * @remarks
 * min、max 和 precision 使用 null 表示不覆盖 Element Plus 默认行为，本模块不自动修剪已有默认值，配置者需要保证数值落在有效范围。
 * required 配置只由统一表单规则层消费，避免组件属性和校验规则各自维护一份必填逻辑。
 */
import { randomId } from "@yujinjin/utils";
import { type WidgetFormData, type WidgetInputNumberData } from "@/views/composables/types";

/** 注册表使用的数字输入稳定 code 与组件库展示元数据。 */
export const WIDGET_INPUT_NUMBER = {
    code: "input-number",
    name: "输入数字",
    description: "普通的输入数字组件",
    icon: "icon-input-number"
};

/**
 * @description 创建数字输入组件独立数据。
 * @returns 相互隔离的新数字输入节点数据。
 * @remarks 数值限制保持 null 表示不覆盖 Element Plus 默认边界。
 */
export function useCreateDefaultData(): WidgetInputNumberData {
    // 根据组件 code 生成当前设计节点的唯一 ID。
    const id = WIDGET_INPUT_NUMBER.code.replace(/-/g, "_") + "_" + randomId();
    return {
        id: id,
        code: WIDGET_INPUT_NUMBER.code,
        name: WIDGET_INPUT_NUMBER.name,
        isShow: true,
        defaultValue: null,
        propName: id,
        formAttributes: {
            label: "输入数字",
            prop: id,
            required: false,
            labelPosition: "left"
        },
        componentAttributes: {
            placeholder: "请输入",
            disabledScientific: true
        },
        componentFunctions: {
            validate: null,
            change: null,
            blur: null,
            focus: null
        },
        settingData: {
            propName: id,
            label: "输入数字",
            labelPosition: "left",
            placeholder: "请输入",
            control: [],
            defaultValue: null,
            min: null,
            max: null,
            stepStrictly: false,
            step: 1,
            precision: null,
            controls: true,
            controlsPosition: null,
            align: "center",
            required: false,
            requiredMessage: null,
            onValidate: `function onValidate(value, callback, formData, widgetFormData) {
    // 请在这里编写验证函数体逻辑，可直接使用 value, callback, formData, widgetFormData 参数
}`,
            onBlur: `function onBlur(event, value, formData, widgetFormData) {
    // 请在这里编写失去焦点事件处理函数体逻辑，可直接使用 event, value, formData, widgetFormData 参数
}`,
            onFocus: `function onFocus(event, value, formData, widgetFormData) {
    // 请在这里编写获得焦点事件处理函数体逻辑，可直接使用 event, value, formData, widgetFormData 参数
}`,
            onChange: `function onChange(value, formData, widgetFormData) {
    // 请在这里编写改变事件处理函数体逻辑，可直接使用 value, formData, widgetFormData 参数
}`
        }
    };
}

/**
 * @description 同步数字输入设置到对应运行态数据层。
 * @param data 将被原地更新的数字输入节点数据。
 * @param fileName 发生变化的设置字段。
 * @param value 设置字段的新值。
 * @returns 无返回值。
 * @remarks 默认值和 propName 属于字段根级数据，标签属于表单项，其余数值交互配置属于组件属性。required 只由统一表单规则生成器读取。
 */
export function useSettingDataValueChange(data: WidgetInputNumberData, fileName: keyof WidgetInputNumberData["settingData"], value: any) {
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
            // readonly 虽不是所有 Element Plus 版本的正式 InputNumber 属性，仍按现有设计数据透传以兼容项目封装。
            data.componentAttributes.disabled = value.includes("disabled");
            data.isShow = value.includes("isShow");
            data.componentAttributes.readonly = value.includes("readonly");
            break;
        case "placeholder":
        case "min":
        case "max":
        case "stepStrictly":
        case "step":
        case "precision":
        case "controls":
        case "controlsPosition":
        case "align":
            data.componentAttributes[fileName] = value;
            break;
        case "required":
        case "requiredMessage":
            break;
        case "onValidate":
            // 只保存函数体；完整源码继续留在 settingData 供代码编辑器回显。
            data.componentFunctions.validate = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onBlur":
            data.componentFunctions.blur = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onFocus":
            data.componentFunctions.focus = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onChange":
            data.componentFunctions.change = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        default:
            break;
    }
    (data.settingData as any)[fileName] = value;
}

/**
 * @description 获取数字输入运行态属性。
 * @param widgetInputNumberData 当前数字输入节点数据。
 * @returns componentAttributes 原始引用；调用方约定只读使用。
 */
export function useAttributes(widgetInputNumberData: WidgetInputNumberData): WidgetInputNumberData["componentAttributes"] {
    return widgetInputNumberData.componentAttributes;
}

/**
 * @description 创建数字输入运行态事件映射。
 * @param widgetInputNumberData 当前数字输入节点数据。
 * @param formData 当前表单渲染值。
 * @param widgetFormData 所属表单设计数据。
 * @returns 仅包含已配置脚本的事件映射。
 * @remarks change 同时提供新旧值，焦点事件从 formData 读取当前值。
 */
export function useEvents(widgetInputNumberData: WidgetInputNumberData, formData: Record<string, any>, widgetFormData: WidgetFormData) {
    // 收集当前组件实际配置的运行时事件处理器。
    const events: Record<string, ((e: FocusEvent) => void) | ((currentValue: number | undefined, oldValue: number | undefined) => void)> = {};
    if (widgetInputNumberData.componentFunctions.blur) {
        /**
         * @description 执行数字输入失焦脚本并注入当前字段值。
         * @param event 原始焦点事件。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.blur = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetInputNumberData.componentFunctions.blur as string)(event, formData[widgetInputNumberData.id], formData, widgetFormData);
        };
    }
    if (widgetInputNumberData.componentFunctions.focus) {
        /**
         * @description 执行数字输入聚焦脚本并注入当前字段值。
         * @param event 原始焦点事件。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.focus = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetInputNumberData.componentFunctions.focus as string)(event, formData[widgetInputNumberData.id], formData, widgetFormData);
        };
    }
    if (widgetInputNumberData.componentFunctions.change) {
        /**
         * @description 执行数字值变更脚本。
         * @param currentValue 变更后的值。
         * @param oldValue 变更前的值。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.change = function (currentValue: number | undefined, oldValue: number | undefined) {
            new Function("currentValue", "oldValue", "formData", "widgetFormData", widgetInputNumberData.componentFunctions.change as string)(currentValue, oldValue, formData, widgetFormData);
        };
    }
    return events;
}
