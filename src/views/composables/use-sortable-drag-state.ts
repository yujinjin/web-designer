/**
 * @fileoverview 管理当前拖拽来源的响应式状态，连接 Sortable 生命周期与 Tooltip 显隐。
 * @remarks 状态按组件作用域创建；结束、取消和卸载都必须调用 stopDragging，避免原生拖拽不触发 mouseleave 时留下提示弹层。
 */
import { readonly, ref, type Ref } from "vue";

/** 当前拖拽作用域提供的状态与清理能力。 */
export interface SortableDragState {
    /** 只读拖拽状态；外部通过生命周期方法更新。 */
    isDragging: Readonly<Ref<boolean>>;
    /** 标记来源开始拖拽。 */
    startDragging: () => void;
    /** 结束、取消或卸载时清除拖拽状态。 */
    stopDragging: () => void;
}

/**
 * @description 创建独立的拖拽生命周期状态。
 * @returns 只读状态及开始、停止方法。
 */
export const useSortableDragState = function (): SortableDragState {
    // 当前来源是否正在拖拽，不能与其他来源共享可变状态。
    const isDragging = ref(false);
    /** @description 在 Sortable 开始回调中设置拖拽状态。 @returns 无返回值。 */
    const startDragging = function (): void {
        isDragging.value = true;
    };
    /** @description 在结束、取消或卸载时清除拖拽状态。 @returns 无返回值。 */
    const stopDragging = function (): void {
        isDragging.value = false;
    };
    return { isDragging: readonly(isDragging), startDragging, stopDragging };
};
