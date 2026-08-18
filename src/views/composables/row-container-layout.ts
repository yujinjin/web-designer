import { type WidgetRowContainerData } from "./types";

export const ROW_CONTAINER_MAX_WIDGET_COUNT = 6;

export const calcAverageSpans = function (count: number) {
    if (!Number.isInteger(count) || count <= 0) {
        return [];
    }
    const baseSpan = Math.floor(24 / count);
    const remainder = 24 % count;
    return Array.from({ length: count }, (_, index) => baseSpan + (index < remainder ? 1 : 0));
};

export const normalizeRowContainerSpan = function (value: unknown) {
    const span = Math.trunc(Number(value));
    if (!Number.isFinite(span) || span < 1) {
        return 1;
    }
    if (span > 24) {
        return 24;
    }
    return span;
};

export const syncRowContainerSpans = function (rowContainerData: WidgetRowContainerData) {
    if (rowContainerData.settingData.enableSpanConfig) {
        rowContainerData.settingData.spans = rowContainerData.widgets.map((_item, index) => normalizeRowContainerSpan(rowContainerData.settingData.spans[index] ?? 1));
        return;
    }
    rowContainerData.settingData.spans = calcAverageSpans(rowContainerData.widgets.length);
};

export const insertManualSpan = function (rowContainerData: WidgetRowContainerData, index: number) {
    const currentRowUsedSpan = rowContainerData.settingData.spans.reduce((total, span) => total + normalizeRowContainerSpan(span), 0) % 24;
    const nextSpan = currentRowUsedSpan === 0 ? 1 : Math.max(1, 24 - currentRowUsedSpan);
    rowContainerData.settingData.spans.splice(index, 0, nextSpan);
};

export const moveRowContainerSpan = function (rowContainerData: WidgetRowContainerData, oldIndex: number, newIndex: number) {
    const movedSpan = rowContainerData.settingData.spans.splice(oldIndex, 1)[0];
    rowContainerData.settingData.spans.splice(newIndex, 0, movedSpan ?? 24);
};
