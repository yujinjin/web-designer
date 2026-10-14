/**
 * @fileoverview 管理三栏 Splitter 的会话级尺寸与窗口生命周期，不持久化宽度也不接触表单业务数据。
 */
import { onMounted, onUnmounted, ref } from "vue";
import { calculateWorkspacePanelSizes, normalizeWorkspacePanelSizes, WORKSPACE_MIN_WIDTH } from "@/views/utils/workspace-layout";

/**
 * @description 创建当前工作区的三栏响应式尺寸和拖动处理器。
 * @returns 三个面板宽度 Ref 及 resize-end 处理器。
 * @remarks 用户拖动前按视口比例计算，拖动后保留侧栏像素宽度；窄屏由页面最小宽度与横向滚动承接。
 */
export function useDesignerWorkspaceLayout() {
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

    /**
     * @description 同步窗口变化后的三栏尺寸。
     * @returns 无返回值；该函数更新三个 Splitter Panel 的会话级宽度。
     * @remarks 用户尚未拖动时重新使用响应式初始比例；拖动后保留左右像素宽度，并再次应用 min/max 约束。
     */
    const syncWorkspacePanelSizes = function (): void {
        // 工作区最小宽度与页面横向滚动协作，不挤压中间画布。
        const availableWidth = Math.max(window.innerWidth, WORKSPACE_MIN_WIDTH);
        // 用户拖动后保留侧栏偏好，但始终再次施加上下限。
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
        // 用户拖动后保留侧栏偏好，但始终再次施加上下限。
        const panelSizes = normalizeWorkspacePanelSizes(Math.max(window.innerWidth, WORKSPACE_MIN_WIDTH), sizes[0] ?? leftPanelSize.value, sizes[2] ?? rightPanelSize.value);
        hasAdjustedPanelSize.value = true;
        leftPanelSize.value = panelSizes.left;
        centerPanelSize.value = panelSizes.center;
        rightPanelSize.value = panelSizes.right;
    };

    /**
     * @description 挂载时注册窗口尺寸监听。
     * @remarks 对应卸载钩子释放全局引用，重复进入设计器不会叠加监听。
     */
    onMounted(() => {
        window.addEventListener("resize", syncWorkspacePanelSizes);
    });
    /**
     * @description 卸载时清理当前工作区持有的监听器。
     */
    onUnmounted(() => {
        window.removeEventListener("resize", syncWorkspacePanelSizes);
    });
    return { leftPanelSize, centerPanelSize, rightPanelSize, handleWorkspaceResizeEnd };
}
