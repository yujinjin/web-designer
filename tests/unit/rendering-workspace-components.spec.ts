// @vitest-environment happy-dom
/* eslint vue/one-component-per-file: "off" -- 用两个测试专用组件验证真实父子错误边界。 */
/**
 * @fileoverview 运行真实组件渲染器、画布、预览与工作区，验证事件路由、隔离和生命周期。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp, defineComponent, h, nextTick, reactive, ref } from "vue";
import ElementPlus from "element-plus";
import { mountComponent, findNodes, textContent } from "../helpers/component-host";
import widgetRenderer from "@/views/components/rendering/widget-renderer.vue";
import centerPanel from "@/views/components/canvas/center-render-panel.vue";
import rowRenderer from "@/views/components/canvas/row-container-renderer.vue";
import leftPanel from "@/views/components/workspace/left-widget-panel.vue";
import rightPanel from "@/views/components/workspace/right-setting-panel.vue";
import previewRenderer from "@/views/components/preview/designer-form-preview-renderer.vue";
import previewRow from "@/views/components/preview/designer-form-preview-row.vue";
import previewDialog from "@/views/components/preview/designer-form-preview-dialog.vue";
import boundaryComponent from "@/views/components/preview/designer-form-preview-error-boundary.vue";
import designerApp from "@/views/app.vue";
import { WIDGET_DEFINITIONS, createWidgetDefaultData } from "@/views/domain/widgets/registry";
import { useCreateDefaultData as createForm } from "@/views/domain/form/form-adapter";
import { useCreateDefaultData as createRow } from "@/views/domain/widgets/adapters/row-container";
import { createDesignerFormPreviewSnapshot } from "@/views/domain/preview/preview-runtime";
import { showAlert } from "@/views/composables/use-alert-render-state";
import { type WidgetFormData } from "@/views/types";

const external = vi.hoisted(() => ({ sortables: [] as any[], confirm: vi.fn(), error: vi.fn(), success: vi.fn(), save: vi.fn(), get: vi.fn(), download: vi.fn() }));
vi.mock("sortablejs", () => ({
    default: class {
        destroy = vi.fn();
        constructor(element: any, options: any) {
            external.sortables.push({ element, options, destroy: this.destroy });
        }
    }
}));
vi.mock("monaco-editor", () => ({ editor: { create: vi.fn() } }));
// DOMPurify 的浏览器解析器属于外部边界；保留项目白名单检查与失败回退逻辑的真实执行。
vi.mock("dompurify", () => {
    const purifier = {
        removed: [] as any[],
        sanitize: (html: string) => {
            purifier.removed = html.includes("onerror") ? [{ attribute: { name: "onerror" } }] : [];
            return purifier.removed.length ? "" : html;
        }
    };
    return { default: purifier };
});
vi.mock("element-plus", async importOriginal => ({
    ...(await importOriginal<typeof import("element-plus")>()),
    ElMessage: { error: external.error, success: external.success },
    ElMessageBox: { confirm: external.confirm }
}));
vi.mock("@/stores/storage", () => ({ default: () => ({ getDesignerFormDraft: external.get, setDesignerFormDraft: external.save }) }));
vi.mock("@/views/utils/browser-json-file", async importOriginal => ({ ...(await importOriginal<typeof import("@/views/utils/browser-json-file")>()), downloadJsonText: external.download }));

const mounted: Array<ReturnType<typeof mountComponent>> = [];
/**
 * @description 等待异步初始化和异步设置组件完成实际渲染。
 * @returns 无返回值。
 */
const settle = async (): Promise<void> => {
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 0));
    await nextTick();
};
/**
 * @description 挂载并登记清理对象。
 * @param args 被测组件、输入、注入值及控件覆盖。
 * @returns 可查询的真实组件宿主。
 */
const mount = (...args: Parameters<typeof mountComponent>) => {
    const instance = mountComponent(...args);
    mounted.push(instance);
    return instance;
};
beforeEach(() => {
    external.sortables.length = 0;
    external.confirm.mockReset().mockResolvedValue("confirm");
    external.error.mockClear();
    external.success.mockClear();
    external.save.mockClear();
    external.get.mockReset().mockReturnValue(null);
    external.download.mockClear();
});
afterEach(() => {
    mounted.splice(0).forEach(instance => instance.unmount());
    vi.restoreAllMocks();
});

describe("共享渲染分发", () => {
    it("HTML分支只使用白名单检查结果，危险内容不回退原始HTML", async () => {
        const widget = reactive(createWidgetDefaultData("html")) as any;
        widget.settingData.defaultValue = "<b>安全内容</b>";
        const instance = mount(widgetRenderer, { widgetData: widget, formData: {}, widgetFormData: createForm(), modelValue: null });
        expect(findNodes(instance.root, node => node.props.class === "html-contents")[0].props.innerHTML).toBe("<b>安全内容</b>");
        widget.settingData.defaultValue = '<img src="x" onerror="alert(1)">';
        await nextTick();
        expect(findNodes(instance.root, node => node.props.class === "html-contents")[0].props.innerHTML).toBe("");
    });

    it("真实ElAlert关闭后显示操作重挂载并连续恢复", async () => {
        const widget = reactive(createWidgetDefaultData("alert")) as any;
        const container = document.createElement("div");
        document.body.appendChild(container);
        const app = createApp(widgetRenderer, { widgetData: widget, formData: {}, widgetFormData: createForm(), modelValue: null });
        app.use(ElementPlus);
        app.mount(container);
        try {
            const visible = () => {
                const alert = container.querySelector(".el-alert") as HTMLElement | null;
                expect(alert).not.toBeNull();
                return alert!.style.display !== "none";
            };
            expect(visible()).toBe(true);
            for (let attempt = 0; attempt < 2; attempt++) {
                (container.querySelector(".el-alert__close-btn") as HTMLElement).click();
                // 每次必须等关闭完成再触发重挂载，两个循环之间不能并行。
                // eslint-disable-next-line no-await-in-loop
                await vi.waitFor(() => expect(visible()).toBe(false));
                showAlert(widget);
                // eslint-disable-next-line no-await-in-loop
                await nextTick();
                expect(visible()).toBe(true);
                expect(container.textContent).toContain("提示信息");
            }
        } finally {
            app.unmount();
            container.remove();
        }
    });
    it.each(WIDGET_DEFINITIONS.filter(definition => definition.meta.code !== "row-container").map(definition => definition.meta.code))("%s 根据注册类型使用真实分发分支", code => {
        const widget = createWidgetDefaultData(code) as any;
        const form = createForm();
        form.widgets.push(widget);
        const instance = mount(widgetRenderer, { widgetData: widget, formData: {}, widgetFormData: form, modelValue: widget.defaultValue });
        const targets: Record<string, string> = {
            "text": "el-input",
            "input-number": "el-input-number",
            "radio-group": "el-radio-group",
            "checkbox-group": "el-checkbox-group",
            "select": "el-select",
            "cascader": "el-cascader",
            "date-picker": "el-date-picker",
            "time-picker": "el-time-picker",
            "time-select": "el-time-select",
            "switch": "el-switch",
            "rate": "el-rate",
            "color-picker": "el-color-picker",
            "slider": "el-slider",
            "upload": "el-upload",
            "alert": "el-alert",
            "divider": "el-divider",
            "html": "div"
        };
        const rendered = findNodes(instance.root, node => node.tag === targets[code]);
        expect(rendered.length).toBeGreaterThan(0);
        if (!["html", "alert", "divider"].includes(code)) expect(findNodes(instance.root, node => node.tag === "el-form-item")[0].props.label).toBe(widget.formAttributes.label);
    });

    it("数组控件的模型更新原样发回父级，运行change脚本接收实时上下文", () => {
        const widget = createWidgetDefaultData("checkbox-group") as any;
        widget.componentFunctions.change = "formData.changed = value.join(','); widgetFormData.settingData.labelWidth = 144;";
        const form = createForm();
        const data: Record<string, any> = {};
        const updates: any[] = [];
        const instance = mount(widgetRenderer, { "widgetData": widget, "formData": data, "widgetFormData": form, "modelValue": [], "onUpdate:modelValue": (value: any) => updates.push(value) });
        findNodes(instance.root, node => node.tag === "el-checkbox-group")[0].props.update(["1", "2"]);
        expect(updates).toEqual([["1", "2"]]);
        expect(data.changed).toBe("1,2");
        expect(form.settingData.labelWidth).toBe(144);
    });

    it("上传通过file-list更新，普通卡片/卡片拖拽/普通拖拽展示不同提示", async () => {
        const widget = reactive(createWidgetDefaultData("upload")) as any;
        const updates: any[] = [];
        const instance = mount(widgetRenderer, { "widgetData": widget, "formData": {}, "widgetFormData": createForm(), "modelValue": [], "onUpdate:modelValue": (value: any) => updates.push(value) });
        const files = [{ name: "完整文件名.pdf", uid: 1 }];
        findNodes(instance.root, node => node.tag === "el-upload")[0].props.updateFiles(files);
        expect(updates).toEqual([files]);
        widget.componentAttributes.listType = "picture-card";
        await nextTick();
        expect(findNodes(instance.root, node => node.props["aria-label"] === "添加图片")).toHaveLength(1);
        widget.componentAttributes.drag = true;
        await nextTick();
        expect(textContent(instance.root)).toContain("拖拽或点击添加");
        widget.componentAttributes.listType = "text";
        await nextTick();
        expect(textContent(instance.root)).toMatch(/将文件拖到此处，或\s*点击上传/);
    });
});

describe("画布拖放和工作区", () => {
    it("顶层模板优先于组件类型，移除克隆并报告创建失败，无效排序不写模型", async () => {
        const form = reactive(createForm()) as WidgetFormData;
        const insert = vi.fn();
        const template = vi.fn(() => ({ ok: false, message: "模板不可用" }));
        const order = vi.fn();
        const instance = mount(
            centerPanel,
            {},
            {
                widgetFormData: form,
                selectedWigetId: ref(null),
                changeSelectedWidgetId: vi.fn(),
                insertWidgetDefaultData: insert,
                insertWidgetTemplate: template,
                updateWidgetOrder: order,
                copyWidgetData: vi.fn(),
                deleteWidget: vi.fn()
            }
        );
        const sortable = external.sortables[0];
        const remove = vi.fn();
        sortable.options.onAdd({ newIndex: 0, item: { getAttribute: (name: string) => (name === "data-template-id" ? "labels-left" : "text"), remove } });
        expect(remove).toHaveBeenCalledOnce();
        expect(template).toHaveBeenCalledWith("labels-left", 0);
        expect(insert).not.toHaveBeenCalled();
        expect(external.error).toHaveBeenCalledWith("模板不可用");
        const container = {};
        sortable.options.onEnd({ from: {}, to: container, oldIndex: 0, newIndex: 1 });
        expect(order).not.toHaveBeenCalled();
        sortable.options.onEnd({ from: container, to: container, oldIndex: 0, newIndex: 1 });
        expect(order).toHaveBeenCalledWith(0, 1);
        instance.unmount();
        expect(sortable.destroy).toHaveBeenCalledOnce();
        await nextTick();
    });

    it("画布导入选择发出文件事件并重置输入，工具栏命令发给父级", async () => {
        const imported = vi.fn();
        const saved = vi.fn();
        const instance = mount(
            centerPanel,
            { onImportJson: imported, onSaveLocalDraft: saved },
            {
                widgetFormData: createForm(),
                selectedWigetId: ref(null),
                changeSelectedWidgetId: vi.fn(),
                insertWidgetDefaultData: vi.fn(),
                insertWidgetTemplate: vi.fn(),
                updateWidgetOrder: vi.fn(),
                copyWidgetData: vi.fn(),
                deleteWidget: vi.fn()
            }
        );
        const file = new File(["{}"], "form.json", { type: "application/json" });
        const target = { files: [file], value: "form.json" };
        findNodes(instance.root, node => node.tag === "input" && node.props.type === "file")[0].props.onChange({ target });
        expect(imported).toHaveBeenCalledWith(file);
        expect(target.value).toBe("");
        findNodes(instance.root, node => node.tag === "el-button" && textContent(node) === "保存到本地")[0].props.onClick();
        await nextTick();
        expect(saved).toHaveBeenCalledOnce();
    });

    it("设计行容器拒绝嵌套和第7项，合法拖入带父ID，删除只定位子项", async () => {
        const row = reactive(createRow());
        const child = createWidgetDefaultData("text") as any;
        row.widgets.push(child);
        row.settingData.spans = [24];
        const insert = vi.fn();
        const remove = vi.fn();
        const instance = mount(
            rowRenderer,
            { widgetData: row, formData: {}, widgetFormData: createForm() },
            { selectedWigetId: ref(null), changeSelectedWidgetId: vi.fn(), insertWidgetDefaultData: insert, updateWidgetOrder: vi.fn(), deleteWidget: remove }
        );
        const sort = external.sortables[0].options;
        expect(sort.onMove({ dragged: { getAttribute: () => "row-container" } })).toBe(false);
        row.widgets.push(...Array.from({ length: 5 }, () => createWidgetDefaultData("text") as any));
        expect(sort.onMove({ dragged: { getAttribute: () => "text" } })).toBe(false);
        row.widgets.splice(1);
        const cloneRemove = vi.fn();
        sort.onAdd({ newIndex: 1, item: { getAttribute: () => "select", remove: cloneRemove } });
        expect(cloneRemove).toHaveBeenCalledOnce();
        expect(insert).toHaveBeenCalledWith("select", 1, row.id);
        const deleteButton = findNodes(instance.root, node => node.tag === "el-button" && node.props["aria-label"] === "删除组件")[0];
        expect(deleteButton).toBeDefined();
        deleteButton.props.onClick({ stopPropagation: vi.fn() });
        expect(remove).toHaveBeenCalledWith(child.id);
        instance.unmount();
        expect(external.sortables[0].destroy).toHaveBeenCalledOnce();
        await nextTick();
    });

    it("左栏提供34模板和独立拖拽来源，拖拽时禁用tooltip并卸载全部实例", async () => {
        const instance = mount(leftPanel);
        await nextTick();
        expect(findNodes(instance.root, node => typeof node.props["data-template-id"] === "string")).toHaveLength(34);
        const sources = external.sortables.slice();
        expect(sources.some(item => item.options.group.name === "template-library")).toBe(true);
        expect(sources.some(item => item.options.group.name === "widget-library")).toBe(true);
        sources[0].options.onStart();
        await nextTick();
        const tooltips = findNodes(instance.root, node => node.tag === "el-tooltip");
        expect(tooltips.length).toBeGreaterThan(0);
        expect(tooltips.every(node => node.props.disabled === true)).toBe(true);
        sources[0].options.onEnd();
        await nextTick();
        expect(findNodes(instance.root, node => node.tag === "el-tooltip").every(node => node.props.disabled === false)).toBe(true);
        instance.unmount();
        expect(sources.every(item => item.destroy.mock.calls.length === 1)).toBe(true);
    });

    it("右栏无选择提示，选中顶层和子项后加载相应设置面板", async () => {
        const form = reactive(createForm()) as WidgetFormData;
        const selected = ref<string | null>(null);
        const row = createRow();
        const child = createWidgetDefaultData("text") as any;
        row.widgets.push(child);
        form.widgets.push(row);
        const instance = mount(rightPanel, {}, { widgetFormData: form, selectedWigetId: selected, changeSelectedWidgetSettingData: vi.fn(), changeFormSettingData: vi.fn() });
        expect(findNodes(instance.root, node => node.tag === "el-empty" && node.props.description === "请选择组件")).toHaveLength(1);
        selected.value = child.id;
        await vi.waitFor(() => expect(findNodes(instance.root, node => node.props.class === "widgets-setting-text").length).toBeGreaterThan(0), { timeout: 2000, interval: 10 });
        selected.value = row.id;
        await vi.waitFor(() => expect(findNodes(instance.root, node => node.props.class === "widgets-setting-row-container").length).toBeGreaterThan(0), { timeout: 2000, interval: 10 });
    });
});

describe("真实预览组件", () => {
    it("初始化异步脚本完成后显示模型，隐藏节点可由脚本恢复", async () => {
        const form = createForm();
        const widget = createWidgetDefaultData("text") as any;
        widget.isShow = false;
        form.widgets.push(widget);
        form.componentFunctions.init = `await Promise.resolve(); formData[${JSON.stringify(widget.id)}]='初始化值'; widgetFormData.widgets[0].isShow=true;`;
        const instance = mount(previewRenderer, { widgetFormData: form });
        expect(textContent(instance.root)).toContain("正在初始化表单");
        await settle();
        expect(findNodes(instance.root, node => node.tag === "el-input")[0].props.modelValue).toBe("初始化值");
        expect(form.widgets[0].isShow).toBe(true);
    });
    it("初始化失败展示错误摘要，空表单初始化后展示空态", async () => {
        const bad = createForm();
        bad.componentFunctions.init = "throw new Error('初始化失败样例')";
        const first = mount(previewRenderer, { widgetFormData: bad });
        await settle();
        expect(textContent(first.root)).toContain("初始化失败样例");
        expect(findNodes(first.root, node => node.tag === "el-form")).toHaveLength(0);
        const second = mount(previewRenderer, { widgetFormData: createForm() });
        await settle();
        expect(findNodes(second.root, node => node.tag === "el-empty" && node.props.description === "暂无表单组件")).toHaveLength(1);
    });
    it("预览行容器span归一化，子字段值更新交回父级且保留隐藏列", () => {
        const row = createRow();
        const widget = createWidgetDefaultData("text") as any;
        widget.isShow = false;
        row.widgets.push(widget);
        row.settingData.spans = [40];
        const updates = vi.fn();
        const instance = mount(previewRow, { widgetData: row, formData: { [widget.id]: "初始" }, widgetFormData: createForm(), onFieldValueChange: updates });
        expect(findNodes(instance.root, node => node.tag === "el-col")[0].props.span).toBe(24);
        findNodes(instance.root, node => node.tag === "el-input")[0].props.update("修改");
        expect(updates).toHaveBeenCalledWith(widget.id, "修改");
    });
    it("错误边界吞掉子树异常并保留其他内容，不显示脚本异常详情", async () => {
        const spy = vi.spyOn(console, "error").mockImplementation(() => {});
        /** @description 产生真实子组件渲染异常供错误边界捕获。 @returns 不返回。 @throws {Error} 预设测试异常。 */
        const failRender = (): never => {
            throw new Error("secret-body");
        };
        const Broken = defineComponent({ render: () => failRender() });
        const Wrapper = defineComponent({ render: () => h("div", [h(boundaryComponent, { widgetId: "1", widgetCode: "text" }, () => h(Broken)), h("span", "其他内容")]) });
        const instance = mount(Wrapper);
        await nextTick();
        expect(textContent(instance.root)).toContain("组件预览失败（text）");
        expect(textContent(instance.root)).toContain("其他内容");
        expect(textContent(instance.root)).not.toContain("secret-body");
        spy.mockRestore();
    });
    it("预览弹窗关闭事件交回父级，无footer按钮，快照交互不回写设计", async () => {
        const form = createForm();
        const widget = createWidgetDefaultData("text") as any;
        widget.defaultValue = "默认";
        form.widgets.push(widget);
        const snapshot = createDesignerFormPreviewSnapshot(form);
        if (!snapshot.ok) throw new Error(snapshot.message);
        const changed = vi.fn();
        const closed = vi.fn();
        const instance = mount(previewDialog, { "modelValue": true, "widgetFormData": snapshot.data, "onUpdate:modelValue": changed, "onClosed": closed });
        await settle();
        findNodes(instance.root, node => node.tag === "el-input")[0].props.update("预览编辑");
        expect(form.widgets[0].defaultValue).toBe("默认");
        expect(findNodes(instance.root, node => node.tag === "el-button")).toHaveLength(0);
        findNodes(instance.root, node => node.tag === "el-dialog")[0].props.closeDialog();
        await nextTick();
        expect(changed).toHaveBeenCalledWith(false);
        expect(closed).toHaveBeenCalledOnce();
    });
});

describe("页面装配", () => {
    it("app真实组装工作区，拖入组件后保存读取同一树，预览关闭释放副本", async () => {
        const instance = mount(designerApp);
        await settle();
        const rootSortable = external.sortables.find(item => item.options.group.name === "designer-root");
        expect(rootSortable).toBeDefined();
        rootSortable.options.onAdd({ newIndex: 0, item: { getAttribute: (name: string) => (name === "data-widget-type" ? "text" : null), remove: vi.fn() } });
        await settle();
        findNodes(instance.root, node => node.tag === "el-button" && textContent(node) === "保存到本地")[0].props.onClick();
        expect(external.save).toHaveBeenCalledOnce();
        const document = external.save.mock.calls[0][0];
        expect(document.form.widgets).toHaveLength(1);
        expect(document.form.widgets[0].code).toBe("text");
        expect(document.form.widgets[0]).not.toHaveProperty("componentAttributes");
        findNodes(instance.root, node => node.tag === "el-button" && textContent(node) === "预览")[0].props.onClick();
        await settle();
        expect(findNodes(instance.root, node => node.tag === "el-dialog" && node.props.title === "表单预览")).toHaveLength(1);
        findNodes(instance.root, node => node.tag === "el-dialog" && node.props.title === "表单预览")[0].props.closeDialog();
        await nextTick();
        expect(findNodes(instance.root, node => node.tag === "el-dialog" && node.props.title === "表单预览")).toHaveLength(0);
    });
});
