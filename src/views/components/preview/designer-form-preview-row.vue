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
 * @remarks 子项保留在原树和字段运行值中，仅使用 v-show 控制显示，以支持脚本动态显隐；事件上下文始终使用父级同一份预览快照。
 */
import { type PropType } from "vue";
import widgetRenderer from "@/views/components/rendering/widget-renderer.vue";
import designerFormPreviewErrorBoundary from "@/views/components/preview/designer-form-preview-error-boundary.vue";
import { type WidgetFormData, type WidgetRowContainerData } from "@/views/types";
import { normalizeRowContainerSpan } from "@/views/domain/widgets/layout/row-container-layout";

/**
 * @description 行布局配置及预览表单共享上下文。
 * @remarks 这里只读取栅格与运行值，子字段变更通过事件上报，由拥有 formData 的预览表单更新。
 */
const props = defineProps({
    widgetData: { type: Object as PropType<WidgetRowContainerData>, required: true },
    formData: { type: Object as PropType<Record<string, any>>, required: true },
    widgetFormData: { type: Object as PropType<WidgetFormData>, required: true }
});

// 明确把运行值写入权交给父级，避免修改 props 引用中的字段值。
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
