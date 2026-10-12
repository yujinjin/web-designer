<template>
    <div class="left-widget-panel">
        <el-tabs v-model="activeTab">
            <el-tab-pane label="组件库" name="widgets">
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
            <el-tab-pane label="模板库" name="templates">
                <div class="tab-content template-tab-content">
                    <el-collapse :model-value="templateGroups.map(group => group.code)">
                        <el-collapse-item v-for="group in templateGroups" :key="group.code" :title="group.name" :name="group.code">
                            <div :ref="el => setTemplateGroupRef(group.code, el as HTMLDivElement)" class="template-group">
                                <article v-for="template in group.children" :key="template.id" class="template-item" :data-template-id="template.id" :aria-label="template.name">
                                    <div class="template-image-frame" :style="{ aspectRatio: `720 / ${template.previewHeight}` }">
                                        <img
                                            v-if="!failedTemplateImages[template.id]"
                                            class="template-image"
                                            :src="template.previewImage"
                                            :alt="template.previewAlt"
                                            :width="720"
                                            :height="template.previewHeight"
                                            loading="lazy"
                                            draggable="false"
                                            @error="failedTemplateImages[template.id] = true"
                                        />
                                        <div v-else class="template-image-fallback">{{ template.name }}</div>
                                    </div>
                                    <div class="template-card-body">
                                        <strong class="template-name">{{ template.name }}</strong>
                                        <span class="template-description">{{ template.description }}</span>
                                    </div>
                                </article>
                            </div>
                        </el-collapse-item>
                    </el-collapse>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref, shallowRef, onUnmounted } from "vue";
import Sortable from "sortablejs";
import { getWidgetGroup } from "@/views/composables/widget-registry";
import {
    createTemplateLibrarySortableGroup,
    createWidgetLibrarySortableGroup,
    TEMPLATE_LIBRARY_DRAGGABLE_SELECTOR,
    useSortableDragState,
    WIDGET_LIBRARY_DRAGGABLE_SELECTOR
} from "@/views/composables/widget-drag-drop";
import { getFormTemplateGroups } from "@/views/composables/form-template-registry";

// 当前左栏页签，使用可写状态保证组件库和模板库可以反复切换。
const activeTab = ref("widgets");

const widgetGroupRefs = shallowRef<(HTMLDivElement | null)[]>([]);

/** 按模板分类 code 保存拖拽容器元素。 */
const templateGroupRefs = shallowRef<Record<string, HTMLDivElement | null>>({});

const sortableInstances = shallowRef<Sortable[]>([]);

const widgetGroup = getWidgetGroup();

const templateGroups = getFormTemplateGroups();

// 图片加载失败状态只控制当前卡片占位，不修改模板注册数据。
const failedTemplateImages = reactive<Record<string, boolean>>({});

// 原生拖拽可能不触发源按钮 mouseleave，拖拽期间禁用 Tooltip 可主动关闭已显示弹层。
const { isDragging, startDragging, stopDragging } = useSortableDragState();

/**
 * @description 保存模板分类对应的 DOM 引用，供挂载后初始化 Sortable。
 * @param code 模板分类稳定 code。
 * @param element 当前分类的卡片容器。
 * @returns 无返回值。
 */
const setTemplateGroupRef = function (code: string, element: HTMLDivElement | null): void {
    templateGroupRefs.value[code] = element;
};

/**
 * @description 创建共享拖拽生命周期回调的组件库或模板库 Sortable 实例。
 * @param element 拖拽源容器。
 * @param group Sortable 来源组配置。
 * @param draggable 当前来源允许克隆的选择器。
 * @returns 已初始化的 Sortable 实例。
 */
const createLibrarySortable = function (element: HTMLDivElement, group: ReturnType<typeof createWidgetLibrarySortableGroup>, draggable: string): Sortable {
    return new Sortable(element, {
        animation: 150,
        group,
        sort: false,
        draggable,
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
    });
};

onMounted(() => {
    widgetGroupRefs.value.forEach(el => {
        if (el) {
            sortableInstances.value.push(createLibrarySortable(el, createWidgetLibrarySortableGroup(), WIDGET_LIBRARY_DRAGGABLE_SELECTOR));
        }
    });
    Object.values(templateGroupRefs.value).forEach(el => {
        if (el) sortableInstances.value.push(createLibrarySortable(el, createTemplateLibrarySortableGroup(), TEMPLATE_LIBRARY_DRAGGABLE_SELECTOR));
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

            .template-group {
                display: grid;
                grid-template-columns: minmax(0, 1fr);
                gap: 12px;
                padding-bottom: 6px;
            }

            .template-item {
                min-width: 0;
                overflow: hidden;
                border: 1px solid var(--el-border-color-light);
                border-radius: 2px;
                background-color: var(--el-bg-color);
                cursor: grab;

                &:active {
                    cursor: grabbing;
                }
            }

            .template-image-frame {
                overflow: hidden;
                background-color: var(--el-fill-color-extra-light);
            }

            .template-image,
            .template-image-fallback {
                width: 100%;
                height: 100%;
            }

            .template-image {
                display: block;
                object-fit: contain;
                pointer-events: none;
            }

            .template-image-fallback {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 12px;
                color: var(--el-text-color-secondary);
                font-size: 13px;
                text-align: center;
            }

            .template-card-body {
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 3px;
                padding: 8px 10px 10px;
            }

            .template-name,
            .template-description {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .template-name {
                color: var(--el-text-color-primary);
                font-size: 14px;
                font-weight: 500;
            }

            .template-description {
                color: var(--el-text-color-secondary);
                font-size: 12px;
            }
        }
    }
}
</style>
