/**
 * @fileoverview 验证设计器三栏尺寸约束和画布唯一操作目标的状态优先级。
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createSSRApp, h, reactive, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import ElementPlus, { ID_INJECTION_KEY, ZINDEX_INJECTION_KEY } from "element-plus";
import centerRenderPanel from "@/views/components/center-render-panel.vue";
import { type WidgetFormData } from "@/views/composables/types";
import {
    calculateWorkspacePanelSizes,
    CENTER_PANEL_MIN_WIDTH,
    LEFT_PANEL_LIMITS,
    normalizeWorkspacePanelSizes,
    RIGHT_PANEL_LIMITS,
    WORKSPACE_MIN_WIDTH
} from "@/views/composables/designer-workspace-layout";
import { useWidgetOperationTarget } from "@/views/composables/widget-operation-target";
import {
    createWidgetLibrarySortableGroup,
    createWidgetLibraryTargetGroup,
    DESIGNER_ROOT_DRAGGABLE_SELECTOR,
    DESIGNER_ROOT_SORTABLE_GROUP,
    getRowContainerSortableGroupName,
    ROW_CONTAINER_DRAGGABLE_SELECTOR,
    useSortableDragState,
    WIDGET_LIBRARY_DRAGGABLE_SELECTOR,
    WIDGET_LIBRARY_SORTABLE_GROUP
} from "@/views/composables/widget-drag-drop";
import { useCreateDefaultData as useCreateFormDefaultData } from "@/views/composables/widgets/form";
import { useCreateDefaultData as useCreateRowContainerDefaultData } from "@/views/composables/widgets/row-container";
import { useCreateDefaultData as useCreateTextDefaultData } from "@/views/composables/widgets/text";

const centerRenderPanelSource = readFileSync(new URL("../../src/views/components/center-render-panel.vue", import.meta.url), "utf-8");
const leftWidgetPanelSource = readFileSync(new URL("../../src/views/components/left-widget-panel.vue", import.meta.url), "utf-8");
const rowContainerRendererSource = readFileSync(new URL("../../src/views/components/row-container-renderer.vue", import.meta.url), "utf-8");
const widgetRendererSource = readFileSync(new URL("../../src/views/components/widget-renderer.vue", import.meta.url), "utf-8");

describe("designer workspace layout", () => {
    it("按目标比例初始化常见桌面宽度并遵守面板边界", () => {
        const sizes = calculateWorkspacePanelSizes(1366);

        expect(sizes.left).toBeCloseTo(1366 * 0.22);
        expect(sizes.right).toBeCloseTo(1366 * 0.29);
        expect(sizes.center).toBeGreaterThanOrEqual(CENTER_PANEL_MIN_WIDTH);
        expect(sizes.left).toBeGreaterThanOrEqual(LEFT_PANEL_LIMITS.min);
        expect(sizes.right).toBeGreaterThanOrEqual(RIGHT_PANEL_LIMITS.min);
        expect(sizes.left + sizes.center + sizes.right).toBeCloseTo(1366);
    });

    it("宽屏下侧栏达到上限后把剩余空间交给画布", () => {
        const sizes = calculateWorkspacePanelSizes(2560);

        expect(sizes.left).toBe(LEFT_PANEL_LIMITS.max);
        expect(sizes.right).toBe(RIGHT_PANEL_LIMITS.max);
        expect(sizes.center).toBe(2560 - LEFT_PANEL_LIMITS.max - RIGHT_PANEL_LIMITS.max);
    });

    it("窄视口按完整工作区计算且不会压缩画布最小宽度", () => {
        const sizes = calculateWorkspacePanelSizes(800);

        expect(sizes.left + sizes.center + sizes.right).toBeCloseTo(WORKSPACE_MIN_WIDTH);
        expect(sizes.center).toBeGreaterThanOrEqual(CENTER_PANEL_MIN_WIDTH);
        expect(sizes.left).toBeGreaterThanOrEqual(LEFT_PANEL_LIMITS.min);
        expect(sizes.right).toBeGreaterThanOrEqual(RIGHT_PANEL_LIMITS.min);
    });

    it("窗口变化时保留合法的用户侧栏宽度并重新分配画布", () => {
        const sizes = normalizeWorkspacePanelSizes(1920, 320, 480);

        expect(sizes).toEqual({ left: 320, center: 1120, right: 480 });
    });

    it("极端侧栏偏好会先应用边界再为画布回收空间", () => {
        const sizes = normalizeWorkspacePanelSizes(WORKSPACE_MIN_WIDTH, 100, 1000);

        expect(sizes.left).toBe(LEFT_PANEL_LIMITS.min);
        expect(sizes.center).toBe(CENTER_PANEL_MIN_WIDTH);
        expect(sizes.right).toBe(WORKSPACE_MIN_WIDTH - LEFT_PANEL_LIMITS.min - CENTER_PANEL_MIN_WIDTH);
    });
});

describe("widget operation target", () => {
    it("按悬停、聚焦、选中顺序解析唯一操作目标并逐级恢复", () => {
        const selectedWidgetId = ref<string | null>("selected");
        const { activeOperationWidgetId, setHoveredWidgetId, clearHoveredWidgetId, setFocusedWidgetId } = useWidgetOperationTarget(selectedWidgetId);

        expect(activeOperationWidgetId.value).toBe("selected");

        setFocusedWidgetId("focused");
        expect(activeOperationWidgetId.value).toBe("focused");

        setHoveredWidgetId("hovered");
        expect(activeOperationWidgetId.value).toBe("hovered");

        clearHoveredWidgetId("another-widget");
        expect(activeOperationWidgetId.value).toBe("hovered");

        clearHoveredWidgetId("hovered");
        expect(activeOperationWidgetId.value).toBe("focused");

        setFocusedWidgetId(null);
        expect(activeOperationWidgetId.value).toBe("selected");
    });

    it("没有悬停、聚焦或选中节点时不展示任何操作目标", () => {
        const { activeOperationWidgetId } = useWidgetOperationTarget();

        expect(activeOperationWidgetId.value).toBeNull();
    });

    it("选中行容器子字段时只激活子字段操作区", async () => {
        const widgetFormData = reactive(useCreateFormDefaultData() as object) as WidgetFormData;
        const rowContainer = useCreateRowContainerDefaultData();
        const childWidget = useCreateTextDefaultData();
        rowContainer.widgets.push(childWidget);
        rowContainer.settingData.spans = [24];
        widgetFormData.widgets.push(rowContainer);
        const selectedWidgetId = ref<string | null>(childWidget.id);
        const app = createSSRApp({ render: () => h(centerRenderPanel) });
        app.use(ElementPlus);
        app.provide(ID_INJECTION_KEY, { prefix: 0, current: 0 });
        app.provide(ZINDEX_INJECTION_KEY, { current: 0 });
        app.provide("widgetFormData", widgetFormData);
        app.provide("selectedWigetId", selectedWidgetId);
        app.provide("changeSelectedWidgetId", () => undefined);
        app.provide("insertWidgetDefaultData", () => undefined);
        app.provide("updateWidgetOrder", () => undefined);
        app.provide("copyWidgetData", () => undefined);
        app.provide("deleteWidget", () => undefined);

        const html = await renderToString(app);
        const activeClassCount = html.match(/operation-active/g)?.length ?? 0;

        expect(html).toContain("row-container-item");
        expect(html).toContain("row-container-child");
        expect(activeClassCount).toBe(1);
    });
});

describe("widget drag drop", () => {
    it("使用独立分组限制组件库、顶层画布和行容器之间的接收关系", () => {
        expect(createWidgetLibrarySortableGroup()).toEqual({ name: WIDGET_LIBRARY_SORTABLE_GROUP, pull: "clone", put: false });
        expect(createWidgetLibraryTargetGroup(DESIGNER_ROOT_SORTABLE_GROUP)).toEqual({ name: DESIGNER_ROOT_SORTABLE_GROUP, pull: false, put: [WIDGET_LIBRARY_SORTABLE_GROUP] });
        expect(getRowContainerSortableGroupName("row-1")).toBe("row-container:row-1");
        expect(WIDGET_LIBRARY_DRAGGABLE_SELECTOR).toBe(".widget-item");
        expect(DESIGNER_ROOT_DRAGGABLE_SELECTOR).toBe(".drag-item, .widget-item");
        expect(ROW_CONTAINER_DRAGGABLE_SELECTOR).toBe(".row-container-child, .widget-item");
    });

    it("显式收口拖拽状态以便开始时关闭 Tooltip 并在结束时恢复", () => {
        const { isDragging, startDragging, stopDragging } = useSortableDragState();

        expect(isDragging.value).toBe(false);

        startDragging();
        expect(isDragging.value).toBe(true);

        stopDragging();
        expect(isDragging.value).toBe(false);
    });

    it("空画布提示位于 Sortable 根元素之外", async () => {
        const widgetFormData = reactive(useCreateFormDefaultData() as object) as WidgetFormData;
        const selectedWidgetId = ref<string | null>(null);
        const app = createSSRApp({ render: () => h(centerRenderPanel) });
        app.use(ElementPlus);
        app.provide(ID_INJECTION_KEY, { prefix: 0, current: 0 });
        app.provide(ZINDEX_INJECTION_KEY, { current: 0 });
        app.provide("widgetFormData", widgetFormData);
        app.provide("selectedWigetId", selectedWidgetId);
        app.provide("changeSelectedWidgetId", () => undefined);
        app.provide("insertWidgetDefaultData", () => undefined);
        app.provide("updateWidgetOrder", () => undefined);
        app.provide("copyWidgetData", () => undefined);
        app.provide("deleteWidget", () => undefined);

        const html = await renderToString(app);
        const dropContainerStart = html.indexOf('class="el-row drop-container"');
        const dropContainerEnd = html.indexOf("</div>", dropContainerStart);
        const emptyTipStart = html.indexOf('class="empty-tip"');

        expect(dropContainerStart).toBeGreaterThanOrEqual(0);
        expect(dropContainerEnd).toBeGreaterThan(dropContainerStart);
        expect(emptyTipStart).toBeGreaterThan(dropContainerEnd);
    });

    it("操作栏使用固定缓冲区与脱离文档流的浮动层，显隐不改变布局尺寸", () => {
        const centerOperationBarStyle = centerRenderPanelSource.slice(centerRenderPanelSource.indexOf("> .widget-operation-bar"), centerRenderPanelSource.indexOf("&.operation-active"));
        const rowChildHeaderStyle = rowContainerRendererSource.slice(rowContainerRendererSource.indexOf(".row-child-header"), rowContainerRendererSource.indexOf(".row-child-identity"));
        const rowChildActiveStyle = rowContainerRendererSource.slice(rowContainerRendererSource.indexOf("&.operation-active"), rowContainerRendererSource.indexOf("&.selected"));

        expect(centerOperationBarStyle).toContain("height: 28px");
        expect(centerOperationBarStyle).toContain("position: absolute");
        expect(centerOperationBarStyle).toContain("visibility: hidden");
        expect(centerOperationBarStyle).toContain("pointer-events: none");
        expect(centerOperationBarStyle).toContain("max-width: calc(100% - 24px)");
        expect(centerOperationBarStyle).not.toContain("display: none");
        expect(rowChildHeaderStyle).toContain("height: 28px");
        expect(rowChildHeaderStyle).toContain("position: absolute");
        expect(rowChildHeaderStyle).toContain("visibility: hidden");
        expect(rowChildHeaderStyle).toContain("pointer-events: none");
        expect(rowChildHeaderStyle).toContain("max-width: calc(100% - 16px)");
        expect(rowChildActiveStyle).not.toContain("pointer-events: auto");
        expect(centerOperationBarStyle).toMatch(/\.widget-operation-button,[\s\S]*?\.widget-status[\s\S]*?pointer-events: auto/);
        expect(rowContainerRendererSource).toMatch(/\.row-child-operation-button\s*\{[\s\S]*?pointer-events: auto/);
        expect(centerRenderPanelSource).toContain(".drag-item:has(.row-container-child.operation-active)");
        expect(centerRenderPanelSource).toMatch(/\.designer-drop-indicator[\s\S]*?z-index: 6/);
        expect(rowContainerRendererSource.indexOf('class="row-child-header"')).toBeLessThan(rowContainerRendererSource.indexOf("<widget-renderer"));
    });

    it("组件选择仅停止冒泡，不取消 Radio 和 Checkbox 的默认点击行为", () => {
        expect(centerRenderPanelSource).toContain('@click.stop="changeSelectedWidgetId?.(item.id)"');
        expect(centerRenderPanelSource).not.toContain('@click.stop.prevent="changeSelectedWidgetId?.(item.id)"');
        expect(rowContainerRendererSource).toContain('@click.stop="changeSelectedWidgetId?.(widgetData.id)"');
        expect(rowContainerRendererSource).toContain('@click.stop="changeSelectedWidgetId?.(item.id)"');
        expect(rowContainerRendererSource).not.toContain("@click.stop.prevent");
    });

    it("选中态使用左侧强调、浅背景和轻阴影而不是完整硬边框", () => {
        for (const source of [centerRenderPanelSource, rowContainerRendererSource]) {
            const selectedStyle = source.slice(source.indexOf("&.selected"), source.indexOf("&:focus-visible", source.indexOf("&.selected")));

            expect(selectedStyle).toContain("background-color: var(--el-color-primary-light-9)");
            expect(selectedStyle).toContain("inset 3px 0 0 var(--el-color-primary)");
            expect(selectedStyle).not.toContain("0 2px 8px rgba(0, 0, 0, 0.08)");
            expect(selectedStyle).not.toContain("border-color: var(--el-color-primary);");
        }
    });

    it("使用设计器专属 ghost 同时表达直接接收容器和精确插入位置", () => {
        expect(centerRenderPanelSource).toContain('ghostClass: "designer-drop-indicator"');
        expect(rowContainerRendererSource).toContain('ghostClass: "designer-drop-indicator"');
        expect(centerRenderPanelSource).toContain(".drop-container > .designer-drop-indicator");
        expect(centerRenderPanelSource).toContain(".row-container-grid > .designer-drop-indicator");
        expect(centerRenderPanelSource).toContain("&::before");
        expect(centerRenderPanelSource).toContain("&::after");
        expect(centerRenderPanelSource).toContain(":has(> .drop-container > .designer-drop-indicator)");
        expect(centerRenderPanelSource).toContain(":has(> .row-container-grid > .designer-drop-indicator)");
        expect(centerRenderPanelSource).toMatch(/<style lang="scss">[\s\S]*?designer-drop-indicator/);
    });

    it("统一画布安全边距并使用外置完整浮层", () => {
        expect(centerRenderPanelSource).toMatch(/\.tool-bar\s*\{[\s\S]*?height: 40px/);
        expect(centerRenderPanelSource).toMatch(/\.render-panel\s*\{[\s\S]*?padding: 16px/);
        expect(centerRenderPanelSource).toMatch(/\.drop-container\s*\{[\s\S]*?padding-top: 16px/);
        expect(centerRenderPanelSource).toMatch(/\.drag-item\s*\{[\s\S]*?\+ \.drag-item\s*\{[\s\S]*?margin-top: 16px/);
        expect(centerRenderPanelSource).toContain('class="widget-preview-content"');
        expect(centerRenderPanelSource).toMatch(/\.widget-preview-content\s*\{[\s\S]*?padding: 8px 12px/);
        expect(centerRenderPanelSource).toMatch(/> \.widget-operation-bar\s*\{[\s\S]*?top: 0[\s\S]*?transform: translateY\(-50%\)/);
        expect(centerRenderPanelSource).toMatch(/> \.widget-operation-bar\s*\{[\s\S]*?border: 1px solid var\(--el-border-color-light\)/);
        expect(centerRenderPanelSource).toMatch(/> \.widget-operation-bar\s*\{[\s\S]*?background-color: var\(--el-bg-color\)/);
        expect(centerRenderPanelSource).toMatch(/> \.widget-operation-bar\s*\{[\s\S]*?box-shadow: var\(--el-box-shadow-lighter\)/);
        expect(rowContainerRendererSource).toMatch(/\.row-container-grid\s*\{[\s\S]*?padding-top: 16px[\s\S]*?row-gap: 16px/);
        expect(rowContainerRendererSource).toMatch(/\.row-child-header\s*\{[\s\S]*?top: 0[\s\S]*?transform: translateY\(-50%\)/);
        expect(rowContainerRendererSource).toContain('class="row-child-content"');
        expect(rowContainerRendererSource).toMatch(/\.row-child-content\s*\{[\s\S]*?padding: 8px 12px/);
        expect(widgetRendererSource).toMatch(/\.html-contents,[\s\S]*?\.divider-box\s*\{[\s\S]*?padding: 8px 0/);
    });

    it("组件库 Tooltip 绑定完整的拖拽开始、结束、取消和卸载清理路径", () => {
        expect(leftWidgetPanelSource).toContain(':disabled="isDragging"');
        expect(leftWidgetPanelSource).toContain(':enterable="false"');
        expect(leftWidgetPanelSource).toContain(':persistent="false"');
        expect(leftWidgetPanelSource).toMatch(/onStart:[\s\S]*?startDragging\(\)/);
        expect(leftWidgetPanelSource).toMatch(/onEnd:[\s\S]*?stopDragging\(\)/);
        expect(leftWidgetPanelSource).toMatch(/onUnchoose:[\s\S]*?stopDragging\(\)/);
        expect(leftWidgetPanelSource).toMatch(/onUnmounted\([\s\S]*?stopDragging\(\)[\s\S]*?destroy\(\)/);
    });
});
