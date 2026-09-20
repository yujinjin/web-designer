/**
 * @fileoverview 验证可交换表单文档、动态脚本门禁和 HTML 高危内容拒绝规则。
 */
import { describe, expect, it } from "vitest";
import { createDesignerFormDocument, parseDesignerFormDocumentText, restoreDesignerFormDocument } from "@/views/composables/designer-form-document";
import { useCreateDefaultData as createFormDefaultData } from "@/views/composables/widgets/form";
import { useCreateDefaultData as createTextDefaultData, useSettingDataValueChange as changeTextSetting } from "@/views/composables/widgets/text";
import { useCreateDefaultData as createHtmlDefaultData, useSettingDataValueChange as changeHtmlSetting } from "@/views/composables/widgets/html";
import { useCreateDefaultData as createRowDefaultData } from "@/views/composables/widgets/row-container";

describe("designer form document", () => {
    const inspectHtml = (html: string) => (html.includes("onerror") ? ({ ok: false, message: "HTML 内容包含高危代码：onerror" } as const) : ({ ok: true, data: html } as const));

    it("导出文档只包含版本和不含运行属性的表单", () => {
        const form = createFormDefaultData();
        form.widgets.push(createTextDefaultData());

        const result = createDesignerFormDocument(form, new Date("2026-09-18T08:00:00.000Z"));

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(Object.keys(result.data)).toEqual(["schemaVersion", "savedAt", "form"]);
        expect(result.data.savedAt).toBe("2026-09-18T08:00:00.000Z");
        expect(result.data.form.widgets[0]).not.toHaveProperty("componentAttributes");
        expect(form.widgets[0].componentAttributes).toBeDefined();
    });

    it("旧文档可恢复，存在但非法的保存时间会被拒绝", () => {
        const form = createFormDefaultData();
        const legacyDocument = { schemaVersion: 1, form };

        const restored = restoreDesignerFormDocument(legacyDocument);
        expect(restored.ok).toBe(true);
        if (restored.ok) expect(restored.data.savedAt).toBeUndefined();

        const invalid = restoreDesignerFormDocument({ ...legacyDocument, savedAt: "invalid" });
        expect(invalid.ok).toBe(false);
        if (!invalid.ok) expect(invalid.path).toBe("$.savedAt");
    });

    it("解析合法文档并恢复运行属性", () => {
        const form = createFormDefaultData();
        const widget = createTextDefaultData();
        form.widgets.push(widget);
        const created = createDesignerFormDocument(form);
        if (!created.ok) throw new Error(created.message);

        const result = parseDesignerFormDocumentText(JSON.stringify(created.data));

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.data.document.form.widgets[0].componentAttributes).toBeDefined();
        expect(result.data.dynamicContent.hasDynamicScripts).toBe(false);
        expect(result.data.dynamicContent.hasHtml).toBe(false);
    });

    it("同一设计生成相同的本地保存与文件导出数据", () => {
        const form = createFormDefaultData();
        const widget = createTextDefaultData();
        changeTextSetting(widget, "formatter", "function formatter(value) {\n return '共享:' + value;\n}");
        form.widgets.push(widget);

        const savedAt = new Date("2026-09-18T08:00:00.000Z");
        const documentResult = createDesignerFormDocument(form, savedAt);
        const draftResult = createDesignerFormDocument(form, savedAt);
        expect(documentResult.ok).toBe(true);
        expect(draftResult.ok).toBe(true);
        if (!documentResult.ok || !draftResult.ok) return;
        expect(documentResult.data).toEqual(draftResult.data);
        expect(documentResult.data.form).not.toBe(draftResult.data.form);

        const restoredDocument = restoreDesignerFormDocument(documentResult.data);
        const restoredDraft = restoreDesignerFormDocument(draftResult.data);
        expect(restoredDocument.ok).toBe(true);
        expect(restoredDraft.ok).toBe(true);
        if (!restoredDocument.ok || !restoredDraft.ok) return;
        expect(restoredDocument.data.form).not.toBe(documentResult.data.form);
        expect(restoredDraft.data.form).not.toBe(draftResult.data.form);
        expect(restoredDocument.data.form.widgets[0].componentAttributes?.formatter?.("A")).toBe("共享:A");
        expect(restoredDraft.data.form.widgets[0].componentAttributes?.formatter?.("A")).toBe("共享:A");
    });

    it("本地与文件共用的文档递归排除运行属性并恢复行容器子节点", () => {
        const form = createFormDefaultData();
        const row = createRowDefaultData();
        const child = createTextDefaultData();
        row.widgets.push(child);
        form.widgets.push(row);

        const created = createDesignerFormDocument(form);
        expect(created.ok).toBe(true);
        if (!created.ok) return;
        expect((created.data.form.widgets[0] as typeof row).widgets[0]).not.toHaveProperty("componentAttributes");
        expect(child.componentAttributes).toBeDefined();
        expect(created.data.form).not.toBe(form);

        const restored = restoreDesignerFormDocument(created.data);
        expect(restored.ok).toBe(true);
        if (restored.ok) expect((restored.data.form.widgets[0] as typeof row).widgets[0].componentAttributes).toBeDefined();
    });

    it("本地文档恢复拒绝非法结构、未知组件和嵌套行容器", () => {
        const created = createDesignerFormDocument(createFormDefaultData());
        if (!created.ok) throw new Error(created.message);
        const row = createRowDefaultData();

        expect(restoreDesignerFormDocument({ ...created.data, schemaVersion: 2 }).ok).toBe(false);
        expect(restoreDesignerFormDocument({ ...created.data, form: { ...created.data.form, widgets: null } }).ok).toBe(false);
        expect(restoreDesignerFormDocument({ ...created.data, form: { ...created.data.form, widgets: [{ ...row, widgets: [createRowDefaultData()] }] } }).ok).toBe(false);
        expect(restoreDesignerFormDocument({ ...created.data, form: { ...created.data.form, widgets: [{ ...row, widgets: [null] }] } }).ok).toBe(false);
        expect(restoreDesignerFormDocument({ ...created.data, form: { ...created.data.form, widgets: [{ ...createTextDefaultData(), code: "unknown" }] } }).ok).toBe(false);
    });

    it("不可序列化设计返回失败结果而不抛出", () => {
        const form = createFormDefaultData();
        const cyclic = form as unknown as Record<string, unknown>;
        cyclic.self = cyclic;

        expect(createDesignerFormDocument(form).ok).toBe(false);
    });

    it("合法动态脚本通过语法校验并标记风险确认", () => {
        const form = createFormDefaultData();
        const widget = createTextDefaultData();
        changeTextSetting(widget, "formatter", "function formatter(value) {\n return String(value);\n}");
        form.widgets.push(widget);
        const created = createDesignerFormDocument(form);
        if (!created.ok) throw new Error(created.message);

        const result = parseDesignerFormDocumentText(JSON.stringify(created.data));

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.data.dynamicContent.hasDynamicScripts).toBe(true);
    });

    it("动态脚本语法错误时拒绝导入", () => {
        const form = createFormDefaultData();
        const widget = createTextDefaultData();
        widget.componentFunctions.formatter = "return (";
        form.widgets.push(widget);
        const created = createDesignerFormDocument(form);
        if (!created.ok) throw new Error(created.message);

        const result = parseDesignerFormDocumentText(JSON.stringify(created.data));

        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.path).toContain("componentFunctions.formatter");
    });

    it("合法 HTML 标记风险，高危 HTML 直接拒绝", () => {
        const safeForm = createFormDefaultData();
        const safeHtml = createHtmlDefaultData();
        changeHtmlSetting(safeHtml, "defaultValue", "<p><strong>安全内容</strong></p>");
        safeForm.widgets.push(safeHtml);
        const safeDocument = createDesignerFormDocument(safeForm);
        if (!safeDocument.ok) throw new Error(safeDocument.message);

        const safeResult = parseDesignerFormDocumentText(JSON.stringify(safeDocument.data), inspectHtml);
        expect(safeResult.ok).toBe(true);
        if (safeResult.ok) expect(safeResult.data.dynamicContent.hasHtml).toBe(true);

        const dangerousDocument = structuredClone(safeDocument.data);
        dangerousDocument.form.widgets[0].settingData!.defaultValue = '<img src="x" onerror="alert(1)">';
        const dangerousResult = parseDesignerFormDocumentText(JSON.stringify(dangerousDocument), inspectHtml);
        expect(dangerousResult.ok).toBe(false);
        if (!dangerousResult.ok) expect(dangerousResult.message).toContain("HTML 内容包含高危代码");
    });

    it("拒绝重复身份、字段名不一致和非法行容器布局", () => {
        const form = createFormDefaultData();
        const first = createTextDefaultData();
        const second = createTextDefaultData();
        (second as { id: string }).id = first.id;
        form.widgets.push(first, second);
        const duplicateId = createDesignerFormDocument(form);
        if (!duplicateId.ok) throw new Error(duplicateId.message);
        expect(parseDesignerFormDocumentText(JSON.stringify(duplicateId.data)).ok).toBe(false);

        (second as { id: string }).id = "second";
        second.formAttributes.prop = "different";
        const inconsistentProp = createDesignerFormDocument(form);
        if (!inconsistentProp.ok) throw new Error(inconsistentProp.message);
        expect(parseDesignerFormDocumentText(JSON.stringify(inconsistentProp.data)).ok).toBe(false);

        const rowForm = createFormDefaultData();
        const row = createRowDefaultData();
        row.settingData.enableSpanConfig = true;
        row.settingData.spans = [25];
        row.widgets.push(createTextDefaultData());
        rowForm.widgets.push(row);
        const invalidRow = createDesignerFormDocument(rowForm);
        if (!invalidRow.ok) throw new Error(invalidRow.message);
        expect(parseDesignerFormDocumentText(JSON.stringify(invalidRow.data)).ok).toBe(false);
    });
});
