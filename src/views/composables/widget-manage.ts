import { type Ref } from "vue";
import { useSettingDataValueChange } from "./widgets/form";
import { WIDGET_ROW_CONTAINER } from "./widgets/row-container";
import {
    type ChangeSelectedWidgetSettingDataFun,
    type UseSettingDataValueChangeFun,
    type WidgetBaseData,
    type WidgetData,
    type WidgetFormData,
    type WidgetNormalData,
    type WidgetRowContainerData
} from "./types";
import { createWidgetDefaultData } from "./widget-registry";
import { cloneWidgetData, findWidgetData, getNextSelectedId, isRowContainerWidget } from "./widget-tree";
import { insertManualSpan, moveRowContainerSpan, ROW_CONTAINER_MAX_WIDGET_COUNT, syncRowContainerSpans } from "./row-container-layout";

export default function useWidgetManage(widgetFormData: WidgetFormData, selectedWigetId: Ref<string | null>) {
    const getTopWidgets = function () {
        return widgetFormData.widgets;
    };

    // 改变选中的组件id
    const changeSelectedWidgetId = function (id: string | null) {
        selectedWigetId.value = id;
    };

    // 改变选中的组件的设置数据
    const changeSelectedWidgetSettingData: ChangeSelectedWidgetSettingDataFun = function (useSettingDataValueChangeFun: UseSettingDataValueChangeFun, fileName: string, value: any) {
        if (!selectedWigetId.value || !widgetFormData.widgets.length) {
            return;
        }
        const result = findWidgetData(getTopWidgets(), selectedWigetId.value);
        if (result?.widgetData) {
            useSettingDataValueChangeFun(result.widgetData, fileName as keyof WidgetBaseData["settingData"], value);
        }
    };

    // 考虑框架上规范设计不违背provide/inject 的设计语义（数据溯源困难、逻辑耦合、状态混乱），这里封装改变表单数据
    const changeFormSettingData = function (fileName: keyof WidgetFormData["settingData"], value: any) {
        useSettingDataValueChange(widgetFormData, fileName, value);
    };

    // 插入组件的默认数据
    const insertWidgetDefaultData = function (code: string, newIndex: number, parentWidgetId?: string) {
        if (parentWidgetId) {
            const result = findWidgetData(getTopWidgets(), parentWidgetId);
            if (!result || !isRowContainerWidget(result.widgetData) || code === WIDGET_ROW_CONTAINER.code || result.widgetData.widgets.length >= ROW_CONTAINER_MAX_WIDGET_COUNT) {
                return;
            }
            const widgetData = createWidgetDefaultData(code);
            if (isRowContainerWidget(widgetData)) {
                return;
            }
            const insertIndex = Math.max(0, Math.min(newIndex, result.widgetData.widgets.length));
            result.widgetData.widgets.splice(insertIndex, 0, widgetData as WidgetNormalData);
            if (result.widgetData.settingData.enableSpanConfig) {
                insertManualSpan(result.widgetData, insertIndex);
            } else {
                syncRowContainerSpans(result.widgetData);
            }
            changeSelectedWidgetId(widgetData.id);
            return;
        }
        const widgetData = createWidgetDefaultData(code);
        const topWidgets = getTopWidgets();
        const insertIndex = Math.max(0, Math.min(newIndex, topWidgets.length));
        topWidgets.splice(insertIndex, 0, widgetData);
        changeSelectedWidgetId(widgetData.id);
    };

    // 复制组件数据
    const copyWidgetData = function (newIndex: number, copyIndex: number) {
        const topWidgets = getTopWidgets();
        const copiedWidgetData = topWidgets[copyIndex];
        if (!copiedWidgetData) {
            return;
        }
        const newWidgetData = cloneWidgetData(copiedWidgetData);
        const insertIndex = Math.max(0, Math.min(newIndex, topWidgets.length));
        topWidgets.splice(insertIndex, 0, newWidgetData);
        changeSelectedWidgetId(newWidgetData.id);
    };

    // 更新组件的顺序
    const updateWidgetOrder = function (oldIndex: number, newIndex: number, parentWidgetId?: string) {
        const topWidgets = getTopWidgets();
        let widgets = topWidgets as Array<WidgetData | WidgetNormalData>;
        let rowContainerData: WidgetRowContainerData | null = null;
        if (parentWidgetId) {
            const result = findWidgetData(topWidgets, parentWidgetId);
            if (!result || !isRowContainerWidget(result.widgetData)) {
                return;
            }
            rowContainerData = result.widgetData;
            widgets = rowContainerData.widgets as WidgetNormalData[];
        }
        if (oldIndex < 0 || newIndex < 0 || oldIndex >= widgets.length || newIndex >= widgets.length || oldIndex === newIndex) {
            return;
        }
        const movedWidgetData = widgets.splice(oldIndex, 1)[0];
        if (!movedWidgetData) {
            return;
        }
        widgets.splice(newIndex, 0, movedWidgetData);
        if (rowContainerData) {
            moveRowContainerSpan(rowContainerData, oldIndex, newIndex);
        }
    };

    const deleteWidget = function (widgetId: string) {
        const result = findWidgetData(getTopWidgets(), widgetId);
        if (!result) {
            return;
        }
        result.siblings.splice(result.widgetIndex, 1);
        if (result.parentWidgetData) {
            result.parentWidgetData.settingData.spans.splice(result.widgetIndex, 1);
            syncRowContainerSpans(result.parentWidgetData);
        }
        if (selectedWigetId.value === widgetId) {
            selectedWigetId.value = getNextSelectedId(result.siblings, result.widgetIndex);
        }
    };

    // 清空组件数据
    const clearWidgets = function () {
        widgetFormData.widgets.splice(0, widgetFormData.widgets.length);
        selectedWigetId.value = null;
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
