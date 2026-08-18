<template>
    <div class="center-render-panel">
        <div class="tool-bar">
            <el-button :icon="View" text>预览</el-button>
            <el-button :icon="Upload" text>导入JSON</el-button>
            <el-button :icon="Download" text>导出JSON</el-button>
            <el-button :icon="Delete" text @click="handleClearWidgets">清空</el-button>
        </div>
        <div class="render-panel">
            <el-form :model="formData" v-bind="widgetFormData!.formAttributes">
                <el-row ref="dropContainerRef" class="drop-container">
                    <template v-if="widgetFormData!.widgets.length > 0">
                        <el-col
                            v-for="(item, index) in widgetFormData!.widgets"
                            :key="item.id"
                            :span="24"
                            class="drag-item"
                            :class="{ selected: item.id === selectedWigetId }"
                            @click.stop.prevent="changeSelectedWidgetId?.(item.id)"
                        >
                            <div class="drag-box">
                                <el-icon><Rank /></el-icon>
                                <el-icon v-if="item.isShow" title="显示状态"><View /></el-icon>
                                <el-icon v-else title="隐藏状态"><Hide /></el-icon>
                                <span>{{ item.name }}</span>
                            </div>
                            <div class="action-box">
                                <el-icon title="复制组件" @click.stop="copyWidgetData?.(index + 1, index)"><CopyDocument /></el-icon>
                                <el-icon v-if="index > 0" title="上移" @click.stop="updateWidgetOrder?.(index, index - 1)"><Top /></el-icon>
                                <el-icon v-if="index < widgetFormData!.widgets.length - 1" title="下移" @click.stop="updateWidgetOrder?.(index, index + 1)"><Bottom /></el-icon>
                                <el-icon title="删除组件" @click.stop="deleteWidget?.(item.id)"><Delete /></el-icon>
                            </div>
                            <row-container-renderer
                                v-if="item.code === widgetList.WIDGET_ROW_CONTAINER.code"
                                :widget-data="item as WidgetRowContainerData"
                                :form-data="formData"
                                :widget-form-data="widgetFormData!"
                                @field-value-change="handleFieldValueChange"
                            />
                            <widget-renderer v-else v-model="formData[item.id]" :widget-data="item as WidgetNormalData" :form-data="formData" :widget-form-data="widgetFormData!" />
                        </el-col>
                    </template>
                    <div v-else class="empty-tip">请从左侧列表中选择一个组件, 然后用鼠标拖动组件放置于此处.</div>
                </el-row>
            </el-form>
        </div>
    </div>
</template>
<script setup lang="ts">
import { type Ref, inject, onMounted, shallowRef, onUnmounted, ref } from "vue";
import { View, Upload, Download, Delete, Rank, Top, Bottom, Hide, CopyDocument } from "@element-plus/icons-vue";
import { type RowInstance } from "element-plus";
import Sortable from "sortablejs";
import rowContainerRenderer from "./row-container-renderer.vue";
import widgetRenderer from "./widget-renderer.vue";
import { type WidgetFormData, type WidgetNormalData, type WidgetRowContainerData } from "@/views/composables/types";
import { useFormRenderData } from "@/views/composables/widgets/form";
import { getWidgetList } from "@/views/composables/widget-registry";

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
            animation: 300,
            group: { name: "dragGroup", put: true, pull: false },
            sort: true,
            ghostClass: "sortable-ghost",
            handle: ".drag-box",
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
    display: flex;
    flex-direction: column;
    flex: 1;

    .tool-bar {
        height: 40px;
        border-bottom: 2px solid #e5e5e5;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 12px;
    }
    .render-panel {
        flex: 1;
        overflow-x: hidden;
        padding: 12px;

        :deep(.el-form) {
            height: 100%;

            .drop-container {
                height: 100%;
                align-content: flex-start;
            }
        }

        .empty-tip {
            height: 100%;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: #909399;
        }
    }
}
</style>
<style lang="scss">
.center-render-panel .render-panel .drop-container {
    .drag-item {
        position: relative;

        .drag-box {
            display: none;
            align-items: center;
            font-size: 12px;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 99;
            background-color: rgba(77, 205, 141, 0.7);
            padding: 0px 8px;
            line-height: 22px;
            color: #fff;
            cursor: move;

            span {
                display: inline-block;
                padding: 0px 8px;
            }
        }

        .action-box {
            display: none;
            align-items: center;
            position: absolute;
            bottom: 0;
            right: 0;
            z-index: 99;
            background-color: var(--el-color-primary-light-3);
            padding: 4px 8px;
            line-height: 22px;
            gap: 4px;
            color: #fff;
            cursor: pointer;
        }

        &.selected,
        &:hover {
            width: 100%;
            display: inline-block;
            background-color: var(--el-color-primary-light-9);

            > .drag-box {
                display: flex;
            }
            > .action-box {
                display: flex;
            }
        }

        &.selected {
            border-left: 3px solid var(--el-color-primary);
        }
    }

    .sortable-ghost {
        content: "";
        font-size: 0;
        height: 3px;
        box-sizing: border-box;
        background: var(--el-color-primary);
        border: 2px solid var(--el-color-primary);
        outline-width: 0;
        padding: 0;
        overflow: hidden;
    }
}
</style>
