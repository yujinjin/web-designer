<template>
    <div class="left-widget-panel">
        <el-tabs model-value="first">
            <el-tab-pane label="组件库" name="first">
                <div class="tab-content">
                    <el-collapse :model-value="widgetGroup.map((item, index) => index)">
                        <el-collapse-item v-for="(groupItem, index) in widgetGroup" :key="index" :title="groupItem.groupName" :name="index">
                            <div :ref="el => (widgetGroupRefs[index] = el as HTMLDivElement)" class="widget-group">
                                <div v-for="widgetItem in groupItem.children" :key="widgetItem.code" class="widget-item" :data-widget-type="widgetItem.code">
                                    <el-button>
                                        <i :class="widgetItem.icon" />
                                        {{ widgetItem.name }}
                                    </el-button>
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

const widgetGroupRefs = shallowRef<(HTMLDivElement | null)[]>([]);

const sortableInstances = shallowRef<Sortable[]>([]);

const widgetGroup = getWidgetGroup();

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

                    i {
                        font-size: 16px;
                        margin-right: 4px;
                    }
                }
            }
        }
    }
}
</style>
