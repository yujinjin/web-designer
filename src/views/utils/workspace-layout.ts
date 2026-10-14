/**
 * @fileoverview 计算表单设计器三栏工作区的响应式面板尺寸。
 * @remarks 尺寸计算与 Element Plus Splitter 解耦，既便于单元测试，也避免窗口变化时把面板约束散落在 Vue 组件中。
 */

/** 工作区进入横向滚动前保留的最小内容宽度。 */
export const WORKSPACE_MIN_WIDTH = 1216;

/** 左侧组件库允许的宽度范围，单位为像素。 */
export const LEFT_PANEL_LIMITS = { min: 260, max: 420 } as const;

/** 中间渲染区必须保留的最小宽度，单位为像素。 */
export const CENTER_PANEL_MIN_WIDTH = 600;

/** 右侧设置区允许的宽度范围，单位为像素。 */
export const RIGHT_PANEL_LIMITS = { min: 340, max: 560 } as const;

/**
 * @description 设计器左、中、右三个面板的像素宽度。
 */
export interface DesignerWorkspacePanelSizes {
    /** 左侧组件库宽度。 */
    left: number;
    /** 中间渲染区宽度。 */
    center: number;
    /** 右侧设置区宽度。 */
    right: number;
}

/**
 * @description 将数值限制在指定的闭区间内。
 * @param value - 需要限制的原始数值。
 * @param min - 允许的最小值。
 * @param max - 允许的最大值。
 * @returns 位于 min 和 max 之间的数值。
 */
const clamp = function (value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
};

/**
 * @description 在保证中间画布最小宽度的前提下，归一化左右面板宽度。
 * @param availableWidth - 工作区实际参与布局的宽度。
 * @param preferredLeft - 左侧面板期望宽度。
 * @param preferredRight - 右侧面板期望宽度。
 * @returns 满足三栏边界的像素宽度。
 * @remarks 当左右期望宽度挤占画布时，只从超过各自最小值的部分按比例回收，避免其中一侧承担全部收缩量。
 */
export const normalizeWorkspacePanelSizes = function (availableWidth: number, preferredLeft: number, preferredRight: number): DesignerWorkspacePanelSizes {
    // 窄视口由外层横向滚动承接，尺寸计算始终基于完整工作区宽度。
    const workspaceWidth = Math.max(availableWidth, WORKSPACE_MIN_WIDTH);
    let left = clamp(preferredLeft, LEFT_PANEL_LIMITS.min, LEFT_PANEL_LIMITS.max);
    let right = clamp(preferredRight, RIGHT_PANEL_LIMITS.min, RIGHT_PANEL_LIMITS.max);
    const maximumSideWidth = workspaceWidth - CENTER_PANEL_MIN_WIDTH;
    const overflow = left + right - maximumSideWidth;

    if (overflow > 0) {
        const leftReducibleWidth = left - LEFT_PANEL_LIMITS.min;
        const rightReducibleWidth = right - RIGHT_PANEL_LIMITS.min;
        const totalReducibleWidth = leftReducibleWidth + rightReducibleWidth;

        // 当前最小工作区一定能容纳三栏最小值；按可回收空间比例收缩可保持左右栏视觉关系。
        if (totalReducibleWidth > 0) {
            left -= overflow * (leftReducibleWidth / totalReducibleWidth);
            right -= overflow * (rightReducibleWidth / totalReducibleWidth);
        }
    }

    return {
        left,
        center: workspaceWidth - left - right,
        right
    };
};

/**
 * @description 根据当前工作区宽度计算首次进入页面时的三栏尺寸。
 * @param availableWidth - 当前视口或工作区可用宽度。
 * @returns 应用于 Splitter 的左、中、右面板像素宽度。
 * @remarks 22%/49%/29% 是初始倾向，像素上下限优先级更高；宽屏侧栏达到上限后，剩余空间全部交给画布。
 */
export const calculateWorkspacePanelSizes = function (availableWidth: number): DesignerWorkspacePanelSizes {
    const workspaceWidth = Math.max(availableWidth, WORKSPACE_MIN_WIDTH);
    return normalizeWorkspacePanelSizes(workspaceWidth, workspaceWidth * 0.22, workspaceWidth * 0.29);
};
