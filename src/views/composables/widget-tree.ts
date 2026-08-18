import { randomId } from "@yujinjin/utils";
import { type Mutable } from "/#/global.d";
import { WIDGET_ROW_CONTAINER } from "./widgets/row-container";
import { type WidgetBaseData, type WidgetData, type WidgetNormalData, type WidgetRowContainerData } from "./types";

export interface WidgetFindResult {
    widgetData: WidgetData;
    widgetIndex: number;
    parentWidgetData: WidgetRowContainerData | null;
    siblings: WidgetData[] | WidgetNormalData[];
}

export const isRowContainerWidget = function (widgetData: WidgetData | WidgetBaseData | undefined | null): widgetData is WidgetRowContainerData {
    return Boolean(widgetData && widgetData.code === WIDGET_ROW_CONTAINER.code && "widgets" in widgetData && Array.isArray((widgetData as WidgetRowContainerData).widgets));
};

export const findWidgetData = function (widgets: Array<WidgetData>, widgetId: string | null): WidgetFindResult | null {
    if (!widgetId) {
        return null;
    }
    for (let index = 0; index < widgets.length; index++) {
        const widgetData = widgets[index];
        if (widgetData.id === widgetId) {
            return {
                widgetData,
                widgetIndex: index,
                parentWidgetData: null,
                siblings: widgets
            };
        }
        if (isRowContainerWidget(widgetData)) {
            const childIndex = widgetData.widgets.findIndex(item => item.id === widgetId);
            if (childIndex !== -1) {
                return {
                    widgetData: widgetData.widgets[childIndex],
                    widgetIndex: childIndex,
                    parentWidgetData: widgetData,
                    siblings: widgetData.widgets
                };
            }
        }
    }
    return null;
};

const resetNormalWidgetId = function (widgetData: WidgetNormalData) {
    const mutableWidgetData = widgetData as Mutable<WidgetNormalData>;
    const id = widgetData.code.replace(/-/g, "_") + "_" + randomId();
    mutableWidgetData.id = id;
    widgetData.propName = id;
    if (widgetData.settingData) {
        widgetData.settingData.propName = id;
    }
    if (widgetData.formAttributes) {
        widgetData.formAttributes.prop = id;
    }
};

export const cloneWidgetData = function (widgetData: WidgetData): WidgetData {
    const newWidgetData = JSON.parse(JSON.stringify(widgetData)) as WidgetData;
    if (isRowContainerWidget(newWidgetData)) {
        (newWidgetData as Mutable<WidgetRowContainerData>).id = WIDGET_ROW_CONTAINER.code.replace(/-/g, "_") + "_" + randomId();
        newWidgetData.widgets.forEach(item => resetNormalWidgetId(item));
    } else {
        resetNormalWidgetId(newWidgetData as WidgetNormalData);
    }
    return newWidgetData;
};

export const getNextSelectedId = function (siblings: Array<WidgetData> | Array<WidgetNormalData>, deleteIndex: number) {
    if (siblings.length === 0) {
        return null;
    }
    if (deleteIndex >= siblings.length) {
        return siblings[deleteIndex - 1]?.id ?? null;
    }
    return siblings[deleteIndex]?.id ?? null;
};
