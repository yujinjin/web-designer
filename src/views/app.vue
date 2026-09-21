<!--
 * @创建者: yujinjin9@126.com
 * @描述: 欢迎页面
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
import { onMounted, onUnmounted, provide, readonly, ref, reactive, shallowRef } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { type WidgetFormData } from "@/views/composables/types";
import useWidgetManage from "@/views/composables/widget-manage";
import { createDesignerFormDocument, parseDesignerFormDocumentText, restoreDesignerFormDocument } from "@/views/composables/designer-form-document";
import { downloadJsonText, JSON_FILE_MAX_BYTES, readJsonFileText } from "@/views/composables/browser-json-file";
import { useCreateDefaultData } from "@/views/composables/widgets/form";
import useStorageStore from "@/stores/storage";
import {
    calculateWorkspacePanelSizes,
    CENTER_PANEL_MIN_WIDTH,
    LEFT_PANEL_LIMITS,
    normalizeWorkspacePanelSizes,
    RIGHT_PANEL_LIMITS,
    WORKSPACE_MIN_WIDTH
} from "@/views/composables/designer-workspace-layout";
import leftWidgetPanel from "@/views/components/left-widget-panel.vue";
import centerRenderPanel from "@/views/components/center-render-panel.vue";
import rightSettingPanel from "@/views/components/right-setting-panel.vue";
import designerFormPreviewDialog from "@/views/components/designer-form-preview-dialog.vue";
import { createDesignerFormPreviewSnapshot } from "@/views/composables/designer-form-preview";

// 首次加载按当前视口计算三栏宽度，窄屏按工作区最小宽度计算并交由外层滚动。
const initialPanelSizes = calculateWorkspacePanelSizes(typeof window === "undefined" ? WORKSPACE_MIN_WIDTH : window.innerWidth);

// Splitter 当前会话中的左侧组件库宽度。
const leftPanelSize = ref(initialPanelSizes.left);

// Splitter 当前会话中的中间渲染区宽度。
const centerPanelSize = ref(initialPanelSizes.center);

// Splitter 当前会话中的右侧设置区宽度。
const rightPanelSize = ref(initialPanelSizes.right);

// 用户拖动后保留其左右栏像素宽度，窗口变化只重新分配剩余画布空间。
const hasAdjustedPanelSize = ref(false);

// 表单数据，必须是响应式，否则组件管理无法更新
// 使编辑器 Vue TS Plugin 再次展开完整 Reactive<WidgetFormData>，容易产生 TS2589“类型实例化过深”。
const widgetFormData = reactive(useCreateDefaultData()) as WidgetFormData;

// 本地草稿每次通过 Store action 直接读写，不进入 Pinia state。
const storageStore = useStorageStore();

// 选中的组件id
const selectedWigetId = ref<string | null>(null);

// 控制独立表单预览 Dialog 的显示状态。
const isPreviewVisible = ref(false);

/** 当前一次打开使用的独立预览快照；关闭完成后释放引用。 */
const previewWidgetFormData = shallowRef<WidgetFormData | null>(null);

// 组件管理
const {
    changeSelectedWidgetId,
    changeSelectedWidgetSettingData,
    changeFormSettingData,
    insertWidgetDefaultData,
    updateWidgetOrder,
    copyWidgetData,
    deleteWidget,
    clearWidgets,
    replaceWidgetFormData
} = useWidgetManage(widgetFormData, selectedWigetId);

// 提供表单数据、改变表单数据、改变选中的组件的设置数据、选中的组件id、改变选中的组件id
provide("widgetFormData", readonly(widgetFormData));
provide("changeFormSettingData", changeFormSettingData);
provide("changeSelectedWidgetSettingData", changeSelectedWidgetSettingData);
provide("insertWidgetDefaultData", insertWidgetDefaultData);
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

/**
 * @description 将当前表单设计投影为与导出文件同格式的文档并通过 Storage Store 保存。
 * @returns 无返回值；成功或失败均通过 Element Plus 消息反馈。
 * @remarks 领域投影先完成 JSON 转换并排除 componentAttributes，Storage Store 只负责不缓存的持久化写入。
 */
const handleSaveLocalDraft = function (): void {
    const documentResult = createDesignerFormDocument(widgetFormData);
    if (!documentResult.ok) {
        ElMessage.error(documentResult.message);
        return;
    }
    try {
        storageStore.setDesignerFormDraft(documentResult.data);
        ElMessage.success("当前设计已保存到本地");
    } catch {
        ElMessage.error("本地保存失败，请检查浏览器存储权限或空间");
    }
};

/**
 * @description 生成当前设计器 V1 文档并下载格式化 JSON 文件。
 * @returns 无返回值；序列化、大小或浏览器下载失败时显示错误反馈。
 */
const handleExportJson = function (): void {
    const documentResult = createDesignerFormDocument(widgetFormData);
    if (!documentResult.ok) {
        ElMessage.error(documentResult.message);
        return;
    }
    try {
        const text = JSON.stringify(documentResult.data, null, 4);
        if (new TextEncoder().encode(text).byteLength > JSON_FILE_MAX_BYTES) {
            ElMessage.error("导出失败：JSON 文件不能超过 2 MiB");
            return;
        }
        const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15);
        downloadJsonText(text, `web-designer-form-${timestamp}.json`);
        ElMessage.success("JSON 导出成功");
    } catch {
        ElMessage.error("JSON 导出失败，请检查浏览器下载权限");
    }
};

/**
 * @description 读取、校验并在用户确认后原子导入表单设计文档。
 * @param file Center Panel 文件选择器提供的单个 JSON 文件。
 * @returns Promise 完成后无返回值；任一失败或取消分支均保持当前设计及本地草稿不变。
 * @remarks 动态脚本只编译不执行；HTML 发现任何被白名单移除的高危内容会直接拒绝，合法动态内容需额外风险确认。
 */
const handleImportJson = async function (file: File): Promise<void> {
    const fileResult = await readJsonFileText(file, JSON_FILE_MAX_BYTES);
    if (!fileResult.ok) {
        ElMessage.error(fileResult.message);
        return;
    }
    const documentResult = parseDesignerFormDocumentText(fileResult.data);
    if (!documentResult.ok) {
        ElMessage.error(`JSON 导入失败：${documentResult.path ? `${documentResult.path} ` : ""}${documentResult.message}`);
        return;
    }
    const hasDynamicContent = documentResult.data.dynamicContent.hasDynamicScripts || documentResult.data.dynamicContent.hasHtml;
    const message = hasDynamicContent
        ? "导入将覆盖当前设计。该文件包含动态脚本或 HTML 内容，后续渲染或交互时可能执行代码、发起请求或展示自定义内容。请确认文件来源可信，是否继续？"
        : "导入将覆盖当前设计，是否继续？";
    try {
        await ElMessageBox.confirm(message, "导入 JSON", {
            type: hasDynamicContent ? "warning" : "info",
            confirmButtonText: "确认导入",
            cancelButtonText: "取消"
        });
    } catch {
        return;
    }
    replaceWidgetFormData(documentResult.data.document.form);
    ElMessage.success("JSON 导入成功");
};

/**
 * @description 检测上次保存的草稿，并在用户确认后恢复到当前设计器。
 * @returns Promise 完成后无返回值；无草稿或用户取消时保留默认设计。
 * @remarks 读取、结构校验和运行属性构建全部发生在状态提交之前，任何失败都不会产生半更新表单，也不会删除原草稿。
 */
const restoreLastDesignerFormDraft = async function (): Promise<void> {
    let storedDraft: unknown;
    try {
        storedDraft = storageStore.getDesignerFormDraft();
    } catch {
        ElMessage.error("上次保存的设计读取失败，请检查浏览器存储权限");
        return;
    }
    if (storedDraft === undefined || storedDraft === null) return;
    const documentResult = restoreDesignerFormDocument(storedDraft);
    if (!documentResult.ok) {
        ElMessage.error(`上次保存的设计读取失败：${documentResult.message}`);
        return;
    }
    const savedAtText = documentResult.data.savedAt ? `（保存时间：${new Date(documentResult.data.savedAt).toLocaleString("zh-CN", { hour12: false })}）` : "";
    try {
        await ElMessageBox.confirm(`检测到上次保存的设计${savedAtText}，是否恢复继续编辑？`, "恢复上次设计", {
            type: "info",
            confirmButtonText: "恢复",
            cancelButtonText: "取消"
        });
    } catch {
        return;
    }
    replaceWidgetFormData(documentResult.data.form);
    ElMessage.success("已恢复上次保存的设计");
};

/**
 * @description 同步窗口变化后的三栏尺寸。
 * @returns 无返回值；该函数更新三个 Splitter Panel 的会话级宽度。
 * @remarks 用户尚未拖动时重新使用响应式初始比例；拖动后保留左右像素宽度，并再次应用 min/max 约束。
 */
const syncWorkspacePanelSizes = function (): void {
    const availableWidth = Math.max(window.innerWidth, WORKSPACE_MIN_WIDTH);
    const panelSizes = hasAdjustedPanelSize.value ? normalizeWorkspacePanelSizes(availableWidth, leftPanelSize.value, rightPanelSize.value) : calculateWorkspacePanelSizes(availableWidth);

    leftPanelSize.value = panelSizes.left;
    centerPanelSize.value = panelSizes.center;
    rightPanelSize.value = panelSizes.right;
};

/**
 * @description 记录用户已经主动调整面板，并归一化 Splitter 返回的像素尺寸。
 * @param _index - 本次拖动的分隔线索引；当前三栏使用统一约束，不需要区分索引。
 * @param sizes - Element Plus Splitter 返回的左、中、右面板像素宽度。
 * @returns 无返回值；该函数更新当前会话的面板宽度。
 */
const handleWorkspaceResizeEnd = function (_index: number, sizes: number[]): void {
    const panelSizes = normalizeWorkspacePanelSizes(Math.max(window.innerWidth, WORKSPACE_MIN_WIDTH), sizes[0] ?? leftPanelSize.value, sizes[2] ?? rightPanelSize.value);
    hasAdjustedPanelSize.value = true;
    leftPanelSize.value = panelSizes.left;
    centerPanelSize.value = panelSizes.center;
    rightPanelSize.value = panelSizes.right;
};

/**
 * @description 注册窗口尺寸同步，使未拖动布局随视口变化，已拖动布局继续遵守像素边界。
 * @remarks 监听器只维护局部 UI 状态，不会写入本地存储或表单业务数据；卸载时必须释放全局引用。
 */
onMounted(() => {
    window.addEventListener("resize", syncWorkspacePanelSizes);
    void restoreLastDesignerFormDraft();
});

/**
 * @description 移除工作区窗口监听，避免页面重新挂载后重复执行尺寸计算。
 */
onUnmounted(() => {
    window.removeEventListener("resize", syncWorkspacePanelSizes);
});
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
