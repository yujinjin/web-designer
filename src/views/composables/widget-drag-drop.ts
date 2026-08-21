/**
 * @fileoverview 统一设计器组件库、顶层画布和行容器的 SortableJS 分组与拖拽状态。
 * @remarks 明确来源组、目标接收名单和可拖元素选择器，避免嵌套 Sortable 共享无边界分组时竞争同一个临时克隆。
 */
import { readonly, ref, type Ref } from "vue";

/** 组件库的 Sortable 来源组名称。 */
export const WIDGET_LIBRARY_SORTABLE_GROUP = "widget-library";

/** 顶层画布的 Sortable 组名称。 */
export const DESIGNER_ROOT_SORTABLE_GROUP = "designer-root";

/** 组件库中允许作为拖拽源的直接子元素。 */
export const WIDGET_LIBRARY_DRAGGABLE_SELECTOR = ".widget-item";

/** 顶层画布中的真实组件和组件库临时克隆。 */
export const DESIGNER_ROOT_DRAGGABLE_SELECTOR = ".drag-item, .widget-item";

/** 行容器中的真实子组件和组件库临时克隆。 */
export const ROW_CONTAINER_DRAGGABLE_SELECTOR = ".row-container-child, .widget-item";

/**
 * @description SortableJS 分组配置使用的最小结构。
 * @remarks 保持该类型与 SortableJS 的公开 group 选项一致，同时避免 UI 组件重复拼接组名和接收名单。
 */
export interface WidgetSortableGroup {
    /** 当前 Sortable 实例的稳定组名。 */
    name: string;
    /** 是否允许把现有列表项拖出当前列表；组件库使用 clone，目标列表禁止跨父级移出。 */
    pull: "clone" | false;
    /** 允许接收的来源组；false 表示当前列表不接收外部元素。 */
    put: string[] | false;
}

/**
 * @description 生成组件库只克隆、不接收的来源组配置。
 * @returns 可直接传给 SortableJS `group` 的配置。
 */
export const createWidgetLibrarySortableGroup = function (): WidgetSortableGroup {
    return { name: WIDGET_LIBRARY_SORTABLE_GROUP, pull: "clone", put: false };
};

/**
 * @description 生成仅接收组件库克隆的目标组配置。
 * @param name - 顶层画布或具体行容器的唯一组名。
 * @returns 禁止跨父级移出、只接收组件库来源的 SortableJS 分组配置。
 */
export const createWidgetLibraryTargetGroup = function (name: string): WidgetSortableGroup {
    return { name, pull: false, put: [WIDGET_LIBRARY_SORTABLE_GROUP] };
};

/**
 * @description 生成行容器独立的 Sortable 组名。
 * @param widgetId - 行容器组件 ID。
 * @returns 带容器 ID 的组名，防止不同父容器被视为同一个可迁移列表。
 */
export const getRowContainerSortableGroupName = function (widgetId: string): string {
    return `row-container:${widgetId}`;
};

/**
 * @description Sortable 拖拽生命周期状态。
 */
export interface SortableDragState {
    /** 当前是否处于拖拽中；只读引用避免模板之外直接改值。 */
    isDragging: Readonly<Ref<boolean>>;
    /** 标记拖拽开始。 */
    startDragging: () => void;
    /** 标记拖拽结束、取消或卸载清理。 */
    stopDragging: () => void;
}

/**
 * @description 管理需要跨 Sortable 回调共享的局部拖拽状态。
 * @returns 只读拖拽状态及开始、停止方法。
 * @remarks 原生拖拽可能不触发源元素 mouseleave；由 onStart/onEnd/onUnchoose 显式收口状态更可靠。
 */
export const useSortableDragState = function (): SortableDragState {
    const isDragging = ref(false);

    const startDragging = function (): void {
        isDragging.value = true;
    };

    const stopDragging = function (): void {
        isDragging.value = false;
    };

    return { isDragging: readonly(isDragging), startDragging, stopDragging };
};
