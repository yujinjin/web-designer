/**
 * @fileoverview 覆盖设计器组合函数的编辑、响应式同步、操作目标和窗口生命周期行为。
 * @remarks 仅替换 Vue 生命周期与注入边界，状态计算、校验和组件适配均执行真实实现。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, isReadonly, nextTick, reactive, ref } from "vue";
import useJsCodeEditor from "@/views/composables/use-js-code-editor";
import { usePropNameValidator } from "@/views/composables/use-prop-name-validator";
import { useFormRenderData } from "@/views/composables/use-form-render-data";
import { useSortableDragState } from "@/views/composables/use-sortable-drag-state";
import { useWidgetOperationTarget } from "@/views/composables/use-widget-operation-target";
import { useDesignerWorkspaceLayout } from "@/views/composables/use-designer-workspace-layout";
import { useCreateDefaultData as createForm } from "@/views/domain/form/form-adapter";
import { useCreateDefaultData as createText, useSettingDataValueChange as changeText } from "@/views/domain/widgets/adapters/text";
import { useCreateDefaultData as createRow } from "@/views/domain/widgets/adapters/row-container";
import { calculateWorkspacePanelSizes, normalizeWorkspacePanelSizes, WORKSPACE_MIN_WIDTH } from "@/views/utils/workspace-layout";

// 控制组件作用域边界，避免 Node 环境依赖浏览器 DOM。
const context = vi.hoisted(() => ({ mounted: [] as (() => void)[], unmounted: [] as (() => void)[], injections: new Map<string, unknown>() }));
vi.mock("vue", async importOriginal => {
    const actual = await importOriginal<typeof import("vue")>();
    return {
        ...actual,
        onMounted: (callback: () => void) => context.mounted.push(callback),
        onUnmounted: (callback: () => void) => context.unmounted.push(callback),
        inject: (key: string, fallback: unknown) => (context.injections.has(key) ? context.injections.get(key) : fallback)
    };
});

beforeEach(() => {
    context.mounted.length = 0;
    context.unmounted.length = 0;
    context.injections.clear();
});
afterEach(() => vi.unstubAllGlobals());

describe("脚本编辑器", () => {
    it("编辑源码不提前写入，保存通过传入的适配器同步并关闭", () => {
        const widget = createText();
        const change = vi.fn((_adapter, field, value) => changeText(widget, field, value));
        const editor = useJsCodeEditor(widget.settingData, change, changeText);
        const original = widget.settingData.formatter;
        editor.showJsCodeEditorDialog("formatter");
        expect(editor.eventValue.value).toBe(original);
        expect(editor.isShowJsCodeEditorDialog.value).toBe(true);
        editor.eventValue.value = "未保存";
        editor.closeJsCodeEditorDialog();
        expect(widget.settingData.formatter).toBe(original);
        editor.showJsCodeEditorDialog("formatter");
        editor.saveJsCode("function formatter(value) {\n return value + '!';\n}");
        expect(change).toHaveBeenCalledWith(changeText, "formatter", expect.any(String));
        expect(widget.componentAttributes?.formatter?.("A")).toBe("A!");
        expect(editor.isShowJsCodeEditorDialog.value).toBe(false);
    });
    it("未打开编辑器时不写回，适配器错误传播且保留弹窗", () => {
        const change = vi.fn(() => {
            throw new Error("保存失败");
        });
        const editor = useJsCodeEditor(createText().settingData, change, changeText);
        editor.saveJsCode("源码");
        expect(change).not.toHaveBeenCalled();
        editor.showJsCodeEditorDialog("formatter");
        expect(() => editor.saveJsCode("源码")).toThrow("保存失败");
        expect(editor.isShowJsCodeEditorDialog.value).toBe(true);
    });
});

describe("属性名校验器", () => {
    it.each(["", "1name", "a-b", "中文", "a b"])("拒绝非法名称 %j 并且不写回", value => {
        const change = vi.fn();
        context.injections.set("changeFormSettingData", change);
        const callback = vi.fn();
        usePropNameValidator(changeText)({}, value, callback);
        expect(callback).toHaveBeenCalledExactlyOnceWith(expect.any(Error));
        expect(change).not.toHaveBeenCalled();
    });
    it("拒绝其他顶层字段重名，允许当前字段自身和合法标识符", () => {
        const form = createForm();
        const current = createText();
        current.propName = "current";
        const other = createText();
        other.propName = "other";
        form.widgets.push(current, other);
        context.injections.set("widgetFormData", form);
        context.injections.set("selectedWigetId", ref(current.id));
        const change = vi.fn();
        context.injections.set("changeFormSettingData", change);
        const validator = usePropNameValidator(changeText);
        const rejected = vi.fn();
        validator({}, "other", rejected);
        expect(rejected.mock.calls[0][0].message).toBe("属性名已存在");
        expect(change).not.toHaveBeenCalled();
        for (const value of ["current", "_name2", "$field"]) {
            const callback = vi.fn();
            validator({}, value, callback);
            expect(callback).toHaveBeenCalledExactlyOnceWith();
            expect(change).toHaveBeenLastCalledWith(changeText, "propName", value);
        }
    });
    it("无注入上下文时仍执行格式校验而不会尝试写回", () => {
        const callback = vi.fn();
        usePropNameValidator(changeText)({}, "valid", callback);
        expect(callback).toHaveBeenCalledExactlyOnceWith();
    });
});

describe("渲染字段数据", () => {
    it.each(["", null, false, 0])("嵌套字段首次初始化，增删排序保持用户输入 %j 及对象身份", async value => {
        const scope = effectScope();
        try {
            const form = reactive(createForm()) as import("@/views/types").WidgetFormData;
            const row = reactive(createRow()) as import("@/views/types").WidgetRowContainerData;
            const field = createText();
            field.defaultValue = "初始";
            row.widgets.push(field);
            form.widgets.push(row);
            const values = scope.run(() => useFormRenderData(form))!;
            expect(values[field.id]).toBe("初始");
            values[field.id] = value;
            row.widgets[0].defaultValue = "新的默认值";
            const extra = createText();
            form.widgets.push(extra);
            await nextTick();
            expect(values[field.id]).toBe(value);
            form.widgets.reverse();
            await nextTick();
            expect(values[field.id]).toBe(value);
            form.widgets.splice(
                form.widgets.findIndex(item => item.id === extra.id),
                1
            );
            form.widgets.length = 0;
            await nextTick();
            expect(Object.keys(values)).toEqual([]);
            expect(scope.run(() => values)).toBe(values);
        } finally {
            scope.stop();
        }
    });
});

describe("拖拽状态与操作目标", () => {
    it("拖拽状态独立、对外只读且停止可重复执行", () => {
        const first = useSortableDragState();
        const second = useSortableDragState();
        expect(isReadonly(first.isDragging)).toBe(true);
        first.startDragging();
        first.startDragging();
        expect(first.isDragging.value).toBe(true);
        expect(second.isDragging.value).toBe(false);
        first.stopDragging();
        first.stopDragging();
        expect(first.isDragging.value).toBe(false);
    });
    it("优先悬停、再焦点、再选中，父节点离开不误清除子节点", () => {
        const selected = ref<string | null>("selected");
        const target = useWidgetOperationTarget(selected);
        expect(target.activeOperationWidgetId.value).toBe("selected");
        target.setFocusedWidgetId("focus");
        target.setHoveredWidgetId("child");
        target.clearHoveredWidgetId("parent");
        expect(target.activeOperationWidgetId.value).toBe("child");
        target.clearHoveredWidgetId("child");
        expect(target.activeOperationWidgetId.value).toBe("focus");
        target.setFocusedWidgetId(null);
        selected.value = "next";
        expect(target.activeOperationWidgetId.value).toBe("next");
        expect(useWidgetOperationTarget().activeOperationWidgetId.value).toBeNull();
    });
});

describe("工作区尺寸生命周期", () => {
    it("SSR 使用最小宽度，浏览器注册监听并按窗口更新，卸载释放同一回调", () => {
        expect(useDesignerWorkspaceLayout().centerPanelSize.value).toBe(calculateWorkspacePanelSizes(WORKSPACE_MIN_WIDTH).center);
        context.mounted.length = 0;
        context.unmounted.length = 0;
        const browser = { innerWidth: 1500, addEventListener: vi.fn(), removeEventListener: vi.fn() };
        vi.stubGlobal("window", browser);
        const layout = useDesignerWorkspaceLayout();
        context.mounted[0]();
        const listener = browser.addEventListener.mock.calls[0][1];
        browser.innerWidth = 1900;
        listener();
        expect(layout.leftPanelSize.value).toBe(calculateWorkspacePanelSizes(1900).left);
        layout.handleWorkspaceResizeEnd(0, [350, 900, 380]);
        browser.innerWidth = 1600;
        listener();
        const expected = normalizeWorkspacePanelSizes(1600, 350, 380);
        expect([layout.leftPanelSize.value, layout.centerPanelSize.value, layout.rightPanelSize.value]).toEqual([expected.left, expected.center, expected.right]);
        layout.handleWorkspaceResizeEnd(1, []);
        expect(layout.leftPanelSize.value).toBe(expected.left);
        browser.innerWidth = 400;
        listener();
        expect(layout.leftPanelSize.value + layout.centerPanelSize.value + layout.rightPanelSize.value).toBe(WORKSPACE_MIN_WIDTH);
        context.unmounted[0]();
        expect(browser.removeEventListener).toHaveBeenCalledExactlyOnceWith("resize", listener);
    });
});
