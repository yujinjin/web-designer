<template>
    <div class="left-widget-panel">
        <el-tabs model-value="first">
            <el-tab-pane label="组件库" name="first">
                <div class="tab-content">
                    <el-collapse :model-value="widgetGroup.map((item, index) => index)">
                        <el-collapse-item v-for="(groupItem, index) in widgetGroup" :key="index" :title="groupItem.groupName" :name="index">
                            <div :ref="el => (widgetGroupRefs[index] = el as HTMLDivElement)" class="widget-group">
                                <div v-for="widgetItem in groupItem.children" :key="widgetItem.code" class="widget-item" :data-widget-type="widgetItem.code">
                                    <el-tooltip :content="widgetItem.name" placement="top" :show-after="500" :disabled="isDragging" :enterable="false" :persistent="false">
                                        <el-button>
                                            <i :class="widgetItem.icon" />
                                            <span class="widget-name">{{ widgetItem.name }}</span>
                                        </el-button>
                                    </el-tooltip>
                                </div>
                            </div>
                        </el-collapse-item>
                    </el-collapse>
                </div>
            </el-tab-pane>
            <el-tab-pane label="模板库" name="second">
                <div class="tab-content">模板</div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>
<script setup lang="ts">
import { onMounted, shallowRef, onUnmounted } from "vue";
import Sortable from "sortablejs";
import { getWidgetGroup } from "@/views/composables/widget-registry";
import { createWidgetLibrarySortableGroup, useSortableDragState, WIDGET_LIBRARY_DRAGGABLE_SELECTOR } from "@/views/composables/widget-drag-drop";

const widgetGroupRefs = shallowRef<(HTMLDivElement | null)[]>([]);

const sortableInstances = shallowRef<Sortable[]>([]);

const widgetGroup = getWidgetGroup();

// 原生拖拽可能不触发源按钮 mouseleave，拖拽期间禁用 Tooltip 可主动关闭已显示弹层。
const { isDragging, startDragging, stopDragging } = useSortableDragState();

onMounted(() => {
    widgetGroupRefs.value.forEach(el => {
        if (el) {
            sortableInstances.value.push(
                new Sortable(el, {
                    animation: 150,
                    group: createWidgetLibrarySortableGroup(),
                    sort: false,
                    draggable: WIDGET_LIBRARY_DRAGGABLE_SELECTOR,
                    ghostClass: "sortable-ghost",
                    onStart: function () {
                        startDragging();
                    },
                    onEnd: function () {
                        stopDragging();
                    },
                    onUnchoose: function () {
                        stopDragging();
                    }
                })
            );
        }
    });
});

onUnmounted(() => {
    stopDragging();
    sortableInstances.value.forEach(instance => instance.destroy());
});
</script>
<style lang="scss" scoped>
.left-widget-panel {
    height: 100%;
    width: 100%;
    min-width: 0;
    overflow: hidden;

    :deep(.el-tabs) {
        height: 100%;
        display: flex;
        flex-direction: column;

        .el-tabs__header {
            flex: none;
            margin: 0;
            background-color: #ffffff;
            border-bottom: 1px solid #e9ecef;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            z-index: 10;

            .el-tabs__nav {
                display: flex;
                width: 100%;

                .el-tabs__item {
                    flex: 1;
                }
            }
        }

        .el-tabs__content {
            flex: 1;
            min-height: 0;
            overflow: hidden;
        }

        .el-tab-pane {
            height: 100%;
        }

        .tab-content {
            height: 100%;
            padding: 0 12px 12px;
            overflow-x: hidden;
            overflow-y: auto;

            .el-collapse-item__title {
                font-weight: 600;
                font-style: italic;
                height: 44px;
            }

            .widget-group {
                display: flex;
                flex-wrap: wrap;
                gap: 8px 10px;
                padding-bottom: 4px;

                .widget-item {
                    flex: 0 0 calc(50% - 5px);
                    min-width: 0;

                    .el-button {
                        width: 100%;
                        height: 36px;
                        margin: 0;
                        padding: 0 10px;
                        display: flex;
                        justify-content: flex-start;
                        cursor: grab;

                        &:active {
                            cursor: grabbing;
                        }

                        > span {
                            width: 100%;
                            min-width: 0;
                            display: flex;
                            align-items: center;
                            text-align: left;
                        }
                    }

                    i {
                        width: 18px;
                        flex: 0 0 18px;
                        font-size: 16px;
                        margin-right: 6px;
                        text-align: center;
                    }

                    .widget-name {
                        min-width: 0;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                }
            }
        }
    }
}
</style>
