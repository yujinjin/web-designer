/**
 * @fileoverview 组件注册表与运行时分发模块，统一声明组件元数据、分组、默认值工厂、属性适配器和事件适配器。
 * @remarks 注册阶段通过泛型保证适配器与具体组件数据类型匹配，运行阶段擦除为统一定义；未知 code 的创建和属性读取回退到文本框，事件则返回空对象。
 */
import {
    type WidgetAlertData,
    type WidgetBaseData,
    type WidgetCheckboxGroupData,
    type WidgetCascaderData,
    type WidgetColorPickerData,
    type WidgetData,
    type WidgetDatePickerData,
    type WidgetDividerData,
    type WidgetFormData,
    type WidgetHTMLData,
    type WidgetInputNumberData,
    type WidgetRadioGroupData,
    type WidgetRateData,
    type WidgetRowContainerData,
    type WidgetSelectData,
    type WidgetSliderData,
    type WidgetSwitchData,
    type WidgetTextData,
    type WidgetTimePickerData,
    type WidgetTimeSelectData,
    type WidgetUploadData
} from "./types";
import { WIDGET_TEXT, useAttributes as useTextAttributes, useEvents as useTextEvents, useCreateDefaultData as useTextCreateDefaultData } from "./widgets/text";
import { WIDGET_INPUT_NUMBER, useAttributes as useInputNumberAttributes, useEvents as useInputNumberEvents, useCreateDefaultData as useInputNumberCreateDefaultData } from "./widgets/input-number";
import { WIDGET_RADIO_GROUP, useAttributes as useRadioGroupAttributes, useEvents as useRadioGroupEvents, useCreateDefaultData as useRadioGroupCreateDefaultData } from "./widgets/radio-group";
import {
    WIDGET_CHECKBOX_GROUP,
    useAttributes as useCheckboxGroupAttributes,
    useEvents as useCheckboxGroupEvents,
    useCreateDefaultData as useCheckboxGroupCreateDefaultData
} from "./widgets/checkbox-group";
import { WIDGET_SELECT, useAttributes as useSelectAttributes, useEvents as useSelectEvents, useCreateDefaultData as useSelectCreateDefaultData } from "./widgets/select";
import { WIDGET_CASCADER, useAttributes as useCascaderAttributes, useEvents as useCascaderEvents, useCreateDefaultData as useCascaderCreateDefaultData } from "./widgets/cascader";
import { WIDGET_DATE_PICKER, useAttributes as useDatePickerAttributes, useEvents as useDatePickerEvents, useCreateDefaultData as useDatePickerCreateDefaultData } from "./widgets/date-picker";
import { WIDGET_TIME_PICKER, useAttributes as useTimePickerAttributes, useEvents as useTimePickerEvents, useCreateDefaultData as useTimePickerCreateDefaultData } from "./widgets/time-picker";
import { WIDGET_TIME_SELECT, useAttributes as useTimeSelectAttributes, useEvents as useTimeSelectEvents, useCreateDefaultData as useTimeSelectCreateDefaultData } from "./widgets/time-select";
import { WIDGET_SWITCH, useAttributes as useSwitchAttributes, useEvents as useSwitchEvents, useCreateDefaultData as useSwitchCreateDefaultData } from "./widgets/switch";
import { WIDGET_RATE, useAttributes as useRateAttributes, useEvents as useRateEvents, useCreateDefaultData as useRateCreateDefaultData } from "./widgets/rate";
import { WIDGET_COLOR_PICKER, useAttributes as useColorPickerAttributes, useEvents as useColorPickerEvents, useCreateDefaultData as useColorPickerCreateDefaultData } from "./widgets/color-picker";
import { WIDGET_SLIDER, useAttributes as useSliderAttributes, useEvents as useSliderEvents, useCreateDefaultData as useSliderCreateDefaultData } from "./widgets/slider";
import { WIDGET_UPLOAD, useAttributes as useUploadAttributes, useCreateDefaultData as useUploadCreateDefaultData } from "./widgets/upload";
import { WIDGET_HTML, useCreateDefaultData as useHtmlCreateDefaultData } from "./widgets/html";
import { WIDGET_ALERT, useAttributes as useAlertAttributes, useCreateDefaultData as useAlertCreateDefaultData } from "./widgets/alert";
import { WIDGET_DIVIDER, useAttributes as useDividerAttributes, useCreateDefaultData as useDividerCreateDefaultData } from "./widgets/divider";
import { WIDGET_ROW_CONTAINER, useCreateDefaultData as useRowContainerCreateDefaultData } from "./widgets/row-container";

/**
 * @description 组件库允许使用的产品分组 code。
 */
export type WidgetGroupCode = "layout" | "input" | "selection" | "datetime" | "other";

/**
 * @description 每个组件模块向注册表提供的稳定展示元数据。
 */
type WidgetMeta = {
    /** 持久化到组件数据中的稳定类型 code。 */
    code: string;
    /** 组件库和设计器中展示的名称。 */
    name: string;
    /** 组件用途的简短说明。 */
    description: string;
    /** 组件库展示使用的图标类名。 */
    icon: string;
};

/**
 * @description 单个组件的统一运行时注册定义。
 */
export interface WidgetDefinition<K extends string = string> {
    /** 供代码侧稳定访问组件元数据的键，不等同于持久化到表单数据中的 code。 */
    key: K;
    /** 组件自身声明的持久化 code、展示名称、描述和图标。 */
    meta: WidgetMeta;
    /** 决定组件库所属分组；分组展示顺序由 WIDGET_GROUPS 单独控制。 */
    group: WidgetGroupCode;
    /** 仅控制组件在所属分组内的顺序，避免数组注册顺序同时承担 UI 排序职责。 */
    groupOrder: number;
    /**
     * @description 创建组件默认设计数据。
     * @returns 相互隔离的新组件数据，不能复用 settingData 或 componentAttributes 引用。
     */
    createDefaultData: () => WidgetData;
    /**
     * @description 把设计态数据转换为组件运行属性；静态或布局组件不需要时可以省略。
     * @param widgetData 当前组件设计数据。
     * @param value 当前字段渲染值，供动态属性函数读取。
     * @returns 传给渲染组件的属性对象。
     */
    getAttributes?: (widgetData: WidgetBaseData, value: any) => Record<string, any>;
    /**
     * @description 生成依赖当前表单上下文的运行事件；没有交互回调的组件可以省略。
     * @param widgetData 当前组件设计数据。
     * @param formData 当前表单渲染值。
     * @param widgetFormData 所属表单设计数据。
     * @returns 需要绑定到渲染组件的事件对象。
     */
    getEvents?: (widgetData: WidgetBaseData, formData: Record<string, any>, widgetFormData: WidgetFormData) => Record<string, any>;
}

/**
 * @description 注册阶段使用的强类型组件定义。
 * @remarks 对外分发统一使用 WidgetData，但注册时必须让工厂、属性和事件适配器共享具体数据类型 T，防止适配器接错组件。
 */
type TypedWidgetDefinition<K extends string, T extends WidgetData> = Omit<WidgetDefinition<K>, "createDefaultData" | "getAttributes" | "getEvents"> & {
    /**
     * @description 创建当前注册项具体类型的默认数据。
     * @returns 与注册泛型 T 一致的新组件数据。
     */
    createDefaultData: () => T;
    /**
     * @description 将具体组件数据转换为运行属性。
     * @param widgetData 与当前注册项一致的具体组件数据。
     * @param value 当前字段渲染值。
     * @returns 组件运行属性对象。
     */
    getAttributes?: (widgetData: T, value: any) => Record<string, any>;
    /**
     * @description 为具体组件创建运行事件映射。
     * @param widgetData 与当前注册项一致的具体组件数据。
     * @param formData 当前表单渲染值。
     * @param widgetFormData 所属表单设计数据。
     * @returns 组件运行事件对象。
     */
    getEvents?: (widgetData: T, formData: Record<string, any>, widgetFormData: WidgetFormData) => Record<string, any>;
};

/**
 * @description 在注册阶段保留具体组件数据类型校验，随后统一为运行时可分发定义。
 * @param definition 工厂和适配器均使用同一具体组件类型的注册定义。
 * @returns 擦除具体组件泛型后的统一注册定义。
 * @remarks 类型擦除只影响静态表示，运行分发仍必须根据 meta.code 选择与数据类型匹配的适配器。
 */
const defineWidget = <K extends string, T extends WidgetData>(definition: TypedWidgetDefinition<K, T>): WidgetDefinition<K> => {
    return definition as WidgetDefinition<K>;
};

/**
 * @description 组件元数据、分组、默认值工厂和渲染适配器的唯一注册入口。
 * @remarks 集中声明使组件库展示、创建、属性和事件分发使用同一来源，避免新增组件时遗漏分支；as const 保留 key 字面量以自动推导 WidgetList。
 */
export const WIDGET_DEFINITIONS = [
    defineWidget<"WIDGET_TEXT", WidgetTextData>({
        key: "WIDGET_TEXT",
        meta: WIDGET_TEXT,
        group: "input",
        groupOrder: 0,
        createDefaultData: useTextCreateDefaultData,
        getAttributes: useTextAttributes,
        getEvents: useTextEvents
    }),
    defineWidget<"WIDGET_INPUT_NUMBER", WidgetInputNumberData>({
        key: "WIDGET_INPUT_NUMBER",
        meta: WIDGET_INPUT_NUMBER,
        group: "input",
        groupOrder: 1,
        createDefaultData: useInputNumberCreateDefaultData,
        getAttributes: useInputNumberAttributes,
        getEvents: useInputNumberEvents
    }),
    defineWidget<"WIDGET_RADIO_GROUP", WidgetRadioGroupData>({
        key: "WIDGET_RADIO_GROUP",
        meta: WIDGET_RADIO_GROUP,
        group: "selection",
        groupOrder: 1,
        createDefaultData: useRadioGroupCreateDefaultData,
        getAttributes: useRadioGroupAttributes,
        getEvents: useRadioGroupEvents
    }),
    defineWidget<"WIDGET_CHECKBOX_GROUP", WidgetCheckboxGroupData>({
        key: "WIDGET_CHECKBOX_GROUP",
        meta: WIDGET_CHECKBOX_GROUP,
        group: "selection",
        groupOrder: 2,
        createDefaultData: useCheckboxGroupCreateDefaultData,
        getAttributes: useCheckboxGroupAttributes,
        getEvents: useCheckboxGroupEvents
    }),
    defineWidget<"WIDGET_SELECT", WidgetSelectData>({
        key: "WIDGET_SELECT",
        meta: WIDGET_SELECT,
        group: "selection",
        groupOrder: 0,
        createDefaultData: useSelectCreateDefaultData,
        getAttributes: useSelectAttributes,
        getEvents: useSelectEvents
    }),
    defineWidget<"WIDGET_CASCADER", WidgetCascaderData>({
        key: "WIDGET_CASCADER",
        meta: WIDGET_CASCADER,
        group: "selection",
        groupOrder: 0.5,
        createDefaultData: useCascaderCreateDefaultData,
        getAttributes: useCascaderAttributes,
        getEvents: useCascaderEvents
    }),
    defineWidget<"WIDGET_DATE_PICKER", WidgetDatePickerData>({
        key: "WIDGET_DATE_PICKER",
        meta: WIDGET_DATE_PICKER,
        group: "datetime",
        groupOrder: 0,
        createDefaultData: useDatePickerCreateDefaultData,
        getAttributes: useDatePickerAttributes,
        getEvents: useDatePickerEvents
    }),
    defineWidget<"WIDGET_TIME_PICKER", WidgetTimePickerData>({
        key: "WIDGET_TIME_PICKER",
        meta: WIDGET_TIME_PICKER,
        group: "datetime",
        groupOrder: 1,
        createDefaultData: useTimePickerCreateDefaultData,
        getAttributes: useTimePickerAttributes,
        getEvents: useTimePickerEvents
    }),
    defineWidget<"WIDGET_TIME_SELECT", WidgetTimeSelectData>({
        key: "WIDGET_TIME_SELECT",
        meta: WIDGET_TIME_SELECT,
        group: "datetime",
        groupOrder: 2,
        createDefaultData: useTimeSelectCreateDefaultData,
        getAttributes: useTimeSelectAttributes,
        getEvents: useTimeSelectEvents
    }),
    defineWidget<"WIDGET_SWITCH", WidgetSwitchData>({
        key: "WIDGET_SWITCH",
        meta: WIDGET_SWITCH,
        group: "selection",
        groupOrder: 3,
        createDefaultData: useSwitchCreateDefaultData,
        getAttributes: useSwitchAttributes,
        getEvents: useSwitchEvents
    }),
    defineWidget<"WIDGET_RATE", WidgetRateData>({
        key: "WIDGET_RATE",
        meta: WIDGET_RATE,
        group: "other",
        groupOrder: 1,
        createDefaultData: useRateCreateDefaultData,
        getAttributes: useRateAttributes,
        getEvents: useRateEvents
    }),
    defineWidget<"WIDGET_COLOR_PICKER", WidgetColorPickerData>({
        key: "WIDGET_COLOR_PICKER",
        meta: WIDGET_COLOR_PICKER,
        group: "other",
        groupOrder: 0,
        createDefaultData: useColorPickerCreateDefaultData,
        getAttributes: useColorPickerAttributes,
        getEvents: useColorPickerEvents
    }),
    defineWidget<"WIDGET_SLIDER", WidgetSliderData>({
        key: "WIDGET_SLIDER",
        meta: WIDGET_SLIDER,
        group: "selection",
        groupOrder: 4,
        createDefaultData: useSliderCreateDefaultData,
        getAttributes: useSliderAttributes,
        getEvents: useSliderEvents
    }),
    defineWidget<"WIDGET_UPLOAD", WidgetUploadData>({
        key: "WIDGET_UPLOAD",
        meta: WIDGET_UPLOAD,
        group: "selection",
        groupOrder: 5,
        createDefaultData: useUploadCreateDefaultData,
        getAttributes: useUploadAttributes
    }),
    defineWidget<"WIDGET_HTML", WidgetHTMLData>({ key: "WIDGET_HTML", meta: WIDGET_HTML, group: "other", groupOrder: 2, createDefaultData: useHtmlCreateDefaultData }),
    defineWidget<"WIDGET_ALERT", WidgetAlertData>({
        key: "WIDGET_ALERT",
        meta: WIDGET_ALERT,
        group: "other",
        groupOrder: 3,
        createDefaultData: useAlertCreateDefaultData,
        getAttributes: useAlertAttributes
    }),
    defineWidget<"WIDGET_DIVIDER", WidgetDividerData>({
        key: "WIDGET_DIVIDER",
        meta: WIDGET_DIVIDER,
        group: "other",
        groupOrder: 4,
        createDefaultData: useDividerCreateDefaultData,
        getAttributes: useDividerAttributes
    }),
    defineWidget<"WIDGET_ROW_CONTAINER", WidgetRowContainerData>({
        key: "WIDGET_ROW_CONTAINER",
        meta: WIDGET_ROW_CONTAINER,
        group: "layout",
        groupOrder: 0,
        createDefaultData: useRowContainerCreateDefaultData
    })
] as const;

/**
 * @description 组件库产品分组及固定展示顺序。
 * @remarks 分组顺序与组件注册顺序无关，使用只读列表防止运行时修改。
 */
const WIDGET_GROUPS: ReadonlyArray<{ code: WidgetGroupCode; groupName: string }> = [
    { code: "layout", groupName: "布局型组件" },
    { code: "input", groupName: "输入型组件" },
    { code: "selection", groupName: "选择型组件" },
    { code: "datetime", groupName: "日期时间型组件" },
    { code: "other", groupName: "其他" }
];

/**
 * @description 从注册表推导的稳定 key 到组件元数据映射类型。
 */
type WidgetList = {
    [Definition in (typeof WIDGET_DEFINITIONS)[number] as Definition["key"]]: Definition["meta"];
};

/**
 * @description 按持久化 code 索引注册定义的运行时分发缓存。
 * @remarks 预先建表避免创建数据和解析属性时反复线性扫描注册数组。
 */
const WIDGET_DEFINITION_MAP = new Map<string, WidgetDefinition>(WIDGET_DEFINITIONS.map(item => [item.meta.code, item]));

/**
 * @description 按 WIDGET_TEXT 等稳定 key 索引元数据的模板访问缓存。
 * @remarks 模板通过稳定导出键访问展示元数据，不依赖持久化 code，也不暴露完整运行时注册定义。
 */
const WIDGET_LIST = Object.fromEntries(WIDGET_DEFINITIONS.map(item => [item.key, item.meta])) as WidgetList;

/**
 * @description 根据组件 code 创建一份全新的默认数据。
 * @param code 持久化组件类型 code。
 * @returns 对应注册项的新组件数据；未知 code 返回文本框默认数据。
 * @remarks 文本框回退用于兼容旧数据和外部导入数据，因此未注册 code 不会抛错。
 */
export const createWidgetDefaultData = function (code: string): WidgetData {
    return WIDGET_DEFINITION_MAP.get(code)?.createDefaultData() ?? useTextCreateDefaultData();
};

/**
 * @description 生成组件库展示分组。
 * @returns 按产品分组顺序排列的新数组，各组 children 按 groupOrder 排序。
 * @remarks 每次重新构造结果，避免注册数组顺序或调用方修改意外改变界面顺序。
 */
export const getWidgetGroup = function () {
    return WIDGET_GROUPS.map(group => ({
        groupName: group.groupName,
        // 每次基于注册表重新生成分组，新增注册项只需声明 group/groupOrder，无需再维护第二份成员列表。
        children: WIDGET_DEFINITIONS.filter(item => item.group === group.code)
            .sort((left, right) => left.groupOrder - right.groupOrder)
            .map(item => item.meta)
    }));
};

/**
 * @description 返回按稳定 key 索引的组件元数据浅拷贝。
 * @returns WIDGET_LIST 的新外层对象，内部 meta 保留注册表引用。
 * @remarks 复制最外层对象可防止调用方增删属性破坏模块缓存；meta 约定只读，不进行深拷贝。
 */
export const getWidgetList = function (): WidgetList {
    return { ...WIDGET_LIST };
};

/**
 * @description 获取组件渲染属性。
 * @param widgetData 当前组件设计数据。
 * @param value 当前字段渲染值。
 * @returns 注册适配器生成的属性；未知或无适配器时返回文本框属性。
 * @throws 组件适配器内部异常会原样传播。
 * @remarks 属性使用文本框兜底以维持历史数据可渲染性。
 */
export const getWidgetComponentAttributes = function (widgetData: WidgetBaseData, value: any): Record<string, any> {
    // 按持久化 code 查找当前组件对应的注册定义。
    const definition = WIDGET_DEFINITION_MAP.get(widgetData.code);
    if (definition?.getAttributes) {
        return definition.getAttributes(widgetData, value);
    }
    // 属性适配需要一个可用兜底，旧版本未知 code 才能继续渲染并被用户修复或重新保存。
    return useTextAttributes(widgetData as WidgetTextData);
};

/**
 * @description 获取组件事件绑定。
 * @param widgetData 当前组件设计数据。
 * @param formData 当前表单渲染值。
 * @param widgetFormData 所属表单设计数据。
 * @returns 注册适配器生成的事件对象；未注册或无事件适配器时返回空对象。
 * @throws 组件事件适配器内部异常会原样传播。
 * @remarks 事件不套用文本框兜底，避免未知组件意外执行不匹配的行为。
 */
export const getWidgetComponentEvents = function (widgetData: WidgetBaseData, formData: Record<string, any>, widgetFormData: WidgetFormData): Record<string, any> {
    // 事件不能像属性一样套用文本框兜底，否则未知组件可能意外写入表单值；空对象是更安全的无行为默认值。
    return WIDGET_DEFINITION_MAP.get(widgetData.code)?.getEvents?.(widgetData, formData, widgetFormData) ?? {};
};
