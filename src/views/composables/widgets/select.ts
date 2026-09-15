/**
 * @fileoverview 下拉选择器适配模块，负责选项与交互属性同步、远程/本地过滤函数包装以及选择事件上下文注入。
 * @remarks
 * 设置态保存完整函数源码，运行态仅保存函数体；渲染时通过 `new Function` 按需生成回调，使组件设计数据能够序列化和导出。
 * 完整属性构建返回新对象；设置面板只原地更新发生变化的属性函数，后续文档领域会在持久化前排除 `componentAttributes`。
 * 选项值与默认值采用严格类型匹配，远程和过滤脚本仅适用于可信配置，脚本异常直接向组件调用链传播。
 * 当前 filterMethod 的运行参数是 value/widgetSelectData，与默认模板展示的 formData/widgetFormData 不一致，扩展过滤上下文前需要先统一这份契约。
 */
import { randomId } from "@yujinjin/utils";
import { type WidgetSelectData, type WidgetFormData } from "@/views/composables/types";
import { buildDefinedAttributes } from "@/views/composables/widget-attribute-utils";
import { createWidgetComponentFunction, extractFunctionBody } from "@/views/composables/widget-script-utils";

/** 注册表使用的下拉选择器稳定 code 与组件库展示元数据。 */
export const WIDGET_SELECT = {
    code: "select",
    name: "选择器",
    description: "下拉选择器",
    icon: "icon-select"
};

/**
 * @description 合并静态属性与远程搜索、本地过滤函数。
 * @param widgetSelectData 当前选择器节点数据。
 * @returns 合并静态属性与已配置搜索回调的新对象。
 * @remarks 返回新对象供首次创建、复制和 JSON 恢复物化；动态函数只应来自可信设计配置。
 */
export function useAttributes(widgetSelectData: WidgetSelectData) {
    // 收集由脚本配置动态生成的组件属性函数。
    const functionAttributes: Record<string, (query: string) => void> = {};
    if (widgetSelectData.componentFunctions.remoteMethod) {
        /**
         * @description 执行远程选项查询脚本。
         * @param query 当前搜索关键字。
         * @returns 无返回值；异步请求及选项写回应由配置脚本处理。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        functionAttributes.remoteMethod = function (query: string) {
            new Function("query", "widgetSelectData", widgetSelectData.componentFunctions.remoteMethod as string)(query, widgetSelectData);
        };
    }
    if (widgetSelectData.componentFunctions.filterMethod) {
        /**
         * @description 执行本地选项过滤脚本。
         * @param value 当前过滤关键字。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         * @remarks 当前运行协议注入 value/widgetSelectData，与默认编辑模板展示的参数并不一致。
         */
        functionAttributes.filterMethod = function (value: string) {
            new Function("value", "widgetSelectData", widgetSelectData.componentFunctions.filterMethod as string)(value, widgetSelectData);
        };
    }
    return Object.assign(
        buildDefinedAttributes(
            widgetSelectData.settingData,
            ["options", "multiple", "multipleLimit", "filterable", "clearable", "placeholder", "collapseTags", "maxCollapseTags", "collapseTagsTooltip", "allowCreate", "remote"],
            { disabled: widgetSelectData.settingData.control.includes("disabled") }
        ),
        functionAttributes
    );
}

/**
 * @description 创建下拉选择器默认数据。
 * @returns 相互隔离的新选择器节点数据。
 * @remarks 选项在设置态和运行态分别保存，后续修改必须通过同步函数同时维护。
 */
export function useCreateDefaultData(): WidgetSelectData {
    // 根据组件 code 生成当前设计节点的唯一 ID。
    const id = WIDGET_SELECT.code.replace(/-/g, "_") + "_" + randomId();
    // 默认选项由设置态和运行属性共享，后续设置更新会同时替换两处引用。
    const options = [
        { value: "1", label: "选项1" },
        { value: "2", label: "选项2" },
        { value: "3", label: "选项3", disabled: true }
    ];
    return {
        id,
        code: WIDGET_SELECT.code,
        name: WIDGET_SELECT.name,
        isShow: true,
        defaultValue: null,
        propName: id,
        formAttributes: {
            label: WIDGET_SELECT.name,
            prop: id,
            required: false,
            labelPosition: "left"
        },
        componentAttributes: {
            options,
            multiple: false,
            filterable: false,
            clearable: false,
            placeholder: "请选择",
            collapseTags: false,
            collapseTagsTooltip: false,
            allowCreate: false,
            remote: false,
            disabled: false
        },
        componentFunctions: {
            validate: null,
            change: null,
            blur: null,
            focus: null,
            clear: null,
            removeTag: null,
            visibleChange: null,
            filterMethod: null,
            remoteMethod: null
        },
        settingData: {
            propName: id,
            label: WIDGET_SELECT.name,
            labelPosition: "left",
            options,
            defaultValue: null,
            control: ["isShow"],
            multiple: false,
            multipleLimit: null,
            filterable: false,
            clearable: false,
            placeholder: "请选择",
            collapseTags: false,
            maxCollapseTags: null,
            collapseTagsTooltip: false,
            allowCreate: false,
            remote: false,
            required: false,
            requiredMessage: null,
            remoteMethod: `async function onRemoteMethod(query, widgetSelectData) {
    // 请在这里编写远程方法函数体逻辑，可直接使用 query, widgetSelectData 参数
}`,
            filterMethod: `function onFilterMethod(value, formData, widgetFormData) {
    // 请在这里编写过滤方法函数体逻辑，可直接使用 value, formData, widgetFormData 参数
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
            onRemoveTag: `function onRemoveTag(tagValue, formData, widgetFormData) {
    // 请在这里编写移除标签事件处理函数体逻辑，可直接使用 tagValue, formData, widgetFormData 参数
}`,
            onVisibleChange: `function onVisibleChange(visible, formData, widgetFormData) {
    // 请在这里编写可见性改变事件处理函数体逻辑，可直接使用 visible, formData, widgetFormData 参数
}`
        }
    };
}

/**
 * @description 把选择器设置分发到字段身份、表单项、组件属性和脚本函数体。
 * @param widgetSelectData 将被原地更新的选择器节点数据。
 * @param fileName 发生变化的设置字段。
 * @param value 设置字段的新值。
 * @returns 无返回值。
 * @remarks 所有设置最终仍写回 settingData，保证设置面板显示用户原始输入，而不是运行时转换后的函数体。
 */
export function useSettingDataValueChange(widgetSelectData: WidgetSelectData, fileName: keyof WidgetSelectData["settingData"], value: any) {
    // 设置面板只接收工厂创建或恢复完成的 Widget，因此运行属性在此阶段必然存在。
    const componentAttributes = widgetSelectData.componentAttributes!;
    switch (fileName) {
        case "propName":
        case "defaultValue":
            widgetSelectData[fileName] = value;
            break;
        case "label":
        case "labelPosition":
            widgetSelectData.formAttributes[fileName] = value;
            break;
        case "control":
            widgetSelectData.isShow = value.includes("isShow");
            componentAttributes.disabled = value.includes("disabled");
            break;
        case "placeholder":
        case "options":
        case "multiple":
        case "multipleLimit":
        case "filterable":
        case "clearable":
        case "collapseTags":
        case "maxCollapseTags":
        case "collapseTagsTooltip":
        case "allowCreate":
        case "remote":
            componentAttributes[fileName] = value;
            break;
        case "required":
        case "requiredMessage":
            break;
        case "remoteMethod":
            // 完整函数声明只用于编辑，运行态保存去掉首尾声明后的函数体。
            widgetSelectData.componentFunctions.remoteMethod = extractFunctionBody(value);
            if (widgetSelectData.componentFunctions.remoteMethod) {
                componentAttributes.remoteMethod = createWidgetComponentFunction(widgetSelectData.componentFunctions.remoteMethod, ["query", "widgetSelectData"], false, [widgetSelectData]);
            } else {
                delete componentAttributes.remoteMethod;
            }
            break;
        case "filterMethod":
            widgetSelectData.componentFunctions.filterMethod = extractFunctionBody(value);
            if (widgetSelectData.componentFunctions.filterMethod) {
                componentAttributes.filterMethod = createWidgetComponentFunction(widgetSelectData.componentFunctions.filterMethod, ["value", "widgetSelectData"], false, [widgetSelectData]);
            } else {
                delete componentAttributes.filterMethod;
            }
            break;
        case "onValidate":
            widgetSelectData.componentFunctions.validate = extractFunctionBody(value);
            break;
        case "onChange":
            widgetSelectData.componentFunctions.change = extractFunctionBody(value);
            break;
        case "onBlur":
            widgetSelectData.componentFunctions.blur = extractFunctionBody(value);
            break;
        case "onFocus":
            widgetSelectData.componentFunctions.focus = extractFunctionBody(value);
            break;
        case "onClear":
            widgetSelectData.componentFunctions.clear = extractFunctionBody(value);
            break;
        case "onRemoveTag":
            widgetSelectData.componentFunctions.removeTag = extractFunctionBody(value);
            break;
        case "onVisibleChange":
            widgetSelectData.componentFunctions.visibleChange = extractFunctionBody(value);
            break;
        default:
            break;
    }
    (widgetSelectData.settingData as any)[fileName] = value;
}

/**
 * @description 创建选择器事件映射并注入当前表单上下文。
 * @param widgetSelectData 当前选择器节点数据。
 * @param formData 当前表单渲染值。
 * @param widgetFormData 所属表单设计数据。
 * @returns 仅包含已配置脚本的事件映射。
 * @remarks blur/focus 使用字段 id 获取实时值；其他事件按各自签名提供最小必要参数。
 */
export function useEvents(widgetSelectData: WidgetSelectData, formData: Record<string, any>, widgetFormData: WidgetFormData) {
    // 收集当前组件实际配置的运行时事件处理器。
    const events: Record<string, ((e: FocusEvent) => void) | ((value: any) => void) | (() => void)> = {};
    if (widgetSelectData.componentFunctions.change) {
        /**
         * @description 执行选择值变更脚本。
         * @param value 当前单选值或多选值数组。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.change = function (value: any) {
            new Function("value", "formData", "widgetFormData", widgetSelectData.componentFunctions.change as string)(value, formData, widgetFormData);
        };
    }
    if (widgetSelectData.componentFunctions.blur) {
        /**
         * @description 执行选择器失焦脚本并注入当前字段值。
         * @param event 原始焦点事件。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.blur = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetSelectData.componentFunctions.blur as string)(event, formData[widgetSelectData.id], formData, widgetFormData);
        };
    }
    if (widgetSelectData.componentFunctions.focus) {
        /**
         * @description 执行选择器聚焦脚本并注入当前字段值。
         * @param event 原始焦点事件。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.focus = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetSelectData.componentFunctions.focus as string)(event, formData[widgetSelectData.id], formData, widgetFormData);
        };
    }
    if (widgetSelectData.componentFunctions.clear) {
        /**
         * @description 执行选择值清空脚本。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.clear = function () {
            new Function("formData", "widgetFormData", widgetSelectData.componentFunctions.clear as string)(formData, widgetFormData);
        };
    }
    if (widgetSelectData.componentFunctions.removeTag) {
        /**
         * @description 执行多选标签移除脚本。
         * @param tagValue 被移除的标签值。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.removeTag = function (tagValue: any) {
            new Function("tagValue", "formData", "widgetFormData", widgetSelectData.componentFunctions.removeTag as string)(tagValue, formData, widgetFormData);
        };
    }
    if (widgetSelectData.componentFunctions.visibleChange) {
        /**
         * @description 执行下拉面板可见性变更脚本。
         * @param visible 下拉面板是否可见。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.visibleChange = function (visible: boolean) {
            new Function("visible", "formData", "widgetFormData", widgetSelectData.componentFunctions.visibleChange as string)(visible, formData, widgetFormData);
        };
    }
    return events;
}
