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
                <center-render-panel @clear-widgets="clearWidgets" @save-local-draft="handleSaveLocalDraft"></center-render-panel>
            </el-splitter-panel>
            <el-splitter-panel v-model:size="rightPanelSize" class="workspace-panel workspace-panel--right" :min="RIGHT_PANEL_LIMITS.min" :max="RIGHT_PANEL_LIMITS.max">
                <right-setting-panel></right-setting-panel>
            </el-splitter-panel>
        </el-splitter>
    </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, provide, readonly, ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { type WidgetFormData } from "@/views/composables/types";
import useWidgetManage from "@/views/composables/widget-manage";
import { createDesignerFormDraft, restoreDesignerFormDraft } from "@/views/composables/designer-form-draft";
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
 * @description 将当前表单设计投影为本地草稿并通过 Storage Store 保存。
 * @returns 无返回值；成功或失败均通过 Element Plus 消息反馈。
 * @remarks 领域投影先完成 JSON 转换并排除 componentAttributes，Storage Store 只负责不缓存的持久化写入。
 */
const handleSaveLocalDraft = function (): void {
    const draftResult = createDesignerFormDraft(widgetFormData);
    if (!draftResult.ok) {
        ElMessage.error(draftResult.message);
        return;
    }
    try {
        storageStore.setDesignerFormDraft(draftResult.data);
        ElMessage.success("当前设计已保存到本地");
    } catch {
        ElMessage.error("本地保存失败，请检查浏览器存储权限或空间");
    }
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
    const draftResult = restoreDesignerFormDraft(storedDraft);
    if (!draftResult.ok) {
        ElMessage.error(`上次保存的设计读取失败：${draftResult.message}`);
        return;
    }
    const savedAtText = new Date(draftResult.data.savedAt).toLocaleString("zh-CN", { hour12: false });
    try {
        await ElMessageBox.confirm(`检测到上次保存的设计（保存时间：${savedAtText}），是否恢复继续编辑？`, "恢复上次设计", {
            type: "info",
            confirmButtonText: "恢复",
            cancelButtonText: "取消"
        });
    } catch {
        return;
    }
    replaceWidgetFormData(draftResult.data.form);
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
