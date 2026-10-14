<!--
 * @fileoverview 表单设计器页面入口，拥有根设计状态并装配三栏工作区与独立预览。
 * @remarks 子面板只读取 readonly 注入并通过管理器操作更新；布局与文档副作用由专属 composable 管理。
-->
<template>
    <div class="main-container">
        <el-splitter class="designer-workspace" @resize-end="handleWorkspaceResizeEnd">
            <el-splitter-panel v-model:size="leftPanelSize" class="workspace-panel workspace-panel--left" :min="LEFT_PANEL_LIMITS.min" :max="LEFT_PANEL_LIMITS.max">
                <left-widget-panel></left-widget-panel>
            </el-splitter-panel>
            <el-splitter-panel v-model:size="centerPanelSize" class="workspace-panel workspace-panel--center" :min="CENTER_PANEL_MIN_WIDTH">
                <center-render-panel
                    @clear-widgets="clearWidgets"
                    @save-local-draft="handleSaveLocalDraft"
                    @preview="handlePreview"
                    @import-json="handleImportJson"
                    @export-json="handleExportJson"
                ></center-render-panel>
            </el-splitter-panel>
            <el-splitter-panel v-model:size="rightPanelSize" class="workspace-panel workspace-panel--right" :min="RIGHT_PANEL_LIMITS.min" :max="RIGHT_PANEL_LIMITS.max">
                <right-setting-panel></right-setting-panel>
            </el-splitter-panel>
        </el-splitter>
        <designer-form-preview-dialog v-if="previewWidgetFormData" v-model="isPreviewVisible" :widget-form-data="previewWidgetFormData" @closed="handlePreviewClosed" />
    </div>
</template>
<script setup lang="ts">
import { provide, readonly, ref, reactive, shallowRef } from "vue";
import { ElMessage } from "element-plus";
import { type WidgetFormData } from "@/views/types";
import useWidgetManage from "@/views/composables/use-widget-manage";
import { useCreateDefaultData } from "@/views/domain/form/form-adapter";
import { CENTER_PANEL_MIN_WIDTH, LEFT_PANEL_LIMITS, RIGHT_PANEL_LIMITS, WORKSPACE_MIN_WIDTH } from "@/views/utils/workspace-layout";
import { useDesignerWorkspaceLayout } from "@/views/composables/use-designer-workspace-layout";
import { useDesignerDocumentActions } from "@/views/composables/use-designer-document-actions";
import leftWidgetPanel from "@/views/components/workspace/left-widget-panel.vue";
import centerRenderPanel from "@/views/components/canvas/center-render-panel.vue";
import rightSettingPanel from "@/views/components/workspace/right-setting-panel.vue";
import designerFormPreviewDialog from "@/views/components/preview/designer-form-preview-dialog.vue";
import { createDesignerFormPreviewSnapshot } from "@/views/domain/preview/preview-runtime";

// 面板宽度只属于当前工作区会话，与表单持久化内容隔离。
const { leftPanelSize, centerPanelSize, rightPanelSize, handleWorkspaceResizeEnd } = useDesignerWorkspaceLayout();

/**
 * @description 页面唯一可编辑的表单根状态，子面板通过 readonly 注入读取。
 * @remarks 深层字段仍需响应式；显式 WidgetFormData 断言只限制类型展开，避免 Vue TS Plugin 对巨大联合类型产生 TS2589，不改变响应式行为。
 */
const widgetFormData = reactive(useCreateDefaultData()) as WidgetFormData;

// 选中的组件id
const selectedWigetId = ref<string | null>(null);

// 控制独立表单预览 Dialog 的显示状态。
const isPreviewVisible = ref(false);

/**
 * @description 当前一次打开使用的独立预览快照。
 * @remarks shallowRef 只追踪快照替换，预览组件内部负责建立深层响应式；关闭动画完成后释放引用，避免预览交互写回设计器。
 */
const previewWidgetFormData = shallowRef<WidgetFormData | null>(null);

// 组件管理
const {
    changeSelectedWidgetId,
    changeSelectedWidgetSettingData,
    changeFormSettingData,
    insertWidgetDefaultData,
    insertWidgetTemplate,
    updateWidgetOrder,
    copyWidgetData,
    deleteWidget,
    clearWidgets,
    replaceWidgetFormData
} = useWidgetManage(widgetFormData, selectedWigetId);

// 统一注入契约保留原键名；所有子面板写操作经管理器，避免绕过选中状态和树结构规则。
provide("widgetFormData", readonly(widgetFormData));
provide("changeFormSettingData", changeFormSettingData);
provide("changeSelectedWidgetSettingData", changeSelectedWidgetSettingData);
provide("insertWidgetDefaultData", insertWidgetDefaultData);
provide("insertWidgetTemplate", insertWidgetTemplate);
provide("updateWidgetOrder", updateWidgetOrder);
provide("copyWidgetData", copyWidgetData);
provide("deleteWidget", deleteWidget);
provide("selectedWigetId", readonly(selectedWigetId));
provide("changeSelectedWidgetId", changeSelectedWidgetId);

/**
 * @description 从当前设计创建独立快照并打开表单预览。
 * @returns 无返回值；快照失败时仅展示原因并保持 Dialog 关闭。
 */
const handlePreview = function (): void {
    // 创建独立可运行副本，配置错误时不打开空预览。
    const previewResult = createDesignerFormPreviewSnapshot(widgetFormData);
    if (!previewResult.ok) {
        ElMessage.error(`表单预览失败：${previewResult.message}`);
        return;
    }
    previewWidgetFormData.value = previewResult.data;
    isPreviewVisible.value = true;
};

/**
 * @description 在 Dialog 动画结束后释放本次预览快照。
 * @returns 无返回值。
 */
const handlePreviewClosed = function (): void {
    previewWidgetFormData.value = null;
};

// 文档候选通过管理器原子应用，避免领域层直接修改页面拥有的响应式根对象。
const { handleSaveLocalDraft, handleExportJson, handleImportJson } = useDesignerDocumentActions(widgetFormData, replaceWidgetFormData);
</script>
<style lang="scss" scoped>
.main-container {
    height: 100vh;
    width: 100vw;
    position: relative;
    overflow-x: auto;
    overflow-y: hidden;
    background-color: var(--el-bg-color);

    .designer-workspace {
        min-width: v-bind("WORKSPACE_MIN_WIDTH + 'px'");
    }

    :deep(.workspace-panel) {
        min-width: 0;
        overflow: hidden;
    }

    :deep(.el-splitter-bar__dragger) {
        z-index: 20;

        &::before {
            background-color: var(--el-border-color-light);
            transition: background-color var(--el-transition-duration-fast);
        }

        &:hover::before,
        &.el-splitter-bar__dragger-active::before {
            background-color: var(--el-color-primary);
        }
    }
}
</style>
