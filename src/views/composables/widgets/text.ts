/**
 * @fileoverview 文本框适配模块，覆盖单行输入和 textarea 两种模式，并负责属性、格式化函数、校验函数及输入事件的转换。
 * @remarks
 * 类型切换时只在 textarea 模式补充 `rows`，切回普通输入后删除该属性，避免无效配置继续透传给 Element Plus。
 * formatter/parser 设计为仅对普通文本模式生效；当前设置同步仍把模板文本写入 componentAttributes，尚未填充 useAttributes 读取的函数容器，调整该能力时需同步两处映射。
 * 动态事件通过受控参数执行；字段 id、propName 和表单校验 prop 始终保持同一身份链。
 */
import { randomId } from "@yujinjin/utils";
import { type WidgetTextData, type WidgetFormData } from "../types";

/** 注册表使用的文本框稳定 code 与组件库展示元数据；未知组件创建和属性适配也以文本框作为兼容回退。 */
export const WIDGET_TEXT = {
    code: "text",
    name: "文本框",
    description: "普通的文本输入框",
    icon: "icon-input"
};

/**
 * @description 创建文本框独立数据。
 * @returns 相互隔离的新文本框节点数据。
 * @remarks 同一 id 同时作为渲染值键、默认 propName 和表单校验 prop，复制组件时三者必须一起重建。
 */
export function useCreateDefaultData(): WidgetTextData {
    // 根据组件 code 生成当前设计节点的唯一 ID。
    const id = WIDGET_TEXT.code.replace(/-/g, "_") + "_" + randomId();
    return {
        id: id,
        code: WIDGET_TEXT.code,
        name: WIDGET_TEXT.name,
        isShow: true,
        defaultValue: null,
        propName: id,
        formAttributes: {
            label: "文本框",
            prop: id,
            required: false,
            labelPosition: "left"
        },
        componentAttributes: {
            type: "text",
            placeholder: "请输入内容",
            showWordLimit: false,
            disabled: false,
            clearable: true,
            readonly: false,
            maxlength: undefined,
            minlength: undefined
        },
        componentFunctions: {
            validate: null,
            blur: null,
            focus: null,
            input: null,
            change: null,
            formatter: null,
            parser: null
        },
        settingData: {
            propName: id,
            label: "文本框",
            labelPosition: "left",
            type: "text",
            placeholder: "请输入内容",
            defaultValue: null,
            rows: null,
            showWordLimit: null,
            control: ["isShow"],
            maxlength: null,
            minlength: null,
            clearable: true,
            required: false,
            requiredMessage: null,
            regExp: null,
            regExpMessage: null,
            formatter: `function formatter(value) {
    // 请在这里编写格式化函数体逻辑，可直接使用 value 参数
}`,
            parser: `function parser(value) {
    // 请在这里编写解析函数体逻辑，可直接使用 value 参数
}`,
            onValidate: `function onValidate(value, callback, formData, widgetFormData) {
    // 请在这里编写验证函数体逻辑，可直接使用 value, callback, formData, widgetFormData 参数
}`,
            onBlur: `function onBlur(event, value, formData, widgetFormData) {
    // 请在这里编写失去焦点事件处理函数体逻辑，可直接使用 event, value, formData, widgetFormData 参数
}`,
            onFocus: `function onFocus(event, value, formData, widgetFormData) {
    // 请在这里编写获得焦点事件处理函数体逻辑，可直接使用 event, value, formData, widgetFormData 参数
}`,
            onInput: `function onInput(value, formData, widgetFormData) {
    // 请在这里编写输入事件处理函数体逻辑，可直接使用 value, formData, widgetFormData 参数
}`,
            onChange: `function onChange(value, formData, widgetFormData) {
    // 请在这里编写改变事件处理函数体逻辑，可直接使用 value, formData, widgetFormData 参数
}`
        }
    };
}

/**
 * @description 将文本框设置同步到字段身份、表单项、组件属性和动态函数体。
 * @param data 将被原地更新的文本框节点数据。
 * @param fileName 发生变化的设置字段。
 * @param value 设置字段的新值。
 * @returns 无返回值。
 * @remarks 设置态始终保留原值；运行态只保存组件真正需要的属性，防止设置面板结构泄漏到渲染层。
 */
export function useSettingDataValueChange(data: WidgetTextData, fileName: keyof WidgetTextData["settingData"], value: any) {
    switch (fileName) {
        case "propName":
        case "defaultValue":
            data[fileName] = value;
            break;
        case "label":
        case "labelPosition":
            data.formAttributes[fileName] = value;
            break;
        case "type":
            data.componentAttributes.type = value;
            if (value === "textarea") {
                // textarea 必须有有效行数；首次切换时补 2 行，但保留用户此前配置的 rows。
                if (!data.settingData.rows) {
                    data.settingData.rows = 2;
                }
                data.componentAttributes.rows = data.settingData.rows;
            } else {
                // 普通 input 不接受 rows，删除旧属性可避免从 textarea 切回时仍透传无效配置。
                delete data.componentAttributes.rows;
            }
            break;
        case "control":
            // control 将三个界面选项拆分到组件禁用、只读属性和设计器节点可见性。
            data.componentAttributes.disabled = value.includes("disabled");
            data.isShow = value.includes("isShow");
            data.componentAttributes.readonly = value.includes("readonly");
            break;
        case "placeholder":
        case "formatter":
        case "rows":
        case "showWordLimit":
        case "maxlength":
        case "minlength":
        case "parser":
            data.componentAttributes[fileName] = value;
            break;
        case "required":
        case "requiredMessage":
        case "regExp":
        case "regExpMessage":
            break;
        case "onValidate":
            // 脚本编辑器保存完整声明，运行时只保留函数体，参数由事件/校验适配器受控注入。
            data.componentFunctions.validate = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onBlur":
            data.componentFunctions.blur = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onFocus":
            data.componentFunctions.focus = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onInput":
            data.componentFunctions.input = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onChange":
            data.componentFunctions.change = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
    }
    (data.settingData as any)[fileName] = value;
}

/**
 * @description 获取文本框属性，并仅在普通 text 模式下挂载 formatter/parser。
 * @param widgetTextData 当前文本框节点数据。
 * @returns 合并静态属性与已配置转换函数的新对象。
 * @remarks Element Plus 的 textarea 不支持这两个转换器；忽略而非强行透传可避免模式切换后的无效行为。
 */
export function useAttributes(widgetTextData: WidgetTextData): WidgetTextData["componentAttributes"] {
    // 收集由脚本配置动态生成的组件属性函数。
    const functionAttributes: Record<string, (value: string | number) => string> = {};
    if (widgetTextData.componentAttributes.type === "text") {
        if (widgetTextData.componentFunctions.formatter) {
            /**
             * @description 执行输入展示格式化脚本。
             * @param value 当前输入值。
             * @returns 格式化后的展示文本。
             * @throws 配置脚本语法错误或执行失败时原样抛出。
             */
            functionAttributes.formatter = function (value: string | number) {
                return new Function("value", widgetTextData.componentFunctions.formatter as string)(value);
            };
        }
        if (widgetTextData.componentFunctions.parser) {
            /**
             * @description 执行展示文本解析脚本。
             * @param value 当前展示值。
             * @returns 解析后写入模型的文本。
             * @throws 配置脚本语法错误或执行失败时原样抛出。
             */
            functionAttributes.parser = function (value: string | number) {
                return new Function("value", widgetTextData.componentFunctions.parser as string)(value);
            };
        }
    }
    return Object.assign({}, widgetTextData.componentAttributes, functionAttributes);
}

/**
 * @description 创建文本框运行态事件映射。
 * @param widgetTextData 当前文本框节点数据。
 * @param formData 当前表单渲染值。
 * @param widgetFormData 所属表单设计数据。
 * @returns 仅包含已配置脚本的事件映射。
 * @remarks 焦点事件额外注入当前字段实时值，脚本异常直接传播给组件事件调用链。
 */
export function useEvents(widgetTextData: WidgetTextData, formData: Record<string, any>, widgetFormData: WidgetFormData) {
    // 收集当前组件实际配置的运行时事件处理器。
    const events: Record<string, ((e: FocusEvent) => void) | ((value: string | number) => void) | ((value: string | number, event: Event) => void)> = {};
    if (widgetTextData.componentFunctions.blur) {
        /**
         * @description 执行文本框失焦脚本并注入当前字段值。
         * @param event 原始焦点事件。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.blur = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetTextData.componentFunctions.blur as string)(event, formData[widgetTextData.id], formData, widgetFormData);
        };
    }
    if (widgetTextData.componentFunctions.focus) {
        /**
         * @description 执行文本框聚焦脚本并注入当前字段值。
         * @param event 原始焦点事件。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.focus = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetTextData.componentFunctions.focus as string)(event, formData[widgetTextData.id], formData, widgetFormData);
        };
    }
    if (widgetTextData.componentFunctions.input) {
        /**
         * @description 执行文本输入过程脚本。
         * @param value 当前输入值。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.input = function (value: string | number) {
            new Function("value", "formData", "widgetFormData", widgetTextData.componentFunctions.input as string)(value, formData, widgetFormData);
        };
    }
    if (widgetTextData.componentFunctions.change) {
        /**
         * @description 执行文本值确认变更脚本。
         * @param value 确认后的输入值。
         * @param event Element Plus 同时提供的原始事件；当前脚本协议不注入该参数。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.change = function (value: string | number, event: Event) {
            new Function("value", "formData", "widgetFormData", widgetTextData.componentFunctions.change as string)(value, formData, widgetFormData);
        };
    }
    return events;
}
