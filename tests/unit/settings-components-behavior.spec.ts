// @vitest-environment happy-dom
/**
 * @fileoverview 挂载真实设置面板并驱动第三方控件更新，验证统一适配入口与本地草稿行为。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick, reactive, ref, type Component } from "vue";
import { mountComponent, findNodes, textContent, type HostNode } from "../helpers/component-host";
import { useCreateDefaultData as createForm, useSettingDataValueChange as changeForm } from "@/views/domain/form/form-adapter";
import { getAlertRenderKey } from "@/views/composables/use-alert-render-state";
import { type WidgetFormData } from "@/views/types";

const boundary = vi.hoisted(() => ({ sortable: [] as any[], confirm: vi.fn(), editor: null as any }));
vi.mock("sortablejs", () => ({
    default: class {
        destroy = vi.fn();
        constructor(element: any, options: any) {
            boundary.sortable.push({ element, options, destroy: this.destroy });
        }
    }
}));
vi.mock("element-plus", async importOriginal => ({ ...(await importOriginal<typeof import("element-plus")>()), ElMessageBox: { confirm: boundary.confirm } }));
// 只替代浏览器HTML解析器；项目白名单检查和面板草稿规则仍实际执行。
vi.mock("dompurify", () => {
    const purifier = {
        removed: [] as any[],
        sanitize: (html: string) => {
            purifier.removed = html.includes("<script") ? [{ element: { nodeName: "SCRIPT" } }] : [];
            return purifier.removed.length ? "" : html;
        }
    };
    return { default: purifier };
});
vi.mock("monaco-editor", () => ({
    editor: {
        create: vi.fn((_element: any, options: any) => {
            let code = options.value;
            const model = {
                getValue: () => code,
                setValue: vi.fn((value: string) => {
                    code = value;
                })
            };
            boundary.editor = {
                getValue: () => code,
                getModel: () => model,
                onDidChangeModelContent: (callback: any) => {
                    boundary.editor.change = callback;
                },
                setPosition: vi.fn(),
                focus: vi.fn(),
                dispose: vi.fn(),
                setCode: (value: string) => {
                    code = value;
                }
            };
            return boundary.editor;
        })
    }
}));

// 每个真实面板独立挂载，第三方控件外壳只传递值和事件。
const panels = import.meta.glob("../../src/views/components/settings/**/*.vue", { eager: true, import: "default" }) as Record<string, Component>;
const adapters = import.meta.glob("../../src/views/domain/widgets/adapters/*.ts", { eager: true }) as Record<string, any>;
const ordinary = [
    "text",
    "input-number",
    "radio-group",
    "checkbox-group",
    "select",
    "cascader",
    "date-picker",
    "time-picker",
    "time-select",
    "switch",
    "rate",
    "color-picker",
    "slider",
    "upload",
    "html",
    "alert",
    "divider"
];
const active: Array<ReturnType<typeof mountComponent>> = [];

/**
 * @description 按名称寻找唯一设置组件。
 * @param name 不含后缀的组件名称。
 * @returns 对应真实 Vue 组件。
 */
const panel = (name: string): Component => Object.entries(panels).find(([file]) => file.endsWith(`/${name}.vue`))![1];

/**
 * @description 创建真实组件设置态及适配器写入入口。
 * @param code 注册组件类型。
 * @returns 节点、挂载结果和写入记录。
 */
const setup = (code: string) => {
    const adapter = Object.entries(adapters).find(([file]) => file.endsWith(`/${code}.ts`))![1];
    const widget = reactive(adapter.useCreateDefaultData());
    const update = vi.fn((handler: any, field: string, value: any) => handler(widget, field, value));
    const mounted = mountComponent(
        panel(code),
        { settingData: widget.settingData, widgetData: widget },
        { changeSelectedWidgetSettingData: update, widgetFormData: { widgets: [widget] }, selectedWigetId: ref(widget.id), changeFormSettingData: update }
    );
    active.push(mounted);
    return { widget, mounted, update };
};

/**
 * @description 获取指定表单项中的真实控件外壳。
 * @param root 挂载根节点。
 * @param label 表单项名称。
 * @param tag 控件类型。
 * @returns 唯一匹配控件。
 */
const input = (root: HostNode, label: string, tag: string): HostNode => {
    const item = findNodes(root, node => node.tag === "el-form-item" && (node.props.label === label || (label === "控制属性" && node.props.prop === "control")))[0];
    if (!item) throw new Error(`表单项不存在：${label}`);
    const control = findNodes(item, node => node.tag === tag)[0];
    if (!control) throw new Error(`控件不存在：${label}/${tag}`);
    return control;
};

beforeEach(() => {
    boundary.sortable.length = 0;
    boundary.confirm.mockReset();
    boundary.editor = null;
});
afterEach(() => {
    active.splice(0).forEach(instance => instance.unmount());
});

describe("设置面板真实事件", () => {
    it.each(ordinary)("%s 隐藏控件通过适配器同步设计状态，取消后恢复", async code => {
        const { widget, mounted, update } = setup(code);
        input(mounted.root, code === "cascader" ? "组件状态" : "控制属性", "el-checkbox-group").props.update(["isHidden"]);
        await nextTick();
        expect(widget.isShow).toBe(false);
        expect(widget.settingData.control).toEqual(["isHidden"]);
        expect(update).toHaveBeenCalledWith(expect.any(Function), "control", ["isHidden"]);
        input(mounted.root, code === "cascader" ? "组件状态" : "控制属性", "el-checkbox-group").props.update([]);
        await nextTick();
        expect(widget.isShow).toBe(true);
    });

    it.each(ordinary.filter(code => !["html", "alert", "divider"].includes(code)))("%s 标签文案和位置同步到设置态及表单项", async code => {
        const { widget, mounted } = setup(code);
        input(mounted.root, "标签文案", "el-input").props.update("新标签");
        input(mounted.root, "标签位置", "el-radio-group").props.update("right");
        await nextTick();
        expect(widget.settingData.label).toBe("新标签");
        expect(widget.formAttributes.label).toBe("新标签");
        expect(widget.settingData.labelPosition).toBe("right");
        expect(widget.formAttributes.labelPosition).toBe("right");
    });

    it("文本字数统计先确认并设置100，再开启；取消确认保留原值", async () => {
        const { widget, mounted } = setup("text");
        const item = findNodes(mounted.root, node => node.tag === "el-form-item" && node.props.prop === "showWordLimit")[0];
        const toggle = findNodes(item, node => node.tag === "el-checkbox" || node.tag === "el-switch")[0];
        boundary.confirm.mockRejectedValueOnce("cancel");
        toggle.props.update(true);
        await nextTick();
        await nextTick();
        expect(widget.settingData.maxlength).toBeNull();
        expect(widget.settingData.showWordLimit).toBeNull();
        boundary.confirm.mockResolvedValueOnce("confirm");
        toggle.props.update(true);
        await nextTick();
        await nextTick();
        expect(widget.settingData.maxlength).toBe(100);
        expect(widget.componentAttributes.showWordLimit).toBe(true);
        toggle.props.update(false);
        await nextTick();
        expect(widget.componentAttributes.showWordLimit).toBe(false);
    });

    it("级联JSON非法草稿不覆盖选项，合法换行JSON同时写树和文本", async () => {
        const { widget, mounted } = setup("cascader");
        const original = widget.settingData.options;
        const area = findNodes(mounted.root, node => node.tag === "el-input" && node.props.type === "textarea")[0];
        area.props.update("[");
        await nextTick();
        expect(widget.settingData.options).toBe(original);
        expect(findNodes(mounted.root, node => node.tag === "el-form-item" && !!node.props.error).length).toBe(1);
        const text = '[\n {"label":"分类","value":"category"}\n]';
        area.props.update(text);
        await nextTick();
        expect(widget.settingData.options).toEqual([{ label: "分类", value: "category" }]);
        expect(widget.settingData.optionsText).toBe(text);
        expect(widget.componentAttributes.options).toEqual(widget.settingData.options);
    });

    it("HTML错误只保留草稿并显示错误，安全内容才提交到画布数据", async () => {
        const { widget, mounted } = setup("html");
        const original = widget.defaultValue;
        const area = input(mounted.root, "HTML", "el-input");
        area.props.update("<script>alert(1)</script>");
        await nextTick();
        expect(widget.defaultValue).toBe(original);
        expect(input(mounted.root, "HTML", "el-input").props.modelValue).toContain("<script>");
        expect(findNodes(mounted.root, node => node.props.error === "HTML 内容包含高危代码：script")).toHaveLength(1);
        area.props.update("<b>可展示内容</b>");
        await nextTick();
        expect(widget.defaultValue).toBe("<b>可展示内容</b>");
    });

    it("提示信息显示按钮清隐藏并重挂载，标题和主题保持", async () => {
        const { widget, mounted } = setup("alert");
        input(mounted.root, "标题", "el-input").props.update("配置后的提示");
        input(mounted.root, "控制属性", "el-checkbox-group").props.update(["isHidden"]);
        const button = findNodes(mounted.root, node => node.tag === "el-button" && textContent(node) === "显示提示信息")[0];
        button.props.onClick();
        await nextTick();
        expect(widget.isShow).toBe(true);
        expect(widget.settingData.control).toEqual([]);
        expect(widget.componentAttributes.title).toBe("配置后的提示");
        expect(getAlertRenderKey(widget)).toBe(1);
    });

    it("表单设置同步根属性，编辑onInit源码不会执行脚本", async () => {
        const form = reactive(createForm()) as WidgetFormData;
        const mounted = mountComponent(panel("form"), {}, { widgetFormData: form, changeFormSettingData: (field: any, value: any) => changeForm(form, field, value) });
        active.push(mounted);
        const position = findNodes(mounted.root, node => node.tag === "el-radio-group")[0];
        position.props.update("top");
        await nextTick();
        expect(form.settingData.labelPosition).toBe("top");
        expect(form.formAttributes.labelPosition).toBe("top");
        findNodes(mounted.root, node => node.tag === "el-button" && textContent(node) === "编写代码")[0].props.onClick();
        await nextTick();
        await nextTick();
        boundary.editor.setCode("function onInit(widgetFormData, formData) {\nformData.test = 'edited';\n}");
        findNodes(mounted.root, node => node.tag === "el-button" && textContent(node) === "应用")[0].props.onClick();
        await nextTick();
        expect(form.componentFunctions.init).toContain("formData.test = 'edited'");
    });
});

describe("共享设置组件", () => {
    it("选项编辑器多选模式确实挂载两个选项和表头复选框", () => {
        const mounted = mountComponent(panel("option-config"), {
            options: [
                { label: "甲", value: "a" },
                { label: "乙", value: "b" }
            ],
            defaultValue: ["a"],
            multiple: true
        });
        active.push(mounted);
        const checkboxes = findNodes(mounted.root, node => node.tag === "el-checkbox");
        expect(checkboxes).toHaveLength(3);
        expect(textContent(mounted.root)).toContain("选项");
        expect(checkboxes.every(node => typeof node.props.update === "function")).toBe(true);
    });
    it.fails("已知缺陷：多选默认值应在选项编辑器首次打开时回显勾选", () => {
        const mounted = mountComponent(panel("option-config"), {
            options: [
                { label: "甲", value: "a" },
                { label: "乙", value: "b" }
            ],
            defaultValue: ["a"],
            multiple: true
        });
        active.push(mounted);
        const checkboxes = findNodes(mounted.root, node => node.tag === "el-checkbox");
        expect(checkboxes[1].props.modelValue).toBe(true);
    });

    it.fails("已知缺陷：部分选中时全选复选框应显示中间态", () => {
        const mounted = mountComponent(panel("option-config"), {
            options: [
                { label: "甲", value: "a" },
                { label: "乙", value: "b" }
            ],
            defaultValue: ["a"],
            multiple: true
        });
        active.push(mounted);
        const header = findNodes(mounted.root, node => node.tag === "el-checkbox")[0];
        expect(header.props.indeterminate).toBe(true);
    });
    it("行容器面板清空间距为0，关闭手动栅格恢复平均宽度", async () => {
        const { widget, mounted } = setup("row-container");
        const text = Object.entries(adapters).find(([file]) => file.endsWith("/text.ts"))![1];
        widget.widgets.push(text.useCreateDefaultData(), text.useCreateDefaultData());
        widget.settingData.enableSpanConfig = true;
        widget.settingData.spans = [6, 18];
        await nextTick();
        input(mounted.root, "栅格间隔", "el-input-number").props.update(null);
        expect(widget.settingData.gutter).toBe(0);
        input(mounted.root, "容器名称", "el-input").props.update("布局行");
        expect(widget.name).toBe("布局行");
        input(mounted.root, "手动栅格", "el-switch").props.update(false);
        await nextTick();
        expect(widget.settingData.enableSpanConfig).toBe(false);
        expect(widget.settingData.spans).toEqual([12, 12]);
        input(mounted.root, "手动栅格", "el-switch").props.update(true);
        await nextTick();
        findNodes(mounted.root, node => node.tag === "el-form-item" && node.props.prop === "spans.0")[0]
            .children.find(node => node.tag === "el-input-number")!
            .props.update(30);
        expect(widget.settingData.spans).toEqual([24, 12]);
    });
    it("选项新增、删除和排序投影持久化字段，卸载释放Sortable", async () => {
        const emitted: any[] = [];
        const mounted = mountComponent(panel("option-config"), {
            options: [
                { label: "甲", value: "a" },
                { label: "乙", value: "b" }
            ],
            onUpdateOptions: (value: any) => emitted.push(value)
        });
        active.push(mounted);
        findNodes(mounted.root, node => node.tag === "el-button" && textContent(node) === "添加选项")[0].props.onClick();
        await nextTick();
        expect(emitted[emitted.length - 1]).toEqual([
            { label: "甲", value: "a", disabled: undefined },
            { label: "乙", value: "b", disabled: undefined },
            { label: "选项3", value: "3", disabled: false }
        ]);
        boundary.sortable[0].options.onEnd({ oldIndex: 0, newIndex: 2 });
        await nextTick();
        expect(emitted[emitted.length - 1].map((item: any) => item.value)).toEqual(["b", "3", "a"]);
        const remove = findNodes(mounted.root, node => node.tag === "el-icon" && node.props.class === "delete-icon")[0];
        remove.props.onClick();
        await nextTick();
        expect(emitted[emitted.length - 1].map((item: any) => item.value)).toEqual(["3", "a"]);
        expect(emitted[emitted.length - 1].every((item: any) => !("checked" in item))).toBe(true);
        mounted.unmount();
        expect(boundary.sortable[0].destroy).toHaveBeenCalledOnce();
    });

    it("单选默认值只提交一项，多选全选提交按当前顺序的数组", async () => {
        const single: any[] = [];
        const first = mountComponent(panel("option-config"), {
            options: [
                { label: "甲", value: "a" },
                { label: "乙", value: "b" }
            ],
            onUpdateDefaultValue: (value: any) => single.push(value)
        });
        active.push(first);
        findNodes(first.root, node => node.tag === "el-checkbox")[1].props.update(true);
        await nextTick();
        expect(single).toEqual(["b"]);
        const values: any[] = [];
        const second = mountComponent(panel("option-config"), {
            options: [
                { label: "甲", value: "a" },
                { label: "乙", value: "b" }
            ],
            multiple: true,
            onUpdateDefaultValue: (value: any) => values.push(value)
        });
        active.push(second);
        findNodes(second.root, node => node.tag === "el-checkbox")[0].props.update(true);
        await nextTick();
        expect(values).toEqual([["a", "b"]]);
    });

    it("脚本弹窗保护首尾行，提交最近合法全文并释放编辑器", async () => {
        const initial = "function change(value) {\n    return value;\n}";
        const saved: string[] = [];
        const mounted = mountComponent(panel("js-code-editor-dialog"), { value: initial, onSave: (value: string) => saved.push(value) });
        active.push(mounted);
        await nextTick();
        const editor = boundary.editor;
        editor.setCode("bad\n    return value;\n}");
        editor.change({ changes: [{ range: { startLineNumber: 1, endLineNumber: 1 } }] });
        expect(editor.getValue()).toBe(initial);
        const accepted = "function change(value) {\n    return value * 2;\n}";
        editor.setCode(accepted);
        editor.change({ changes: [{ range: { startLineNumber: 2, endLineNumber: 2 } }] });
        findNodes(mounted.root, node => node.tag === "el-button" && textContent(node) === "应用")[0].props.onClick();
        await nextTick();
        expect(saved).toEqual([accepted]);
        mounted.unmount();
        expect(editor.dispose).toHaveBeenCalledOnce();
    });
});
