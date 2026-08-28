/**
 * @fileoverview 级联选择器组件模块，负责本地树解析与校验、默认配置、设置同步、运行属性和事件上下文注入。
 * @remarks 本地树保存在 settingData；解析规则与组件适配集中维护，避免仅服务当前组件的逻辑分散到额外数据源模块。
 */
import { randomId } from "@yujinjin/utils";
import { type CascaderOption, type CascaderParseFailure, type CascaderParseResult, type WidgetCascaderData, type WidgetFormData } from "@/views/composables/types";

/** 注册表使用的级联选择器稳定 code 与组件库展示元数据。 */
export const WIDGET_CASCADER = {
    code: "cascader",
    name: "级联选择器",
    description: "级联选择器",
    icon: "icon-select"
};

/**
 * @description 判断未知值是否为可按字段读取的普通对象。
 * @param value 待判断的未知值。
 * @returns 非数组且非 null 的对象返回 true。
 */
const isRecord = function (value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
};

/**
 * @description 构造统一的级联选项校验失败结果。
 * @param message 面向用户展示的错误信息。
 * @param path 发生错误的 JSONPath 风格位置。
 * @returns 可由调用方直接返回的失败结果。
 */
const createCascaderParseFailure = function (message: string, path: string): CascaderParseFailure {
    return { ok: false, message, path };
};

/**
 * @description 校验未知数据是否为设计器支持的标准级联完整树。
 * @param value 待校验的数据，根节点必须为数组。
 * @returns 成功时返回原树引用，失败时返回首个错误及精确节点路径。
 * @remarks 返回原引用可避免设置面板校验成功后复制大树；本函数只读取数据，不修改节点。
 */
export const validateCascaderOptions = function (value: unknown): CascaderParseResult<CascaderOption[]> {
    if (!Array.isArray(value)) {
        return createCascaderParseFailure("级联选项根节点必须是数组", "$");
    }

    /**
     * @description 递归校验当前层级的标准节点。
     * @param nodes 当前层级节点数组。
     * @param parentPath 当前数组对应的 JSONPath。
     * @returns 成功结果或递归过程中发现的首个错误。
     */
    const validateNodes = function (nodes: unknown[], parentPath: string): CascaderParseResult<CascaderOption[]> {
        for (let index = 0; index < nodes.length; index += 1) {
            const nodePath = `${parentPath}[${index}]`;
            const node = nodes[index];
            if (!isRecord(node)) {
                return createCascaderParseFailure("级联节点必须是对象", nodePath);
            }
            if (typeof node.label !== "string") {
                return createCascaderParseFailure("节点标签必须是字符串", `${nodePath}.label`);
            }
            if (typeof node.value !== "string" && typeof node.value !== "number") {
                return createCascaderParseFailure("节点值必须是字符串或数字", `${nodePath}.value`);
            }
            if (node.disabled !== undefined && typeof node.disabled !== "boolean") {
                return createCascaderParseFailure("节点 disabled 必须是布尔值", `${nodePath}.disabled`);
            }
            if (node.leaf !== undefined && typeof node.leaf !== "boolean") {
                return createCascaderParseFailure("节点 leaf 必须是布尔值", `${nodePath}.leaf`);
            }
            if (node.children !== undefined) {
                if (!Array.isArray(node.children)) {
                    return createCascaderParseFailure("节点 children 必须是数组", `${nodePath}.children`);
                }
                const childrenResult = validateNodes(node.children, `${nodePath}.children`);
                if (!childrenResult.ok) {
                    return childrenResult;
                }
            }
        }
        return { ok: true, data: nodes as CascaderOption[] };
    };

    return validateNodes(value, "$");
};

/**
 * @description 解析设置面板输入的本地级联树 JSON。
 * @param text 允许包含换行、缩进和 JSON 合法空白的文本。
 * @returns JSON 语法和标准树结构均合法时返回级联节点，否则返回可展示的错误。
 * @remarks JSON.parse 的引擎错误文案在不同环境可能不同，因此对外只承诺稳定的业务前缀和根路径。
 */
export const parseCascaderOptionsJson = function (text: string): CascaderParseResult<CascaderOption[]> {
    try {
        const parsedValue: unknown = JSON.parse(text);
        return validateCascaderOptions(parsedValue);
    } catch (error) {
        const detail = error instanceof Error ? error.message : "未知语法错误";
        return createCascaderParseFailure(`级联选项 JSON 格式错误：${detail}`, "$");
    }
};

/**
 * @description 创建级联选择器默认数据。
 * @returns 包含独立本地树引用的新组件数据。
 */
export function useCreateDefaultData(): WidgetCascaderData {
    // 根据组件 code 生成当前设计节点的唯一 ID。
    const id = WIDGET_CASCADER.code.replace(/-/g, "_") + "_" + randomId();
    const options = [
        {
            label: "浙江省",
            value: "330000",
            children: [
                { label: "杭州市", value: "330100" },
                { label: "宁波市", value: "330200" }
            ]
        },
        {
            label: "江苏省",
            value: "320000",
            children: [
                { label: "南京市", value: "320100" },
                { label: "苏州市", value: "320500" }
            ]
        }
    ];
    return {
        id,
        code: WIDGET_CASCADER.code,
        name: WIDGET_CASCADER.name,
        isShow: true,
        defaultValue: null,
        propName: id,
        formAttributes: {
            label: WIDGET_CASCADER.name,
            prop: id,
            required: false,
            labelPosition: "left"
        },
        componentAttributes: {
            placeholder: "请选择",
            disabled: false,
            clearable: true,
            filterable: false,
            showAllLevels: true,
            collapseTags: false,
            collapseTagsTooltip: false,
            separator: " / ",
            props: {
                multiple: false,
                checkStrictly: false,
                emitPath: true,
                expandTrigger: "click"
            }
        },
        componentFunctions: {
            validate: null,
            change: null,
            visibleChange: null,
            expandChange: null,
            clear: null,
            removeTag: null,
            blur: null,
            focus: null
        },
        settingData: {
            propName: id,
            label: WIDGET_CASCADER.name,
            labelPosition: "left",
            defaultValue: null,
            required: false,
            requiredMessage: null,
            control: ["isShow"],
            options,
            optionsText: JSON.stringify(options, null, 4),
            placeholder: "请选择",
            clearable: true,
            filterable: false,
            multiple: false,
            checkStrictly: false,
            emitPath: true,
            expandTrigger: "click",
            showAllLevels: true,
            collapseTags: false,
            maxCollapseTags: null,
            collapseTagsTooltip: false,
            separator: " / ",
            onValidate: `function onValidate(value, callback, formData, widgetFormData) {
    // 请在这里编写验证函数体逻辑，可直接使用 value, callback, formData, widgetFormData 参数
}`,
            onChange: `function onChange(value, formData, widgetFormData) {
    // 请在这里编写改变事件处理函数体逻辑，可直接使用 value, formData, widgetFormData 参数
}`,
            onVisibleChange: `function onVisibleChange(visible, formData, widgetFormData) {
    // 请在这里编写面板显隐事件逻辑，可直接使用 visible, formData, widgetFormData 参数
}`,
            onExpandChange: `function onExpandChange(value, formData, widgetFormData) {
    // 请在这里编写节点展开事件逻辑，可直接使用 value, formData, widgetFormData 参数
}`,
            onClear: `function onClear(formData, widgetFormData) {
    // 请在这里编写清空事件逻辑，可直接使用 formData, widgetFormData 参数
}`,
            onRemoveTag: `function onRemoveTag(value, formData, widgetFormData) {
    // 请在这里编写移除标签事件逻辑，可直接使用 value, formData, widgetFormData 参数
}`,
            onBlur: `function onBlur(event, value, formData, widgetFormData) {
    // 请在这里编写失焦事件逻辑，可直接使用 event, value, formData, widgetFormData 参数
}`,
            onFocus: `function onFocus(event, value, formData, widgetFormData) {
    // 请在这里编写聚焦事件逻辑，可直接使用 event, value, formData, widgetFormData 参数
}`
        }
    };
}

/**
 * @description 获取不包含运行时选项树的级联选择器属性。
 * @param widgetData 当前级联选择器节点数据。
 * @returns 组件属性的浅拷贝，嵌套 props 同样复制以隔离调用方修改。
 */
export function useAttributes(widgetData: WidgetCascaderData): Record<string, any> {
    return {
        ...widgetData.componentAttributes,
        props: { ...widgetData.componentAttributes.props },
        options: widgetData.settingData.options
    };
}

/**
 * @description 从设置面板的完整函数声明中提取可执行函数体。
 * @param source 设置面板保存的完整函数源码或空值。
 * @returns 空配置返回 null，否则返回去除首尾声明后的函数体。
 */
const extractFunctionBody = function (source: string | null): string | null {
    return source ? source.split("\n").slice(1, -1).join("\n") : null;
};

/**
 * @description 把级联选择器设置同步到字段身份、表单项、组件属性和脚本函数体。
 * @param widgetData 将被原地更新的级联选择器数据。
 * @param fileName 发生变化的设置字段。
 * @param value 设置字段的新值。
 * @returns 无返回值。
 * @remarks options 与 optionsText 由设置组件在 JSON 完全合法后同步，非法草稿不会进入此函数。
 */
export function useSettingDataValueChange(widgetData: WidgetCascaderData, fileName: keyof WidgetCascaderData["settingData"], value: any): void {
    switch (fileName) {
        case "propName":
        case "defaultValue":
            widgetData[fileName] = value;
            break;
        case "label":
        case "labelPosition":
            widgetData.formAttributes[fileName] = value;
            break;
        case "control":
            widgetData.componentAttributes.disabled = value.includes("disabled");
            widgetData.isShow = value.includes("isShow");
            break;
        case "multiple":
        case "checkStrictly":
        case "emitPath":
        case "expandTrigger":
            widgetData.componentAttributes.props = { ...widgetData.componentAttributes.props, [fileName]: value };
            break;
        case "placeholder":
        case "clearable":
        case "filterable":
        case "showAllLevels":
        case "collapseTags":
        case "maxCollapseTags":
        case "collapseTagsTooltip":
        case "separator":
            if (value === null) {
                delete widgetData.componentAttributes[fileName];
            } else {
                widgetData.componentAttributes[fileName] = value;
            }
            break;
        case "onValidate":
            widgetData.componentFunctions.validate = extractFunctionBody(value);
            break;
        case "onChange":
            widgetData.componentFunctions.change = extractFunctionBody(value);
            break;
        case "onVisibleChange":
            widgetData.componentFunctions.visibleChange = extractFunctionBody(value);
            break;
        case "onExpandChange":
            widgetData.componentFunctions.expandChange = extractFunctionBody(value);
            break;
        case "onClear":
            widgetData.componentFunctions.clear = extractFunctionBody(value);
            break;
        case "onRemoveTag":
            widgetData.componentFunctions.removeTag = extractFunctionBody(value);
            break;
        case "onBlur":
            widgetData.componentFunctions.blur = extractFunctionBody(value);
            break;
        case "onFocus":
            widgetData.componentFunctions.focus = extractFunctionBody(value);
            break;
        default:
            break;
    }
    (widgetData.settingData as Record<string, any>)[fileName] = value;
}

/**
 * @description 创建级联选择器事件映射并注入当前表单上下文。
 * @param widgetData 当前级联选择器节点数据。
 * @param formData 当前表单渲染值。
 * @param widgetFormData 所属表单设计数据。
 * @returns 仅包含已配置脚本的 Element Plus 事件映射。
 */
export function useEvents(widgetData: WidgetCascaderData, formData: Record<string, any>, widgetFormData: WidgetFormData): Record<string, (...args: any[]) => void> {
    const events: Record<string, (...args: any[]) => void> = {};
    const valueEvents = [
        ["change", "value", widgetData.componentFunctions.change],
        ["visibleChange", "visible", widgetData.componentFunctions.visibleChange],
        ["expandChange", "value", widgetData.componentFunctions.expandChange],
        ["removeTag", "value", widgetData.componentFunctions.removeTag]
    ] as const;
    valueEvents.forEach(([eventName, parameterName, body]) => {
        if (body) {
            events[eventName] = function (value: unknown): void {
                new Function(parameterName, "formData", "widgetFormData", body)(value, formData, widgetFormData);
            };
        }
    });
    if (widgetData.componentFunctions.clear) {
        events.clear = function (): void {
            new Function("formData", "widgetFormData", widgetData.componentFunctions.clear as string)(formData, widgetFormData);
        };
    }
    const focusEvents = [
        ["blur", widgetData.componentFunctions.blur],
        ["focus", widgetData.componentFunctions.focus]
    ] as const;
    focusEvents.forEach(([eventName, body]) => {
        if (body) {
            events[eventName] = function (event: FocusEvent): void {
                new Function("event", "value", "formData", "widgetFormData", body)(event, formData[widgetData.id], formData, widgetFormData);
            };
        }
    });
    return events;
}
