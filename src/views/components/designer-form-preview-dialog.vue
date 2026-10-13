<template>
    <el-dialog v-model="visible" title="表单预览" width="min(1120px, 92vw)" top="5vh" append-to-body destroy-on-close class="designer-form-preview-dialog" @closed="emit('closed')">
        <div class="designer-form-preview-dialog__content">
            <designer-form-preview-renderer v-if="widgetFormData" :widget-form-data="widgetFormData" />
        </div>
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
.el-dialog.designer-form-preview-dialog {
    --el-dialog-padding-primary: 0px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;

    .el-dialog__header {
        flex: none;
        height: 54px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        position: relative;
        z-index: 1;
        margin: 0;
        padding: 0 48px 0 20px;
        border-bottom: 1px solid var(--el-border-color-lighter);

        &.show-close {
            padding-right: 48px;
        }

        .el-dialog__title {
            font-size: 16px;
            line-height: 24px;
        }

        .el-dialog__headerbtn {
            top: 0;
            right: 0;
            width: 44px;
            height: 44px;
        }
    }

    .el-dialog__body {
        flex: 1 1 auto;
        min-height: 0;
        padding: 0;
        overflow-y: auto;
    }

    .designer-form-preview-dialog__content {
        width: 100%;
        max-width: 1040px;
        min-height: 240px;
        margin: 0 auto;
        padding: 16px 20px;
    }
}
</style>
