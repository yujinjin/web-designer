<template>
    <el-dialog v-model="visible" title="表单预览" width="min(1120px, 92vw)" top="5vh" append-to-body destroy-on-close class="designer-form-preview-dialog" @closed="emit('closed')">
        <div class="designer-form-preview-dialog__content">
            <designer-form-preview-renderer v-if="widgetFormData" :widget-form-data="widgetFormData" />
        </div>
        <template #footer>
            <el-button @click="visible = false">关闭</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
/**
 * @fileoverview 使用大尺寸 Element Plus Dialog 承载可销毁的真实表单预览运行态。
 */
import { type PropType } from "vue";
import designerFormPreviewRenderer from "./designer-form-preview-renderer.vue";
import { type WidgetFormData } from "@/views/composables/types";

defineProps({ widgetFormData: { type: Object as PropType<WidgetFormData | null>, default: null } });
const emit = defineEmits<{ closed: [] }>();
const visible = defineModel<boolean>({ required: true });
</script>

<style lang="scss">
.designer-form-preview-dialog {
    max-height: 90vh;
    display: flex;
    flex-direction: column;

    .el-dialog__body {
        min-height: 0;
        padding: 16px 20px;
        overflow-y: auto;
    }

    .designer-form-preview-dialog__content {
        width: 100%;
        max-width: 1040px;
        min-height: 240px;
        margin: 0 auto;
    }
}
</style>
