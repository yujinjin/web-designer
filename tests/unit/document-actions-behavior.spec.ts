/**
 * @fileoverview 使用真实文档投影、校验和恢复验证保存、导出、导入及草稿确认的 UI 编排。
 * @remarks 仅替换消息、确认、存储与下载边界，确保失败或取消不会提交候选设计。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDesignerDocumentActions } from "@/views/composables/use-designer-document-actions";
import { useCreateDefaultData as createForm } from "@/views/domain/form/form-adapter";
import { useCreateDefaultData as createText, useSettingDataValueChange as changeText } from "@/views/domain/widgets/adapters/text";
import { createDesignerFormDocument } from "@/views/domain/document/document";
import { JSON_FILE_MAX_BYTES } from "@/views/utils/browser-json-file";

// 外部副作用在每个用例开始时重置，领域代码不使用结果替身。
const boundaries = vi.hoisted(() => ({
    success: vi.fn(),
    error: vi.fn(),
    confirm: vi.fn(),
    setDraft: vi.fn(),
    getDraft: vi.fn(),
    download: vi.fn(),
    mounted: [] as (() => void)[]
}));
vi.mock("element-plus", () => ({ ElMessage: { success: boundaries.success, error: boundaries.error }, ElMessageBox: { confirm: boundaries.confirm } }));
vi.mock("@/stores/storage", () => ({ default: () => ({ setDesignerFormDraft: boundaries.setDraft, getDesignerFormDraft: boundaries.getDraft }) }));
vi.mock("vue", async importOriginal => ({ ...(await importOriginal<typeof import("vue")>()), onMounted: (callback: () => void) => boundaries.mounted.push(callback) }));
vi.mock("@/views/utils/browser-json-file", async importOriginal => ({ ...(await importOriginal<typeof import("@/views/utils/browser-json-file")>()), downloadJsonText: boundaries.download }));

beforeEach(() => {
    vi.resetAllMocks();
    boundaries.mounted.length = 0;
    boundaries.confirm.mockResolvedValue("confirm");
});
afterEach(() => vi.useRealTimers());

/**
 * @description 生成可恢复的真实文档及文件，用于模拟外部 JSON 输入。
 * @param dynamic 是否配置动态脚本；测试脚本不得在导入或恢复阶段执行。
 * @returns 可导入的 File 和持久化文档。
 */
function createCandidate(dynamic = false) {
    const form = createForm();
    const field = createText();
    if (dynamic) changeText(field, "formatter", "function formatter(value) {\n throw new Error('不可在恢复时执行');\n}");
    form.widgets.push(field);
    const result = createDesignerFormDocument(form, new Date("2026-10-13T01:02:03.000Z"));
    if (!result.ok) throw new Error(result.message);
    return { document: result.data, file: new File([JSON.stringify(result.data)], "form.json", { type: "application/json" }) };
}

describe("本地保存与文件导出", () => {
    it("保存最新状态，排除运行属性且不替换当前设计", () => {
        const form = createForm();
        const field = createText();
        form.widgets.push(field);
        const replace = vi.fn();
        const actions = useDesignerDocumentActions(form, replace);
        field.formAttributes.label = "刚刚修改";
        actions.handleSaveLocalDraft();
        const saved = boundaries.setDraft.mock.calls[0][0];
        expect(saved.form.widgets[0].formAttributes.label).toBe("刚刚修改");
        expect(saved.form.widgets[0]).not.toHaveProperty("componentAttributes");
        expect(field.componentAttributes).toBeDefined();
        expect(replace).not.toHaveBeenCalled();
        expect(boundaries.success).toHaveBeenCalledWith("当前设计已保存到本地");
    });
    it("JSON 转换失败及存储失败都不给成功提示", () => {
        const form = createForm();
        const actions = useDesignerDocumentActions(form, vi.fn());
        const cycle = createText();
        Object.assign(cycle.settingData, { circular: cycle });
        form.widgets.push(cycle);
        actions.handleSaveLocalDraft();
        actions.handleExportJson();
        expect(boundaries.setDraft).not.toHaveBeenCalled();
        expect(boundaries.download).not.toHaveBeenCalled();
        expect(boundaries.error).toHaveBeenCalledWith("当前设计无法转换为 JSON 数据");
        form.widgets.length = 0;
        boundaries.setDraft.mockImplementation(() => {
            throw new Error("quota");
        });
        actions.handleSaveLocalDraft();
        expect(boundaries.error).toHaveBeenLastCalledWith("本地保存失败，请检查浏览器存储权限或空间");
        expect(boundaries.success).not.toHaveBeenCalled();
    });
    it("导出格式化 JSON、默认时间戳文件名及独立快照", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-10-13T01:02:03Z"));
        const form = createForm();
        form.widgets.push(createText());
        useDesignerDocumentActions(form, vi.fn()).handleExportJson();
        const [text, name] = boundaries.download.mock.calls[0];
        expect(name).toBe("web-designer-form-20261013-010203.json");
        expect(text).toContain('\n    "schemaVersion"');
        expect(JSON.parse(text).form.widgets[0]).not.toHaveProperty("componentAttributes");
        expect(boundaries.success).toHaveBeenCalledWith("JSON 导出成功");
    });
    it("UTF-8 导出超过限制不下载，下载权限错误转为错误提示", () => {
        const form = createForm();
        const field = createText();
        field.defaultValue = "汉".repeat(Math.ceil(JSON_FILE_MAX_BYTES / 3));
        form.widgets.push(field);
        const actions = useDesignerDocumentActions(form, vi.fn());
        actions.handleExportJson();
        expect(boundaries.download).not.toHaveBeenCalled();
        expect(boundaries.error).toHaveBeenLastCalledWith("导出失败：JSON 文件不能超过 2 MiB");
        field.defaultValue = null;
        boundaries.download.mockImplementation(() => {
            throw new Error("权限不足");
        });
        actions.handleExportJson();
        expect(boundaries.error).toHaveBeenLastCalledWith("JSON 导出失败，请检查浏览器下载权限");
        expect(boundaries.success).not.toHaveBeenCalled();
    });
});

describe("导入覆盖与风险确认", () => {
    it("普通导入等待确认后再恢复运行属性并提交，不写本地草稿", async () => {
        const replace = vi.fn();
        const candidate = createCandidate();
        let confirmImport!: (value: string) => void;
        boundaries.confirm.mockImplementation(
            () =>
                new Promise(resolve => {
                    confirmImport = resolve;
                })
        );
        const pending = useDesignerDocumentActions(createForm(), replace).handleImportJson(candidate.file);
        await vi.waitFor(() => expect(boundaries.confirm).toHaveBeenCalled());
        expect(replace).not.toHaveBeenCalled();
        confirmImport("confirm");
        await pending;
        expect(boundaries.confirm).toHaveBeenCalledWith("导入将覆盖当前设计，是否继续？", "导入 JSON", expect.objectContaining({ type: "info" }));
        expect(replace).toHaveBeenCalledTimes(1);
        expect(replace.mock.calls[0][0].widgets[0].componentAttributes).toBeDefined();
        expect(boundaries.setDraft).not.toHaveBeenCalled();
        expect(boundaries.success).toHaveBeenCalledWith("JSON 导入成功");
    });
    it("动态脚本必须风险确认，取消不应用也不执行源码", async () => {
        boundaries.confirm.mockRejectedValue("cancel");
        const replace = vi.fn();
        await useDesignerDocumentActions(createForm(), replace).handleImportJson(createCandidate(true).file);
        expect(boundaries.confirm).toHaveBeenCalledWith(expect.stringContaining("包含动态脚本或 HTML"), "导入 JSON", expect.objectContaining({ type: "warning" }));
        expect(replace).not.toHaveBeenCalled();
        expect(boundaries.error).not.toHaveBeenCalled();
        expect(boundaries.success).not.toHaveBeenCalled();
    });
    it.each(["{坏的JSON", "{}", '{"schemaVersion":99,"form":{}}'])("无效文本 %j 在确认前拒绝", async text => {
        const replace = vi.fn();
        await useDesignerDocumentActions(createForm(), replace).handleImportJson(new File([text], "invalid.json"));
        expect(boundaries.error).toHaveBeenCalledWith(expect.stringContaining("JSON 导入失败："));
        expect(boundaries.confirm).not.toHaveBeenCalled();
        expect(replace).not.toHaveBeenCalled();
    });
    it("空文件、超限文件和读取失败均不解析或提交", async () => {
        const replace = vi.fn();
        const actions = useDesignerDocumentActions(createForm(), replace);
        await actions.handleImportJson(new File([], "empty.json"));
        expect(boundaries.error).toHaveBeenLastCalledWith("JSON 文件不能为空");
        await actions.handleImportJson(new File(["x".repeat(JSON_FILE_MAX_BYTES + 1)], "large.json"));
        expect(boundaries.error).toHaveBeenLastCalledWith("JSON 文件不能超过 2 MiB");
        const file = createCandidate().file;
        vi.spyOn(file, "text").mockRejectedValue(new Error("read"));
        await actions.handleImportJson(file);
        expect(boundaries.error).toHaveBeenLastCalledWith("JSON 文件读取失败");
        expect(boundaries.confirm).not.toHaveBeenCalled();
        expect(replace).not.toHaveBeenCalled();
    });
});

describe("草稿恢复与挂载", () => {
    it.each([undefined, null])("没有草稿 %j 时保持当前设计", async stored => {
        boundaries.getDraft.mockReturnValue(stored);
        const replace = vi.fn();
        await useDesignerDocumentActions(createForm(), replace).restoreLastDesignerFormDraft();
        expect(boundaries.confirm).not.toHaveBeenCalled();
        expect(replace).not.toHaveBeenCalled();
        expect(boundaries.error).not.toHaveBeenCalled();
    });
    it("读取权限错误、非法草稿不会删除原存储或提交", async () => {
        const replace = vi.fn();
        const actions = useDesignerDocumentActions(createForm(), replace);
        boundaries.getDraft.mockImplementation(() => {
            throw new Error("permission");
        });
        await actions.restoreLastDesignerFormDraft();
        expect(boundaries.error).toHaveBeenLastCalledWith("上次保存的设计读取失败，请检查浏览器存储权限");
        boundaries.getDraft.mockReturnValue({ schemaVersion: 900 });
        await actions.restoreLastDesignerFormDraft();
        expect(boundaries.error).toHaveBeenLastCalledWith(expect.stringContaining("上次保存的设计读取失败："));
        expect(replace).not.toHaveBeenCalled();
        expect(boundaries.setDraft).not.toHaveBeenCalled();
    });
    it("取消不恢复，再次读取最新草稿并确认后恢复完整属性", async () => {
        boundaries.getDraft.mockReturnValue(createCandidate().document);
        boundaries.confirm.mockRejectedValueOnce("close");
        const replace = vi.fn();
        const actions = useDesignerDocumentActions(createForm(), replace);
        await actions.restoreLastDesignerFormDraft();
        expect(replace).not.toHaveBeenCalled();
        boundaries.getDraft.mockReturnValue(createCandidate(true).document);
        await actions.restoreLastDesignerFormDraft();
        expect(boundaries.getDraft).toHaveBeenCalledTimes(2);
        expect(boundaries.confirm).toHaveBeenLastCalledWith(expect.stringContaining("保存时间："), "恢复上次设计", expect.objectContaining({ confirmButtonText: "恢复" }));
        expect(replace.mock.calls[0][0].widgets[0].componentAttributes.formatter).toBeTypeOf("function");
        expect(boundaries.success).toHaveBeenCalledWith("已恢复上次保存的设计");
        expect(boundaries.setDraft).not.toHaveBeenCalled();
    });
    it("挂载之前不读取，挂载后自动检测并支持缺少保存时间的合法文档", async () => {
        const candidate = createCandidate().document;
        const withoutTime = { schemaVersion: candidate.schemaVersion, form: candidate.form };
        boundaries.getDraft.mockReturnValue(withoutTime);
        const replace = vi.fn();
        useDesignerDocumentActions(createForm(), replace);
        expect(boundaries.getDraft).not.toHaveBeenCalled();
        boundaries.mounted[0]();
        await vi.waitFor(() => expect(replace).toHaveBeenCalledTimes(1));
        expect(boundaries.confirm).toHaveBeenCalledWith("检测到上次保存的设计，是否恢复继续编辑？", "恢复上次设计", expect.any(Object));
    });
});
