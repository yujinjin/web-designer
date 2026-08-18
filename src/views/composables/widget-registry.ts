import {
    type WidgetAlertData,
    type WidgetBaseData,
    type WidgetCheckboxGroupData,
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

export type WidgetGroupCode = "layout" | "input" | "selection" | "datetime" | "other";

type WidgetMeta = {
    code: string;
    name: string;
    description: string;
    icon: string;
};

export interface WidgetDefinition<K extends string = string> {
    key: K;
    meta: WidgetMeta;
    group: WidgetGroupCode;
    groupOrder: number;
    createDefaultData: () => WidgetData;
    getAttributes?: (widgetData: WidgetBaseData, value: any) => Record<string, any>;
    getEvents?: (widgetData: WidgetBaseData, formData: Record<string, any>, widgetFormData: WidgetFormData) => Record<string, any>;
}

type TypedWidgetDefinition<K extends string, T extends WidgetData> = Omit<WidgetDefinition<K>, "createDefaultData" | "getAttributes" | "getEvents"> & {
    createDefaultData: () => T;
    getAttributes?: (widgetData: T, value: any) => Record<string, any>;
    getEvents?: (widgetData: T, formData: Record<string, any>, widgetFormData: WidgetFormData) => Record<string, any>;
};

const defineWidget = <K extends string, T extends WidgetData>(definition: TypedWidgetDefinition<K, T>): WidgetDefinition<K> => {
    return definition as WidgetDefinition<K>;
};

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

const WIDGET_GROUPS: ReadonlyArray<{ code: WidgetGroupCode; groupName: string }> = [
    { code: "layout", groupName: "布局型组件" },
    { code: "input", groupName: "输入型组件" },
    { code: "selection", groupName: "选择型组件" },
    { code: "datetime", groupName: "日期时间型组件" },
    { code: "other", groupName: "其他" }
];

type WidgetList = {
    [Definition in (typeof WIDGET_DEFINITIONS)[number] as Definition["key"]]: Definition["meta"];
};

const WIDGET_DEFINITION_MAP = new Map<string, WidgetDefinition>(WIDGET_DEFINITIONS.map(item => [item.meta.code, item]));
const WIDGET_LIST = Object.fromEntries(WIDGET_DEFINITIONS.map(item => [item.key, item.meta])) as WidgetList;

export const createWidgetDefaultData = function (code: string): WidgetData {
    return WIDGET_DEFINITION_MAP.get(code)?.createDefaultData() ?? useTextCreateDefaultData();
};

export const getWidgetGroup = function () {
    return WIDGET_GROUPS.map(group => ({
        groupName: group.groupName,
        children: WIDGET_DEFINITIONS.filter(item => item.group === group.code)
            .sort((left, right) => left.groupOrder - right.groupOrder)
            .map(item => item.meta)
    }));
};

export const getWidgetList = function (): WidgetList {
    return { ...WIDGET_LIST };
};

export const getWidgetComponentAttributes = function (widgetData: WidgetBaseData, value: any): Record<string, any> {
    const definition = WIDGET_DEFINITION_MAP.get(widgetData.code);
    if (definition?.getAttributes) {
        return definition.getAttributes(widgetData, value);
    }
    return useTextAttributes(widgetData as WidgetTextData);
};

export const getWidgetComponentEvents = function (widgetData: WidgetBaseData, formData: Record<string, any>, widgetFormData: WidgetFormData): Record<string, any> {
    return WIDGET_DEFINITION_MAP.get(widgetData.code)?.getEvents?.(widgetData, formData, widgetFormData) ?? {};
};
