/**
 * @fileoverview 验证设计器工具的非空值选择、脚本错误传播和浏览器资源释放。
 * @remarks 浏览器下载仅替换 DOM/URL 边界；Blob 编码、文件名和错误后的清理仍由真实工具执行。
 */
import { describe, expect, it } from "vitest";
import { type DOMPurify } from "dompurify";
import { buildDefinedAttributes } from "@/views/utils/widget-attributes";
import { createAsyncWidgetComponentFunction, createWidgetComponentFunction } from "@/views/utils/widget-scripts";
import { inspectHtmlSafety } from "@/views/utils/html-safety";
import { downloadJsonText, readJsonFileText, type JsonDownloadEnvironment } from "@/views/utils/browser-json-file";
import { normalizeWorkspacePanelSizes } from "@/views/utils/workspace-layout";
import { createDesignerRootTargetGroup, createTemplateLibrarySortableGroup, createWidgetLibraryTargetGroup, getRowContainerSortableGroupName } from "@/views/utils/drag-drop-config";

describe("非空属性选择", () => {
    it("保留false、零和空串，仅省略null与undefined，派生值优先", () => {
        const source = { disabled: false, count: 0, placeholder: "", absent: null, missing: undefined, privateValue: "不得透传" };
        const result = buildDefinedAttributes(source, ["disabled", "count", "placeholder", "absent", "missing"], { count: 4 });
        expect(result).toEqual({ disabled: false, count: 4, placeholder: "" });
        expect(source.count).toBe(0);
    });
});

describe("脚本包装的返回与失败边界", () => {
    it("未配置脚本不绑定函数，事件型包装执行副作用但丢弃返回值", () => {
        expect(createWidgetComponentFunction(null, [])).toBeUndefined();
        expect(createAsyncWidgetComponentFunction("", [])).toBeUndefined();
        const context = { count: 0 };
        const event = createWidgetComponentFunction<(value: number) => void>("context.count += value; return 99;", ["value", "context"], false, [context])!;
        expect(event(3)).toBeUndefined();
        expect(context.count).toBe(3);
    });

    it("同步包装在调用时暴露语法与运行错误", () => {
        const syntax = createWidgetComponentFunction("if (", [])!;
        expect(() => syntax()).toThrow(SyntaxError);
        const runtime = createWidgetComponentFunction("throw new Error('同步错误');", [])!;
        expect(() => runtime()).toThrow("同步错误");
    });

    it("异步包装将返回Promise与拒绝原样传递", async () => {
        const success = createAsyncWidgetComponentFunction("return Promise.resolve(value * 2);", ["value"])!;
        await expect(success(4)).resolves.toBe(8);
        const rejection = createAsyncWidgetComponentFunction("throw new Error('异步错误');", [])!;
        await expect(rejection()).rejects.toThrow("异步错误");
        const syntax = createAsyncWidgetComponentFunction("if (", [])!;
        await expect(syntax()).rejects.toThrow(SyntaxError);
    });
});

describe("浏览器文件边界", () => {
    it("正好达到字节上限仍可读取，超限不调用文件读取", async () => {
        const file = new File(['{"a":1}'], "表单.json", { type: "application/json" });
        expect(await readJsonFileText(file, 7)).toEqual({ ok: true, data: '{"a":1}' });
        const tooLarge = new File(["12345678"], "too-large.json");
        tooLarge.text = async () => {
            throw new Error("不得读取超限文件");
        };
        expect((await readJsonFileText(tooLarge, 7)).ok).toBe(false);
    });

    it("读取权限或IO失败转成失败结果，不泄漏未处理异常", async () => {
        const file = new File(["1234567"], "blocked.json");
        file.text = async () => {
            throw new Error("读取拒绝");
        };
        expect(await readJsonFileText(file, 100)).toEqual({ ok: false, message: "JSON 文件读取失败" });
    });

    it.each(["append", "click"])("下载%s阶段失败仍释放已分配的链接与URL", async failingStage => {
        // 最小环境记录浏览器可观察资源，供异常分支检查而非验证模拟函数调用次数。
        const state = { attached: false, releasedUrl: "", blob: new Blob(), clickedName: "" };
        const anchor = {
            href: "",
            download: "",
            style: { display: "" },
            click() {
                state.clickedName = this.download;
                if (failingStage === "click") throw new Error("点击失败");
            },
            remove() {
                state.attached = false;
            }
        };
        const environment: JsonDownloadEnvironment = {
            createAnchor: () => anchor as HTMLAnchorElement,
            appendAnchor: () => {
                state.attached = true;
                if (failingStage === "append") throw new Error("挂载失败");
            },
            createObjectURL: blob => {
                state.blob = blob;
                return "blob:allocated";
            },
            revokeObjectURL: url => {
                state.releasedUrl = url;
            }
        };
        expect(() => downloadJsonText('{"名称":"表单"}', "我的表单.json", environment)).toThrow();
        expect(state.attached).toBe(false);
        expect(state.releasedUrl).toBe("blob:allocated");
        expect(state.blob.type).toBe("application/json;charset=utf-8");
        expect(await state.blob.text()).toBe('{"名称":"表单"}');
        if (failingStage === "click") expect(state.clickedName).toBe("我的表单.json");
    });
});

describe("布局与拖拽边界", () => {
    it("超出面板偏好尺寸按可缩空间回收而不挤占画布", () => {
        const sizes = normalizeWorkspacePanelSizes(1216, 420, 560);
        expect(sizes.center).toBeCloseTo(600);
        expect(sizes.left).toBeCloseTo(266.7368421052632);
        expect(sizes.right).toBeCloseTo(349.2631578947368);
        expect(sizes.left + sizes.center + sizes.right).toBeCloseTo(1216);
    });

    it("模板仅进入根画布，行容器不接收模板且各实例分组独立", () => {
        const root = createDesignerRootTargetGroup();
        const row = createWidgetLibraryTargetGroup(getRowContainerSortableGroupName("row-a"));
        const template = createTemplateLibrarySortableGroup();
        expect(root.put).toContain(template.name);
        expect(row.put).not.toContain(template.name);
        expect(row.pull).toBe(false);
        expect(row.name).not.toBe(getRowContainerSortableGroupName("row-b"));
        (root.put as string[]).push("无效来源");
        expect(createDesignerRootTargetGroup().put).not.toContain("无效来源");
    });
});
describe("HTML解析器失败边界", () => {
    it("解析器异常返回失败而不泄露异常，删除的标签名称用于定位", () => {
        const broken = {
            removed: [],
            sanitize: () => {
                throw new Error("解析器不可用");
            }
        } as unknown as DOMPurify;
        expect(inspectHtmlSafety("<b>内容</b>", broken)).toEqual({ ok: false, message: "HTML 内容安全检查失败" });
        const removed = { removed: [{ element: { nodeName: "SVG" } }], sanitize: () => "" } as unknown as DOMPurify;
        expect(inspectHtmlSafety("<svg></svg>", removed)).toEqual({ ok: false, message: "HTML 内容包含高危代码：svg" });
    });
});
