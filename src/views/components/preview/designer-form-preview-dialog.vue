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
 * @remarks 快照由父级创建并持有；destroy-on-close 销毁字段运行值和初始化生命周期，closed 在关闭动画完成后通知父级释放快照。
 */
import { type PropType } from "vue";
import designerFormPreviewRenderer from "@/views/components/preview/designer-form-preview-renderer.vue";
import { type WidgetFormData } from "@/views/types";

/**
 * @description 父级提供的独立预览快照，null 表示没有可运行内容。
 * @remarks 不在弹窗内复制或恢复配置，避免与页面的快照所有权及初始化入口重叠。
 */
defineProps({ widgetFormData: { type: Object as PropType<WidgetFormData | null>, default: null } });
// 关闭完成事件供父级清理快照，区别于关闭按钮刚触发的时刻。
const emit = defineEmits<{ closed: [] }>();
// 与根页面双向同步弹窗开关，不承担表单配置状态。
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
