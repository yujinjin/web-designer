<template>
    <div class="row-container-renderer" @click.stop="changeSelectedWidgetId?.(widgetData.id)">
        <div class="row-container-drop-area">
            <el-row ref="rowGridRef" class="row-container-grid" :gutter="widgetData.settingData.gutter" :justify="widgetData.settingData.justify" :align="widgetData.settingData.align">
                <el-col
                    v-for="(item, index) in widgetData.widgets"
                    :key="item.id"
                    :span="getChildSpan(index)"
                    class="drag-item row-container-child"
                    :class="{ 'selected': item.id === selectedWigetId, 'operation-active': item.id === activeOperationWidgetId }"
                    tabindex="0"
                    role="group"
                    :aria-label="item.name"
                    @click.stop="changeSelectedWidgetId?.(item.id)"
                    @mouseenter="emit('operationPointerChange', item.id)"
                    @mouseleave="emit('operationPointerChange', widgetData.id)"
                    @focusin.stop="emit('operationFocusChange', item.id)"
                    @focusout.stop="emit('operationFocusChange', null)"
                >
                    <div class="row-child-header">
                        <div class="row-child-identity">
                            <el-tooltip content="拖动排序" placement="top">
                                <el-button class="row-child-operation-button row-child-drag-handle" text aria-label="拖动排序">
                                    <el-icon><Rank /></el-icon>
                                </el-button>
                            </el-tooltip>
                            <span class="row-child-name">{{ item.name }}</span>
                        </div>
                        <div class="row-child-actions">
                            <el-tooltip content="删除组件" placement="top">
                                <el-button class="row-child-operation-button" type="danger" text aria-label="删除组件" @click.stop="deleteWidget?.(item.id)">
                                    <el-icon><Delete /></el-icon>
                                </el-button>
                            </el-tooltip>
                        </div>
                    </div>
                    <div class="row-child-content">
                        <widget-renderer
                            :widget-data="item"
                            :form-data="formData"
                            :model-value="formData[item.id]"
                            :widget-form-data="widgetFormData"
                            @update:model-value="value => emit('fieldValueChange', item.id, value)"
                        />
                    </div>
                </el-col>
            </el-row>
            <div v-if="widgetData.widgets.length === 0" class="row-container-empty">拖入普通组件到行容器，最多支持 6 个</div>
        </div>
    </div>
</template>
<script setup lang="ts">
/**
 * @fileoverview 渲染设计态行容器的子字段、栅格布局与局部拖拽工具条。
 * @remarks 配置写入统一委托根管理器；子项只上报运行值和操作目标，不能创建第二套选中状态或嵌套容器。
 */
import { type PropType, type Ref, inject, onMounted, onUnmounted, ref, shallowRef } from "vue";
import { Delete, Rank } from "@element-plus/icons-vue";
import { type RowInstance } from "element-plus";
import Sortable from "sortablejs";
import widgetRenderer from "@/views/components/rendering/widget-renderer.vue";
import { type WidgetFormData, type WidgetRowContainerData } from "@/views/types";
import { normalizeRowContainerSpan } from "@/views/domain/widgets/layout/row-container-layout";
import { getWidgetList } from "@/views/domain/widgets/registry";
import { createWidgetLibraryTargetGroup, getRowContainerSortableGroupName, ROW_CONTAINER_DRAGGABLE_SELECTOR } from "@/views/utils/drag-drop-config";

/**
 * @description 行容器配置、共享字段运行值与画布唯一操作目标。
 * @remarks activeOperationWidgetId 由父画布统一派生，子项激活时父行工具条让位，避免两层操作区域重叠。
 */
const props = defineProps({
    widgetData: {
        type: Object as PropType<WidgetRowContainerData>,
        required: true
    },
    formData: {
        type: Object as PropType<Record<string, any>>,
        required: true
    },
    widgetFormData: {
        type: Object as PropType<WidgetFormData>,
        required: true
    },
    activeOperationWidgetId: {
        type: String as PropType<string | null>,
        default: null
    }
});

const emit = defineEmits<{
    /** 将子字段原生值传给拥有 formData 的画布。 */
    fieldValueChange: [id: string, value: any];
    /** 子字段悬停时激活子项，离开后回到父行容器。 */
    operationPointerChange: [id: string];
    /** 把键盘焦点交给画布唯一工具条目标，失焦传 null。 */
    operationFocusChange: [id: string | null];
}>();

// 以下状态与命令来自根页面，子容器不直接增删配置或自行维护选中值。
const selectedWigetId = inject<Ref<string | null>>("selectedWigetId");
const changeSelectedWidgetId = inject<(id: string | null) => void>("changeSelectedWidgetId");
const insertWidgetDefaultData = inject<(code: string, newIndex: number, parentWidgetId?: string) => void>("insertWidgetDefaultData");
const updateWidgetOrder = inject<(oldIndex: number, newIndex: number, parentWidgetId?: string) => void>("updateWidgetOrder");
const deleteWidget = inject<(id: string) => void>("deleteWidget");

// 行网格的真实 DOM 在挂载后用于局部排序。
const rowGridRef = ref<RowInstance>();
// 每个行容器独立拥有一个外部插件实例，卸载时必须销毁。
const sortableInstance = shallowRef<Sortable | null>(null);
// 使用注册标识拒绝行容器嵌套。
const widgetList = getWidgetList();

/**
 * @description 读取并规范当前子项的 24 栅格列宽。
 * @param index 子项在 widgets 和 spans 中共同使用的索引。
 * @returns 1 至 24 的有效列宽；缺省宽度为整行。
 */
const getChildSpan = function (index: number) {
    return normalizeRowContainerSpan(props.widgetData.settingData.spans[index] ?? 24);
};

/**
 * @description DOM 就绪后初始化行容器专属拖拽组与排序监听。
 * @remarks 按行 ID 隔离已有字段的排序组；阻止 dragover 冒泡，使同一次拖放不会同时命中父画布。
 */
onMounted(() => {
    if (!rowGridRef.value) {
        return;
    }
    sortableInstance.value = new Sortable(rowGridRef.value.$el, {
        animation: 150,
        group: createWidgetLibraryTargetGroup(getRowContainerSortableGroupName(props.widgetData.id)),
        sort: true,
        draggable: ROW_CONTAINER_DRAGGABLE_SELECTOR,
        dragoverBubble: false,
        swapThreshold: 0.65,
        invertSwap: true,
        ghostClass: "designer-drop-indicator",
        handle: ".row-child-drag-handle",
        /**
         * @description 在进入行容器前约束来源类型及子组件数量。
         * @param evt Sortable 移动事件，dragged 指向当前拖动节点。
         * @returns 是否允许当前拖动位置；拒绝嵌套行容器及超过 6 个的来源新增。
         * @remarks 数量检查只约束组件库新增，不阻止满容量行内重新排序。
         */
        onMove: (evt: Sortable.MoveEvent) => {
            // 来源元素携带类型，已有子项只需要本行排序权限。
            const widgetType = evt.dragged?.getAttribute("data-widget-type");
            const isLibraryWidget = Boolean(widgetType);
            if (widgetType === widgetList.WIDGET_ROW_CONTAINER.code || (isLibraryWidget && props.widgetData.widgets.length >= 6)) {
                return false;
            }
            return true;
        },
        /**
         * @description 将组件库克隆落点转换为当前行的子组件配置。
         * @param evt 包含来源克隆节点及子项索引的添加事件。
         * @returns 无返回值；无效来源或取消后的缺省索引直接忽略。
         * @remarks 先删除临时 DOM，再由管理器根据父 ID 插入，保持数组与 Vue 渲染一致。
         */
        onAdd: (evt: Sortable.SortableEvent) => {
            const widgetType = evt.item?.getAttribute("data-widget-type");
            evt.item?.remove();
            if (evt.newIndex === undefined || !widgetType || widgetType === widgetList.WIDGET_ROW_CONTAINER.code) {
                return;
            }
            insertWidgetDefaultData?.(widgetType, evt.newIndex, props.widgetData.id);
        },
        /**
         * @description 将当前行内部排序结果交给根管理器。
         * @param evt Sortable 结束事件，包含变更前后位置。
         * @returns 无返回值；只处理来源和目标相同且索引完整的事件。
         */
        onEnd: (evt: Sortable.SortableEvent) => {
            if (evt.from !== evt.to || evt.oldIndex === undefined || evt.newIndex === undefined) {
                return;
            }
            updateWidgetOrder?.(evt.oldIndex, evt.newIndex, props.widgetData.id);
        }
    });
});

/**
 * @description 行组件移除时释放局部拖拽实例及 DOM 监听。
 */
onUnmounted(() => {
    sortableInstance.value?.destroy();
});
</script>
<style lang="scss" scoped>
.row-container-renderer {
    min-height: 80px;
    padding: 8px 12px;

    .row-container-drop-area {
        min-height: 64px;
        border: 1px solid transparent;
        border-radius: 2px;
        background-color: transparent;
        transition:
            border-color var(--el-transition-duration-fast),
            background-color var(--el-transition-duration-fast),
            box-shadow var(--el-transition-duration-fast);

        &:has(.row-container-empty) {
            border-color: var(--el-border-color-light);
            border-style: dashed;
            background-color: var(--el-fill-color-extra-light);
        }
    }

    .row-container-grid {
        min-height: 64px;
        padding-top: 16px;
        row-gap: 16px;
    }

    .row-container-empty {
        min-height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--el-text-color-placeholder);
        font-size: 12px;
    }

    .row-container-child {
        position: relative;
        min-height: 64px;
        border: 1px solid transparent;
        border-radius: 2px;
        transition:
            border-color var(--el-transition-duration-fast),
            background-color var(--el-transition-duration-fast),
            box-shadow var(--el-transition-duration-fast);

        &.operation-active {
            z-index: 1;
            border-color: var(--el-border-color-lighter);
            background-color: var(--el-fill-color-extra-light);

            > .row-child-header {
                visibility: visible;
                opacity: 1;
            }
        }

        &.selected {
            border-color: var(--el-color-primary-light-8);
            background-color: var(--el-color-primary-light-9);
            box-shadow: inset 3px 0 0 var(--el-color-primary);
        }

        &:focus-visible {
            outline: 2px solid var(--el-color-primary);
            outline-offset: -2px;
        }
    }

    .row-child-content {
        min-width: 0;
        padding: 8px 12px;

        :deep(.el-form-item) {
            margin-bottom: 8px;
        }
    }

    .row-child-header {
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        position: absolute;
        top: 0;
        right: 8px;
        left: auto;
        z-index: 5;
        max-width: calc(100% - 16px);
        padding: 0 4px;
        transform: translateY(-50%);
        border: 1px solid var(--el-border-color-light);
        border-radius: 2px;
        background-color: var(--el-bg-color);
        box-shadow: var(--el-box-shadow-lighter);
        color: var(--el-text-color-regular);
        visibility: hidden;
        opacity: 0;
        pointer-events: none;
        transition: opacity var(--el-transition-duration-fast);
    }

    .row-child-identity,
    .row-child-actions {
        min-width: 0;
        display: flex;
        align-items: center;
    }

    .row-child-identity {
        flex: 1;
    }

    .row-child-actions {
        flex: none;
    }

    .row-child-operation-button {
        width: 28px;
        height: 28px;
        flex: 0 0 28px;
        margin: 0;
        padding: 0;
        pointer-events: auto;
    }

    .row-child-drag-handle {
        cursor: grab;

        &:active {
            cursor: grabbing;
        }
    }

    .row-child-name {
        min-width: 0;
        padding: 0 6px;
        overflow: hidden;
        font-size: 12px;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>
