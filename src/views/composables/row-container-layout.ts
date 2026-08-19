/**
 * @fileoverview 行容器 24 栅格布局计算模块，负责自动均分、手动宽度归一化以及组件增删移动时的 span 同步。
 * @remarks 自动模式保证单次均分结果总和为 24；手动模式优先保留用户已配置宽度，仅对新增或非法值进行最小修正。
 */
import { type WidgetRowContainerData } from "./types";

/**
 * @description 行容器允许容纳的最大普通组件数量。
 * @remarks 上限用于限制拖拽布局复杂度，并避免 24 栅格均分后单项宽度过小。
 */
export const ROW_CONTAINER_MAX_WIDGET_COUNT = 6;

/**
 * @description 将 24 栅格尽可能平均分配给指定数量的组件。
 * @param count 需要分配宽度的组件数量，必须是正整数。
 * @returns 总和为 24 的新 span 数组；非法或非正整数返回空数组。
 * @remarks 不能整除时把余数从左到右各增加 1，保证结果稳定且不丢失栅格。
 */
export const calcAverageSpans = function (count: number) {
    if (!Number.isInteger(count) || count <= 0) {
        return [];
    }
    // 记录每个组件至少能够获得的整数栅格数。
    const baseSpan = Math.floor(24 / count);
    // 记录均分后需要从左到右补齐的剩余栅格数。
    const remainder = 24 % count;
    return Array.from({ length: count }, (_item, index) => baseSpan + (index < remainder ? 1 : 0));
};

/**
 * @description 把外部 span 值归一化为 Element Plus 栅格允许的整数范围。
 * @param value 待归一化的未知输入。
 * @returns 1 至 24 之间的整数；不可转换或小于 1 时返回 1。
 */
export const normalizeRowContainerSpan = function (value: unknown) {
    // 将外部输入转换为可参与边界判断的整数栅格值。
    const span = Math.trunc(Number(value));
    if (!Number.isFinite(span) || span < 1) {
        return 1;
    }
    if (span > 24) {
        return 24;
    }
    return span;
};

/**
 * @description 按行容器当前模式同步 spans 与子组件数量。
 * @param rowContainerData 将被原地更新的行容器数据。
 * @returns 无返回值。
 * @remarks 手动模式保留对应索引的宽度并补齐缺项，自动模式重新平均分配全部 24 栅格。
 */
export const syncRowContainerSpans = function (rowContainerData: WidgetRowContainerData) {
    if (rowContainerData.settingData.enableSpanConfig) {
        // 手动模式按子组件索引保留已有宽度，缺失或非法配置统一归一化。
        rowContainerData.settingData.spans = rowContainerData.widgets.map((_item, index) => normalizeRowContainerSpan(rowContainerData.settingData.spans[index] ?? 1));
        return;
    }
    rowContainerData.settingData.spans = calcAverageSpans(rowContainerData.widgets.length);
};

/**
 * @description 在手动布局模式中为新组件插入一个 span。
 * @param rowContainerData 将被原地更新的行容器数据。
 * @param index 新组件在子组件数组中的目标索引。
 * @returns 无返回值。
 * @remarks 新宽度优先使用当前行剩余栅格；当前行已满时使用最小宽度 1，避免重算已有人工配置。
 */
export const insertManualSpan = function (rowContainerData: WidgetRowContainerData, index: number) {
    // 计算当前最后一行已经占用的栅格数。
    const currentRowUsedSpan = rowContainerData.settingData.spans.reduce((total, span) => total + normalizeRowContainerSpan(span), 0) % 24;
    // 优先把最后一行剩余栅格分给新组件，满行时使用最小宽度。
    const nextSpan = currentRowUsedSpan === 0 ? 1 : Math.max(1, 24 - currentRowUsedSpan);
    rowContainerData.settingData.spans.splice(index, 0, nextSpan);
};

/**
 * @description 在组件排序后同步移动同索引的手动 span。
 * @param rowContainerData 将被原地更新的行容器数据。
 * @param oldIndex 移动前索引。
 * @param newIndex 移动后索引。
 * @returns 无返回值。
 * @remarks 缺失旧 span 时使用 24 作为容错值；调用方负责校验索引合法性。
 */
export const moveRowContainerSpan = function (rowContainerData: WidgetRowContainerData, oldIndex: number, newIndex: number) {
    // 暂存与被移动组件同索引的手动栅格宽度。
    const movedSpan = rowContainerData.settingData.spans.splice(oldIndex, 1)[0];
    rowContainerData.settingData.spans.splice(newIndex, 0, movedSpan ?? 24);
};
