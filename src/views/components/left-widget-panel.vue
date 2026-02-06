<template>
    <div class="left-widget-panel">
        <el-tabs model-value="first">
            <el-tab-pane label="组件库" name="first">
                <div class="tab-content">
                    <el-collapse :model-value="['1', '2', '3']">
                        <el-collapse-item title="容器" name="1">
                            <div :ref="el => (widgetGroupRefs[0] = el as HTMLDivElement)" class="widget-group">
                                <div class="widget-item" data-widget-type="grid">
                                    <el-button :icon="Grid">栅格</el-button>
                                </div>
                                <div class="widget-item" data-widget-type="table">
                                    <el-button :icon="Notebook">表格</el-button>
                                </div>
                            </div>
                        </el-collapse-item>
                        <el-collapse-item title="基础表单" name="2">
                            <div :ref="el => (widgetGroupRefs[1] = el as HTMLDivElement)" class="widget-group">
                                <div class="widget-item" data-widget-type="text">
                                    <el-button :icon="Edit">输入框</el-button>
                                </div>
                                <div class="widget-item" data-type="radio">
                                    <el-button :icon="CircleCheckFilled">单选框</el-button>
                                </div>
                            </div>
                        </el-collapse-item>
                        <el-collapse-item title="高级表单" name="3">
                            <div :ref="el => (widgetGroupRefs[2] = el as HTMLDivElement)" class="widget-group">
                                <div class="widget-item" data-widget-type="file">
                                    <el-button :icon="UploadFilled">文件上传</el-button>
                                </div>
                                <div class="widget-item" data-widget-type="textarea">
                                    <el-button :icon="DocumentAdd">富文本框</el-button>
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
import { Grid, Notebook, Edit, CircleCheckFilled, UploadFilled, DocumentAdd } from "@element-plus/icons-vue";
import { onMounted, shallowRef, onUnmounted } from "vue";
import Sortable from "sortablejs";

const widgetGroupRefs = shallowRef<(HTMLDivElement | null)[]>([]);

const sortableInstances = shallowRef<Sortable[]>([]);

onMounted(() => {
    widgetGroupRefs.value.forEach(el => {
        if (el) {
            sortableInstances.value.push(
                new Sortable(el, {
                    animation: 150,
                    group: { name: "dragGroup", pull: "clone", put: false },
                    sort: false,
                    ghostClass: "sortable-ghost",
                    onClone: function (evt: Sortable.SortableEvent) {
                        // const originalEl = evt.original;
                        // const cloneEl = evt.clone;
                        // cloneEl.innerHTML = originalEl.innerHTML;
                        console.info("onClone: left widget");
                    },
                    onMove: function (evt: Sortable.MoveEvent, originalEvent: Event) {
                        // const originalEl = evt.original;
                        // const cloneEl = evt.clone;
                        // cloneEl.innerHTML = originalEl.innerHTML;
                        console.info("onMove: left widget");
                        // return false;
                    },
                    onEnd: function (evt: Sortable.SortableEvent) {
                        // const originalEl = evt.original;
                        // const cloneEl = evt.clone;
                        // cloneEl.innerHTML = originalEl.innerHTML;
                        console.info("onEnd: left widget");
                    }
                })
            );
        }
    });
});

onUnmounted(() => {
    sortableInstances.value.forEach(instance => instance.destroy());
});
</script>
<style lang="scss" scoped>
.left-widget-panel {
    height: 100%;
    width: 280px;
    border-right: 1px solid #e9ecef;
    overflow-x: hidden;

    :deep(.el-tabs) {
        .el-tabs__header {
            margin: 0;
            background-color: #ffffff;
            border-bottom: 1px solid #e9ecef;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            position: sticky;
            top: 0;
            z-index: 10;

            .el-tabs__nav {
                display: flex;
                width: 100%;

                .el-tabs__item {
                    flex: 1;
                }
            }
        }

        .tab-content {
            padding: 0px 12px;

            .el-collapse-item__title {
                font-weight: 600;
                font-style: italic;
            }

            .widget-group {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;

                .widget-item {
                    flex: 0 0 calc(50% - 6px);

                    .el-button {
                        width: 100%;
                    }
                }
            }
        }
    }
}
</style>
