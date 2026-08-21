<template>
    <div class="center-render-panel">
        <div class="tool-bar">
            <div class="tool-group">
                <el-button :icon="View" text>预览</el-button>
                <el-button :icon="Upload" text>导入JSON</el-button>
                <el-button :icon="Download" text>导出JSON</el-button>
            </div>
            <div class="tool-group tool-group--danger">
                <el-button :icon="Delete" type="danger" text @click="handleClearWidgets">清空</el-button>
            </div>
        </div>
        <div class="render-panel">
            <el-form :model="formData" v-bind="widgetFormData!.formAttributes">
                <div class="drop-surface">
                    <el-row ref="dropContainerRef" class="drop-container">
                        <el-col
                            v-for="(item, index) in widgetFormData!.widgets"
                            :key="item.id"
                            :span="24"
                            class="drag-item"
                            :class="{
                                'selected': item.id === selectedWigetId,
                                'operation-active': item.id === activeOperationWidgetId,
                                'row-container-item': item.code === widgetList.WIDGET_ROW_CONTAINER.code
                            }"
                            tabindex="0"
                            role="group"
                            :aria-label="item.name"
                            @click.stop="changeSelectedWidgetId?.(item.id)"
                            @mouseenter="setHoveredWidgetId(item.id)"
                            @mouseleave="clearHoveredWidgetId(item.id)"
                            @focusin="setFocusedWidgetId(item.id)"
                            @focusout="setFocusedWidgetId(null)"
                        >
                            <div class="widget-operation-bar">
                                <div class="widget-identity">
                                    <el-tooltip content="拖动排序" placement="top">
                                        <el-button class="widget-operation-button widget-drag-handle" text aria-label="拖动排序">
                                            <el-icon><Rank /></el-icon>
                                        </el-button>
                                    </el-tooltip>
                                    <el-tooltip :content="item.isShow ? '显示状态' : '隐藏状态'" placement="top">
                                        <span class="widget-status" role="status" :aria-label="item.isShow ? '显示状态' : '隐藏状态'">
                                            <el-icon v-if="item.isShow"><View /></el-icon>
                                            <el-icon v-else><Hide /></el-icon>
                                        </span>
                                    </el-tooltip>
                                    <span class="widget-operation-name">{{ item.name }}</span>
                                </div>
                                <div class="widget-actions">
                                    <el-tooltip content="复制组件" placement="top">
                                        <el-button class="widget-operation-button" text aria-label="复制组件" @click.stop="copyWidgetData?.(index + 1, index)">
                                            <el-icon><CopyDocument /></el-icon>
                                        </el-button>
                                    </el-tooltip>
                                    <el-tooltip v-if="index > 0" content="上移" placement="top">
                                        <el-button class="widget-operation-button" text aria-label="上移" @click.stop="updateWidgetOrder?.(index, index - 1)">
                                            <el-icon><Top /></el-icon>
                                        </el-button>
                                    </el-tooltip>
                                    <el-tooltip v-if="index < widgetFormData!.widgets.length - 1" content="下移" placement="top">
                                        <el-button class="widget-operation-button" text aria-label="下移" @click.stop="updateWidgetOrder?.(index, index + 1)">
                                            <el-icon><Bottom /></el-icon>
                                        </el-button>
                                    </el-tooltip>
                                    <el-tooltip content="删除组件" placement="top">
                                        <el-button class="widget-operation-button" type="danger" text aria-label="删除组件" @click.stop="deleteWidget?.(item.id)">
                                            <el-icon><Delete /></el-icon>
                                        </el-button>
                                    </el-tooltip>
                                </div>
                            </div>
                            <row-container-renderer
                                v-if="item.code === widgetList.WIDGET_ROW_CONTAINER.code"
                                :widget-data="item as WidgetRowContainerData"
                                :form-data="formData"
                                :widget-form-data="widgetFormData!"
                                :active-operation-widget-id="activeOperationWidgetId"
                                @field-value-change="handleFieldValueChange"
                                @operation-pointer-change="setHoveredWidgetId"
                                @operation-focus-change="setFocusedWidgetId"
                            />
                            <div v-else class="widget-preview-content">
                                <widget-renderer v-model="formData[item.id]" :widget-data="item as WidgetNormalData" :form-data="formData" :widget-form-data="widgetFormData!" />
                            </div>
                        </el-col>
                    </el-row>
                    <div v-if="widgetFormData!.widgets.length === 0" class="empty-tip">
                        <el-icon class="empty-tip__icon"><Plus /></el-icon>
                        <span class="empty-tip__title">暂无表单组件</span>
                        <span class="empty-tip__description">从左侧组件库拖入组件</span>
                    </div>
                </div>
            </el-form>
        </div>
    </div>
</template>
<script setup lang="ts">
import { type Ref, inject, onMounted, shallowRef, onUnmounted, ref } from "vue";
import { View, Upload, Download, Delete, Rank, Top, Bottom, Hide, CopyDocument, Plus } from "@element-plus/icons-vue";
import { type RowInstance } from "element-plus";
import Sortable from "sortablejs";
import rowContainerRenderer from "./row-container-renderer.vue";
import widgetRenderer from "./widget-renderer.vue";
import { type WidgetFormData, type WidgetNormalData, type WidgetRowContainerData } from "@/views/composables/types";
import { useFormRenderData } from "@/views/composables/widgets/form";
import { getWidgetList } from "@/views/composables/widget-registry";
import { useWidgetOperationTarget } from "@/views/composables/widget-operation-target";
import { createWidgetLibraryTargetGroup, DESIGNER_ROOT_DRAGGABLE_SELECTOR, DESIGNER_ROOT_SORTABLE_GROUP } from "@/views/composables/widget-drag-drop";

const emit = defineEmits<{
    clearWidgets: [];
}>();

// 获取注入的表单数据
const widgetFormData = inject<WidgetFormData>("widgetFormData");

// 获取注入的选中的组件id
const selectedWigetId = inject<Ref<string | null>>("selectedWigetId");

// 获取注入的改变选中的组件id的函数
const changeSelectedWidgetId = inject<(id: string | null) => void>("changeSelectedWidgetId");

// 获取注入的插入组件的函数
const insertWidgetDefaultData = inject<(code: string, newIndex: number, parentWidgetId?: string) => void>("insertWidgetDefaultData");

// 获取注入的更新组件的顺序的函数
const updateWidgetOrder = inject<(oldIndex: number, newIndex: number, parentWidgetId?: string) => void>("updateWidgetOrder");

// 获取注入的复制组件的函数
const copyWidgetData = inject<(newIndex: number, copyIndex: number) => void>("copyWidgetData");

// 获取注入的删除组件的函数
const deleteWidget = inject<(id: string) => void>("deleteWidget");

// 获取注入的表单数据的渲染数据
const formData = useFormRenderData(widgetFormData!);

// 获取注入的表单数据的渲染数据
const dropContainerRef = ref<RowInstance>();

const sortableInstance = shallowRef<Sortable | null>(null);

const widgetList = getWidgetList();

// 画布同一时刻只展示一个节点的工具条，嵌套子字段激活时会覆盖父行容器。
const { activeOperationWidgetId, setHoveredWidgetId, clearHoveredWidgetId, setFocusedWidgetId } = useWidgetOperationTarget(selectedWigetId);

const handleClearWidgets = function () {
    emit("clearWidgets");
};

const handleFieldValueChange = function (id: string, value: any) {
    formData[id] = value;
};

// 初始化排序插件
onMounted(() => {
    if (dropContainerRef.value) {
        sortableInstance.value = new Sortable(dropContainerRef.value.$el, {
            animation: 150,
            group: createWidgetLibraryTargetGroup(DESIGNER_ROOT_SORTABLE_GROUP),
            sort: true,
            draggable: DESIGNER_ROOT_DRAGGABLE_SELECTOR,
            dragoverBubble: false,
            ghostClass: "designer-drop-indicator",
            handle: ".widget-drag-handle",
            onAdd: (evt: Sortable.SortableEvent) => {
                const widgetType = evt.item?.getAttribute("data-widget-type");
                evt.item?.remove();
                if (evt.newIndex === undefined || !widgetType) {
                    return;
                }
                insertWidgetDefaultData?.(widgetType, evt.newIndex);
            },
            onEnd: (evt: Sortable.SortableEvent) => {
                if (evt.from !== evt.to || evt.oldIndex === undefined || evt.newIndex === undefined) {
                    return;
                }
                updateWidgetOrder?.(evt.oldIndex, evt.newIndex);
            }
        });
    }
});

onUnmounted(() => {
    sortableInstance.value?.destroy();
});
</script>
<style lang="scss" scoped>
.center-render-panel {
    height: 100%;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    flex: 1;

    .tool-bar {
        height: 40px;
        flex: 0 0 40px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding: 0 12px;
        background-color: var(--el-bg-color);

        .tool-group {
            display: flex;
            align-items: center;
            gap: 4px;

            .el-button {
                margin-left: 0;
            }
        }

        .tool-group--danger {
            margin-left: 8px;
            padding-left: 0;
            border-left: 0;
        }
    }

    .render-panel {
        flex: 1;
        min-height: 0;
        overflow: auto;
        padding: 16px;

        :deep(.el-form) {
            height: 100%;

            .drop-surface {
                height: 100%;
                min-height: 100%;
                position: relative;
                border-radius: 2px;
                transition:
                    background-color var(--el-transition-duration-fast),
                    box-shadow var(--el-transition-duration-fast);
            }

            .drop-container {
                min-height: 100%;
                align-content: flex-start;
                padding-top: 16px;
            }
        }

        .empty-tip {
            min-height: 240px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            position: absolute;
            inset: 0;
            border: 1px dashed var(--el-border-color-light);
            border-radius: 2px;
            background-color: var(--el-fill-color-extra-light);
            color: var(--el-text-color-secondary);
            pointer-events: none;

            .empty-tip__icon {
                width: 36px;
                height: 36px;
                border: 1px solid var(--el-border-color);
                border-radius: 50%;
                background-color: var(--el-bg-color);
                color: var(--el-color-primary);
                font-size: 18px;
            }

            .empty-tip__title {
                color: var(--el-text-color-regular);
                font-size: 14px;
                font-weight: 500;
            }

            .empty-tip__description {
                font-size: 12px;
            }
        }
    }
}
</style>
<style lang="scss" scoped>
.center-render-panel .render-panel .drop-container {
    .drag-item {
        position: relative;
        width: 100%;
        border: 1px solid transparent;
        border-radius: 2px;
        transition:
            border-color var(--el-transition-duration-fast),
            background-color var(--el-transition-duration-fast),
            box-shadow var(--el-transition-duration-fast);

        + .drag-item {
            margin-top: 16px;
        }

        .widget-preview-content {
            min-width: 0;
            padding: 8px 12px;

            :deep(.el-form-item) {
                margin-bottom: 8px;
            }
        }

        > .widget-operation-bar {
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            position: absolute;
            top: 0;
            right: 12px;
            left: auto;
            z-index: 5;
            max-width: calc(100% - 24px);
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

            .widget-identity,
            .widget-actions {
                min-width: 0;
                display: flex;
                align-items: center;
            }

            .widget-identity {
                flex: 1;
            }

            .widget-actions {
                flex: none;
                gap: 2px;
            }

            .widget-operation-button,
            .widget-status {
                width: 28px;
                height: 28px;
                flex: 0 0 28px;
                margin: 0;
                padding: 0;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                pointer-events: auto;
            }

            .widget-status {
                color: var(--el-text-color-secondary);
            }

            .widget-drag-handle {
                cursor: grab;

                &:active {
                    cursor: grabbing;
                }
            }

            .widget-operation-name {
                min-width: 0;
                padding: 0 6px;
                overflow: hidden;
                color: var(--el-text-color-regular);
                font-size: 12px;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        &.operation-active {
            border-color: var(--el-border-color-lighter);
            background-color: var(--el-fill-color-extra-light);

            > .widget-operation-bar {
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

    .drag-item.operation-active,
    .drag-item:has(.row-container-child.operation-active) {
        z-index: 4;
    }
}
</style>
<style lang="scss">
.center-render-panel {
    .drop-surface:has(> .drop-container > .designer-drop-indicator) {
        background-color: var(--el-color-primary-light-9);
        box-shadow: inset 0 0 0 1px var(--el-color-primary-light-7);
    }

    .row-container-drop-area:has(> .row-container-grid > .designer-drop-indicator) {
        border-color: var(--el-color-primary-light-5);
        border-style: solid;
        background-color: var(--el-color-primary-light-9);
        box-shadow: inset 0 0 0 1px var(--el-color-primary-light-8);
    }

    .drop-container > .designer-drop-indicator,
    .row-container-grid > .designer-drop-indicator {
        position: relative;
        overflow: visible;
        border-color: transparent !important;
        background-color: var(--el-color-primary-light-9) !important;
        box-shadow: none !important;

        > * {
            opacity: 0.16;
        }

        &::before {
            content: "";
            position: absolute;
            top: -2px;
            right: 4px;
            left: 4px;
            z-index: 6;
            height: 3px;
            border-radius: 2px;
            background-color: var(--el-color-primary);
        }

        &::after {
            content: "";
            position: absolute;
            top: -5px;
            right: 0;
            left: 0;
            z-index: 7;
            height: 9px;
            background:
                radial-gradient(circle at 4px 50%, var(--el-bg-color) 0 2px, var(--el-color-primary) 2px 4px, transparent 4px),
                radial-gradient(circle at calc(100% - 4px) 50%, var(--el-bg-color) 0 2px, var(--el-color-primary) 2px 4px, transparent 4px);
            pointer-events: none;
        }
    }

    .drop-container > .widget-item.designer-drop-indicator,
    .row-container-grid > .widget-item.designer-drop-indicator {
        width: 100%;
        max-width: 100%;
        flex: 0 0 100%;
    }
}
</style>
