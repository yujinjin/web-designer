import { type Reactive, type Ref } from "vue";
import { randomId } from "@yujinjin/utils";
import { useSettingDataValueChange } from "@/views/composables/widgets/form";
import {
    type WidgetFormData,
    type WidgetBaseData,
    type UseSettingDataValueChangeFun,
    type ChangeSelectedWidgetSettingDataFun,
    type WidgetTextData,
    type WidgetInputNumberData,
    type WidgetRadioGroupData,
    type WidgetCheckboxGroupData,
    type WidgetSelectData,
    type WidgetDatePickerData,
    type WidgetTimePickerData,
    type WidgetTimeSelectData,
    type WidgetSwitchData,
    type WidgetRateData,
    type WidgetColorPickerData,
    type WidgetSliderData,
    type WidgetUploadData,
    type WidgetAlertData,
    type WidgetDividerData
} from "@/views/composables/types";

import { WIDGET_TEXT, useAttributes as useTextAttributes, useEvents as useTextEvents, useCreateDefaultData as useTextCreateDefaultData } from "@/views/composables/widgets/text";
import {
    WIDGET_INPUT_NUMBER,
    useAttributes as useInputNumberAttributes,
    useEvents as useInputNumberEvents,
    useCreateDefaultData as useInputNumberCreateDefaultData
} from "@/views/composables/widgets/input-number";
import {
    WIDGET_RADIO_GROUP,
    useAttributes as useRadioGroupAttributes,
    useEvents as useRadioGroupEvents,
    useCreateDefaultData as useRadioGroupCreateDefaultData
} from "@/views/composables/widgets/radio-group";
import {
    WIDGET_CHECKBOX_GROUP,
    useAttributes as useCheckboxGroupAttributes,
    useEvents as useCheckboxGroupEvents,
    useCreateDefaultData as useCheckboxGroupCreateDefaultData
} from "@/views/composables/widgets/checkbox-group";
import { WIDGET_SELECT, useAttributes as useSelectAttributes, useEvents as useSelectEvents, useCreateDefaultData as useSelectCreateDefaultData } from "@/views/composables/widgets/select";
import {
    WIDGET_DATE_PICKER,
    useAttributes as useDatePickerAttributes,
    useEvents as useDatePickerEvents,
    useCreateDefaultData as useDatePickerCreateDefaultData
} from "@/views/composables/widgets/date-picker";
import {
    WIDGET_TIME_PICKER,
    useAttributes as useTimePickerAttributes,
    useEvents as useTimePickerEvents,
    useCreateDefaultData as useTimePickerCreateDefaultData
} from "@/views/composables/widgets/time-picker";
import {
    WIDGET_TIME_SELECT,
    useAttributes as useTimeSelectAttributes,
    useEvents as useTimeSelectEvents,
    useCreateDefaultData as useTimeSelectCreateDefaultData
} from "@/views/composables/widgets/time-select";
import { WIDGET_SWITCH, useAttributes as useSwitchAttributes, useEvents as useSwitchEvents, useCreateDefaultData as useSwitchCreateDefaultData } from "@/views/composables/widgets/switch";
import { WIDGET_RATE, useAttributes as useRateAttributes, useEvents as useRateEvents, useCreateDefaultData as useRateCreateDefaultData } from "@/views/composables/widgets/rate";
import {
    WIDGET_COLOR_PICKER,
    useAttributes as useColorPickerAttributes,
    useEvents as useColorPickerEvents,
    useCreateDefaultData as useColorPickerCreateDefaultData
} from "@/views/composables/widgets/color-picker";
import { WIDGET_SLIDER, useAttributes as useSliderAttributes, useEvents as useSliderEvents, useCreateDefaultData as useSliderCreateDefaultData } from "@/views/composables/widgets/slider";
import { WIDGET_UPLOAD, useAttributes as useUploadAttributes, useCreateDefaultData as useUploadCreateDefaultData } from "@/views/composables/widgets/upload";
import { WIDGET_HTML, useCreateDefaultData as useHtmlCreateDefaultData } from "@/views/composables/widgets/html";
import { WIDGET_ALERT, useAttributes as useAlertAttributes, useCreateDefaultData as useAlertCreateDefaultData } from "@/views/composables/widgets/alert";
import { WIDGET_DIVIDER, useAttributes as useDividerAttributes, useCreateDefaultData as useDividerCreateDefaultData } from "@/views/composables/widgets/divider";

export default function useWidgetManage(widgetFormData: Reactive<WidgetFormData>, selectedWigetId: Ref<string | null>) {
    // 改变选中的组件id
    const changeSelectedWidgetId = function (id: string | null) {
        selectedWigetId.value = id;
    };

    // 改变选中的组件的设置数据
    const changeSelectedWidgetSettingData: ChangeSelectedWidgetSettingDataFun = function (useSettingDataValueChangeFun: UseSettingDataValueChangeFun, fileName: string, value: any) {
        if (!selectedWigetId.value || !widgetFormData.widgets.length) {
            return;
        }
        const widgetData = widgetFormData.widgets.find((item: any) => item.id === selectedWigetId.value);
        if (widgetData) {
            useSettingDataValueChangeFun(widgetData, fileName as keyof WidgetBaseData["settingData"], value);
        }
    };

    // 考虑框架上规范设计不违背provide/inject 的设计语义（数据溯源困难、逻辑耦合、状态混乱），这里封装改变表单数据
    const changeFormSettingData = function (fileName: keyof WidgetFormData["settingData"], value: any) {
        useSettingDataValueChange(widgetFormData as any, fileName, value);
    };

    // 插入组件的默认数据
    const insertWidgetDefaultData = function (code: string, newIndex: number) {
        let widgetData: WidgetBaseData;
        switch (code) {
            case WIDGET_TEXT.code:
                widgetData = useTextCreateDefaultData();
                break;
            case WIDGET_INPUT_NUMBER.code:
                widgetData = useInputNumberCreateDefaultData();
                break;
            case WIDGET_RADIO_GROUP.code:
                widgetData = useRadioGroupCreateDefaultData();
                break;
            case WIDGET_CHECKBOX_GROUP.code:
                widgetData = useCheckboxGroupCreateDefaultData();
                break;
            case WIDGET_SELECT.code:
                widgetData = useSelectCreateDefaultData();
                break;
            case WIDGET_DATE_PICKER.code:
                widgetData = useDatePickerCreateDefaultData();
                break;
            case WIDGET_TIME_PICKER.code:
                widgetData = useTimePickerCreateDefaultData();
                break;
            case WIDGET_TIME_SELECT.code:
                widgetData = useTimeSelectCreateDefaultData();
                break;
            case WIDGET_SWITCH.code:
                widgetData = useSwitchCreateDefaultData();
                break;
            case WIDGET_RATE.code:
                widgetData = useRateCreateDefaultData();
                break;
            case WIDGET_COLOR_PICKER.code:
                widgetData = useColorPickerCreateDefaultData();
                break;
            case WIDGET_SLIDER.code:
                widgetData = useSliderCreateDefaultData();
                break;
            case WIDGET_UPLOAD.code:
                widgetData = useUploadCreateDefaultData();
                break;
            case WIDGET_HTML.code:
                widgetData = useHtmlCreateDefaultData();
                break;
            case WIDGET_ALERT.code:
                widgetData = useAlertCreateDefaultData();
                break;
            case WIDGET_DIVIDER.code:
                widgetData = useDividerCreateDefaultData();
                break;
            default:
                widgetData = useTextCreateDefaultData();
                break;
        }
        // @ts-ignore
        widgetFormData.widgets.splice(newIndex, 0, widgetData);
    };

    // 复制组件数据
    const copyWidgetData = function (newIndex: number, copyIndex: number) {
        const newWidgetData = JSON.parse(JSON.stringify(widgetFormData.widgets[copyIndex]));
        const id = newWidgetData.id.substring(0, newWidgetData.id.lastIndexOf("_") + 1) + randomId();
        newWidgetData.id = id;
        newWidgetData.propName = id;
        newWidgetData.settingData.propName = id;
        if (newWidgetData.formAttributes) {
            newWidgetData.formAttributes.prop = id;
        }
        widgetFormData.widgets.splice(newIndex, 0, newWidgetData);
        changeSelectedWidgetId(id);
    };

    // 更新组件的顺序
    const updateWidgetOrder = function (oldIndex: number, newIndex: number) {
        widgetFormData.widgets.splice(newIndex, 0, widgetFormData.widgets.splice(oldIndex, 1)[0]);
    };

    // 删除组件
    const deleteWidget = function (widgetId: string) {
        const findIndex = widgetFormData.widgets.findIndex((item: any) => item.id === widgetId);
        if (findIndex !== -1) {
            widgetFormData.widgets.splice(findIndex, 1);
            if (selectedWigetId.value === widgetId) {
                if (widgetFormData.widgets.length === 0) {
                    selectedWigetId.value = null;
                } else if (findIndex >= widgetFormData.widgets.length) {
                    selectedWigetId.value = widgetFormData.widgets[findIndex - 1].id;
                } else {
                    selectedWigetId.value = widgetFormData.widgets[findIndex].id;
                }
            }
        }
    };

    // 清空组件
    const clearWidgets = function () {
        widgetFormData.widgets.splice(0, widgetFormData.widgets.length);
    };

    return {
        changeSelectedWidgetId,
        changeSelectedWidgetSettingData,
        changeFormSettingData,
        insertWidgetDefaultData,
        updateWidgetOrder,
        copyWidgetData,
        deleteWidget,
        clearWidgets
    };
}

// 获取组件的分组数据
export const getWidgetGroup = function () {
    return [
        {
            groupName: "布局型组件",
            children: []
        },
        {
            groupName: "输入型组件",
            children: [WIDGET_TEXT, WIDGET_INPUT_NUMBER]
        },
        {
            groupName: "选择型组件",
            children: [WIDGET_SELECT, WIDGET_RADIO_GROUP, WIDGET_CHECKBOX_GROUP, WIDGET_SWITCH, WIDGET_SLIDER, WIDGET_UPLOAD]
        },
        {
            groupName: "日期时间型组件",
            children: [WIDGET_DATE_PICKER, WIDGET_TIME_PICKER, WIDGET_TIME_SELECT]
        },
        {
            groupName: "其他",
            children: [WIDGET_COLOR_PICKER, WIDGET_RATE, WIDGET_HTML, WIDGET_ALERT, WIDGET_DIVIDER]
        }
    ];
};

// 获取组件的列表数据
export const getWidgetList = function () {
    return {
        WIDGET_TEXT,
        WIDGET_INPUT_NUMBER,
        WIDGET_RADIO_GROUP,
        WIDGET_CHECKBOX_GROUP,
        WIDGET_SELECT,
        WIDGET_DATE_PICKER,
        WIDGET_TIME_PICKER,
        WIDGET_TIME_SELECT,
        WIDGET_SWITCH,
        WIDGET_RATE,
        WIDGET_COLOR_PICKER,
        WIDGET_SLIDER,
        WIDGET_UPLOAD,
        WIDGET_HTML,
        WIDGET_ALERT,
        WIDGET_DIVIDER
    };
};

// 获取组件的绑定的属性数据
export const getWidgetComponentAttributes = function (widgetData: WidgetBaseData, value: any): Record<string, any> {
    switch (widgetData.code) {
        case WIDGET_TEXT.code:
            return useTextAttributes(widgetData as WidgetTextData);
        case WIDGET_INPUT_NUMBER.code:
            return useInputNumberAttributes(widgetData as WidgetInputNumberData);
        case WIDGET_RADIO_GROUP.code:
            return useRadioGroupAttributes(widgetData as WidgetRadioGroupData);
        case WIDGET_CHECKBOX_GROUP.code:
            return useCheckboxGroupAttributes(widgetData as WidgetCheckboxGroupData);
        case WIDGET_SELECT.code:
            return useSelectAttributes(widgetData as WidgetSelectData);
        case WIDGET_DATE_PICKER.code:
            return useDatePickerAttributes(widgetData as WidgetDatePickerData, value);
        case WIDGET_TIME_PICKER.code:
            return useTimePickerAttributes(widgetData as WidgetTimePickerData, value);
        case WIDGET_TIME_SELECT.code:
            return useTimeSelectAttributes(widgetData as WidgetTimeSelectData);
        case WIDGET_SWITCH.code:
            return useSwitchAttributes(widgetData as WidgetSwitchData, value);
        case WIDGET_RATE.code:
            return useRateAttributes(widgetData as WidgetRateData);
        case WIDGET_COLOR_PICKER.code:
            return useColorPickerAttributes(widgetData as WidgetColorPickerData);
        case WIDGET_SLIDER.code:
            return useSliderAttributes(widgetData as WidgetSliderData);
        case WIDGET_UPLOAD.code:
            return useUploadAttributes(widgetData as WidgetUploadData, value);
        case WIDGET_ALERT.code:
            return useAlertAttributes(widgetData as WidgetAlertData);
        case WIDGET_DIVIDER.code:
            return useDividerAttributes(widgetData as WidgetDividerData);
    }
    return useTextAttributes(widgetData as WidgetTextData);
};

// 获取组件的绑定的事件数据
export const getWidgetComponentEvents = function (widgetData: WidgetBaseData, formData: Record<string, any>, widgetFormData: WidgetFormData) {
    switch (widgetData.code) {
        case WIDGET_TEXT.code:
            return useTextEvents(widgetData as WidgetTextData, formData, widgetFormData!);
        case WIDGET_INPUT_NUMBER.code:
            return useInputNumberEvents(widgetData as WidgetInputNumberData, formData, widgetFormData!);
        case WIDGET_RADIO_GROUP.code:
            return useRadioGroupEvents(widgetData as WidgetRadioGroupData, formData, widgetFormData!);
        case WIDGET_CHECKBOX_GROUP.code:
            return useCheckboxGroupEvents(widgetData as WidgetCheckboxGroupData, formData, widgetFormData!);
        case WIDGET_SELECT.code:
            return useSelectEvents(widgetData as WidgetSelectData, formData, widgetFormData!);
        case WIDGET_DATE_PICKER.code:
            return useDatePickerEvents(widgetData as WidgetDatePickerData, formData, widgetFormData!);
        case WIDGET_TIME_PICKER.code:
            return useTimePickerEvents(widgetData as WidgetTimePickerData, formData, widgetFormData!);
        case WIDGET_TIME_SELECT.code:
            return useTimeSelectEvents(widgetData as WidgetTimeSelectData, formData, widgetFormData!);
        case WIDGET_SWITCH.code:
            return useSwitchEvents(widgetData as WidgetSwitchData, formData, widgetFormData!);
        case WIDGET_RATE.code:
            return useRateEvents(widgetData as WidgetRateData, formData, widgetFormData!);
        case WIDGET_COLOR_PICKER.code:
            return useColorPickerEvents(widgetData as WidgetColorPickerData, formData, widgetFormData!);
        case WIDGET_SLIDER.code:
            return useSliderEvents(widgetData as WidgetSliderData, formData, widgetFormData!);
        default:
            return {};
    }
};
