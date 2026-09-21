<template>
    <el-row :gutter="widgetData.settingData.gutter" :justify="widgetData.settingData.justify" :align="widgetData.settingData.align" class="preview-row">
        <el-col v-for="(item, index) in widgetData.widgets" v-show="item.isShow" :key="item.id" :span="getChildSpan(index)" class="preview-row__column">
            <designer-form-preview-error-boundary :widget-id="item.id" :widget-code="item.code">
                <widget-renderer
                    :model-value="formData[item.id]"
                    :widget-data="item"
                    :form-data="formData"
                    :widget-form-data="widgetFormData"
                    @update:model-value="value => emit('fieldValueChange', item.id, value)"
                />
            </designer-form-preview-error-boundary>
        </el-col>
    </el-row>
</template>

<script setup lang="ts">
/**
 * @fileoverview 还原行容器 24 栅格布局的纯预览渲染器，不包含拖放、选择或组件命令。
 */
import { type PropType } from "vue";
import widgetRenderer from "./widget-renderer.vue";
import designerFormPreviewErrorBoundary from "./designer-form-preview-error-boundary.vue";
import { type WidgetFormData, type WidgetRowContainerData } from "@/views/composables/types";
import { normalizeRowContainerSpan } from "@/views/composables/row-container-layout";

const props = defineProps({
    widgetData: { type: Object as PropType<WidgetRowContainerData>, required: true },
    formData: { type: Object as PropType<Record<string, any>>, required: true },
    widgetFormData: { type: Object as PropType<WidgetFormData>, required: true }
});

const emit = defineEmits<{
    /** 把行容器子字段的新值交给预览表单运行态。 */
    fieldValueChange: [id: string, value: any];
}>();

/**
 * @description 返回当前子组件在 24 栅格中的规范列宽。
 * @param index 子组件在行容器中的索引。
 * @returns 1 至 24 的有效 span。
 */
const getChildSpan = function (index: number): number {
    return normalizeRowContainerSpan(props.widgetData.settingData.spans[index] ?? 24);
};
</script>

<style scoped lang="scss">
.preview-row {
    row-gap: 16px;
}

.preview-row__column {
    min-width: 0;
}
</style>
