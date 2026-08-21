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
import { type PropType, type Ref, inject, onMounted, onUnmounted, ref, shallowRef } from "vue";
import { Delete, Rank } from "@element-plus/icons-vue";
import { type RowInstance } from "element-plus";
import Sortable from "sortablejs";
import widgetRenderer from "./widget-renderer.vue";
import { type WidgetFormData, type WidgetRowContainerData } from "@/views/composables/types";
import { normalizeRowContainerSpan } from "@/views/composables/row-container-layout";
import { getWidgetList } from "@/views/composables/widget-registry";
import { createWidgetLibraryTargetGroup, getRowContainerSortableGroupName, ROW_CONTAINER_DRAGGABLE_SELECTOR } from "@/views/composables/widget-drag-drop";

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
    fieldValueChange: [id: string, value: any];
    operationPointerChange: [id: string];
    operationFocusChange: [id: string | null];
}>();

const selectedWigetId = inject<Ref<string | null>>("selectedWigetId");
const changeSelectedWidgetId = inject<(id: string | null) => void>("changeSelectedWidgetId");
const insertWidgetDefaultData = inject<(code: string, newIndex: number, parentWidgetId?: string) => void>("insertWidgetDefaultData");
const updateWidgetOrder = inject<(oldIndex: number, newIndex: number, parentWidgetId?: string) => void>("updateWidgetOrder");
const deleteWidget = inject<(id: string) => void>("deleteWidget");

const rowGridRef = ref<RowInstance>();
const sortableInstance = shallowRef<Sortable | null>(null);
const widgetList = getWidgetList();

const getChildSpan = function (index: number) {
    return normalizeRowContainerSpan(props.widgetData.settingData.spans[index] ?? 24);
};

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
        onMove: (evt: Sortable.MoveEvent) => {
            const widgetType = evt.dragged?.getAttribute("data-widget-type");
            const isLibraryWidget = Boolean(widgetType);
            if (widgetType === widgetList.WIDGET_ROW_CONTAINER.code || (isLibraryWidget && props.widgetData.widgets.length >= 6)) {
                return false;
            }
            return true;
        },
        onAdd: (evt: Sortable.SortableEvent) => {
            const widgetType = evt.item?.getAttribute("data-widget-type");
            evt.item?.remove();
            if (evt.newIndex === undefined || !widgetType || widgetType === widgetList.WIDGET_ROW_CONTAINER.code) {
                return;
            }
            insertWidgetDefaultData?.(widgetType, evt.newIndex, props.widgetData.id);
        },
        onEnd: (evt: Sortable.SortableEvent) => {
            if (evt.from !== evt.to || evt.oldIndex === undefined || evt.newIndex === undefined) {
                return;
            }
            updateWidgetOrder?.(evt.oldIndex, evt.newIndex, props.widgetData.id);
        }
    });
});

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
