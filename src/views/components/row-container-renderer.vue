<template>
    <div class="row-container-renderer" @click.stop.prevent="changeSelectedWidgetId?.(widgetData.id)">
        <div class="row-container-drop-area">
            <el-row ref="rowGridRef" class="row-container-grid" :gutter="widgetData.settingData.gutter" :justify="widgetData.settingData.justify" :align="widgetData.settingData.align">
                <el-col
                    v-for="(item, index) in widgetData.widgets"
                    :key="item.id"
                    :span="getChildSpan(index)"
                    class="drag-item row-container-child"
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
                        <el-icon title="删除组件" @click.stop="deleteWidget?.(item.id)"><Delete /></el-icon>
                    </div>
                    <widget-renderer
                        :widget-data="item"
                        :form-data="formData"
                        :model-value="formData[item.id]"
                        :widget-form-data="widgetFormData"
                        @update:model-value="value => emit('fieldValueChange', item.id, value)"
                    />
                </el-col>
            </el-row>
            <div v-if="widgetData.widgets.length === 0" class="row-container-empty">拖入普通组件到行容器，最多支持 6 个</div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { type PropType, type Ref, inject, onMounted, onUnmounted, ref, shallowRef } from "vue";
import { Delete, Hide, Rank, View } from "@element-plus/icons-vue";
import { type RowInstance } from "element-plus";
import Sortable from "sortablejs";
import widgetRenderer from "./widget-renderer.vue";
import { type WidgetFormData, type WidgetRowContainerData } from "@/views/composables/types";
import { normalizeRowContainerSpan } from "@/views/composables/row-container-layout";
import { getWidgetList } from "@/views/composables/widget-registry";

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
    }
});

const emit = defineEmits<{
    fieldValueChange: [id: string, value: any];
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
        animation: 300,
        group: { name: "dragGroup", put: true, pull: false },
        sort: true,
        ghostClass: "sortable-ghost",
        handle: ".drag-box",
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
    padding: 24px 8px 8px;
    min-height: 88px;

    .row-container-drop-area {
        min-height: 64px;
        border: 1px dashed var(--el-border-color);
        background-color: rgba(64, 158, 255, 0.04);
    }

    .row-container-grid {
        min-height: 64px;
    }

    .row-container-empty {
        min-height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #909399;
        font-size: 13px;
    }

    .row-container-child {
        min-height: 64px;
    }
}
</style>
