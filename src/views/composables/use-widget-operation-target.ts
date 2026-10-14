/**
 * @fileoverview 管理设计画布中唯一可见的组件操作目标。
 * @remarks 将悬停、键盘聚焦和业务选中分开记录，避免嵌套组件依赖 CSS `:hover` 时父子工具条同时显示。
 */
import { computed, ref, type ComputedRef, type Ref } from "vue";

/**
 * @description 画布操作目标组合式函数的返回能力。
 */
export interface WidgetOperationTarget {
    /** 当前应显示操作区的组件 ID。 */
    activeOperationWidgetId: ComputedRef<string | null>;
    /** 将指定组件设为当前悬停目标。 */
    setHoveredWidgetId: (id: string) => void;
    /** 仅在指定组件仍为悬停目标时清除它。 */
    clearHoveredWidgetId: (id: string) => void;
    /** 设置键盘焦点所属组件；传入 null 表示焦点已离开画布节点。 */
    setFocusedWidgetId: (id: string | null) => void;
}

/**
 * @description 根据悬停、聚焦和选中状态解析唯一的画布操作目标。
 * @param selectedWidgetId - 设计器当前业务选中组件 ID；未注入时按未选中处理。
 * @returns 当前活动目标及更新悬停、聚焦状态的方法。
 * @remarks 优先级为悬停、键盘聚焦、业务选中。悬停另一个节点时暂时覆盖选中工具条，移开后自动恢复选中节点。
 */
export const useWidgetOperationTarget = function (selectedWidgetId?: Readonly<Ref<string | null>>): WidgetOperationTarget {
    // 指针当前所在的最内层可操作组件。
    const hoveredWidgetId = ref<string | null>(null);

    // 键盘焦点当前所属的最内层可操作组件。
    const focusedWidgetId = ref<string | null>(null);

    /**
     * @description 当前唯一允许展示工具条的组件 ID。
     */
    const activeOperationWidgetId = computed(() => hoveredWidgetId.value ?? focusedWidgetId.value ?? selectedWidgetId?.value ?? null);

    /**
     * @description 将指定组件设为当前悬停目标。
     * @param id - 鼠标当前所在组件的稳定 ID。
     * @returns 无返回值；该函数更新临时悬停状态。
     */
    const setHoveredWidgetId = function (id: string): void {
        hoveredWidgetId.value = id;
    };

    /**
     * @description 清除已经离开的悬停目标。
     * @param id - 触发离开事件的组件 ID。
     * @returns 无返回值；只有 ID 仍匹配时才清空，避免父节点离开事件误删子节点状态。
     */
    const clearHoveredWidgetId = function (id: string): void {
        if (hoveredWidgetId.value === id) {
            hoveredWidgetId.value = null;
        }
    };

    /**
     * @description 更新键盘焦点所属组件。
     * @param id - 获得焦点的组件 ID；焦点离开节点时传入 null。
     * @returns 无返回值；该函数更新临时焦点状态。
     */
    const setFocusedWidgetId = function (id: string | null): void {
        focusedWidgetId.value = id;
    };

    return { activeOperationWidgetId, setHoveredWidgetId, clearHoveredWidgetId, setFocusedWidgetId };
};
