/**
 * @fileoverview 验证设计器本地草稿投影、结构校验和运行属性恢复边界。
 */
import { describe, expect, it } from "vitest";
import { createDesignerFormDraft, restoreDesignerFormDraft } from "@/views/composables/designer-form-draft";
import { useCreateDefaultData as createFormDefaultData } from "@/views/composables/widgets/form";
import { useCreateDefaultData as createTextDefaultData, useSettingDataValueChange as changeTextSetting } from "@/views/composables/widgets/text";
import { useCreateDefaultData as createRowContainerDefaultData } from "@/views/composables/widgets/row-container";

describe("designer form draft", () => {
    it("递归排除运行属性并且不修改设计器源对象", () => {
        const formData = createFormDefaultData();
        const topWidget = createTextDefaultData();
        const rowContainer = createRowContainerDefaultData();
        const childWidget = createTextDefaultData();
        rowContainer.widgets.push(childWidget);
        formData.widgets.push(topWidget, rowContainer);

        const result = createDesignerFormDraft(formData, new Date("2026-09-17T08:00:00.000Z"));

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.data.schemaVersion).toBe(1);
        expect(result.data.savedAt).toBe("2026-09-17T08:00:00.000Z");
        expect(result.data.form.widgets[0]).not.toHaveProperty("componentAttributes");
        expect((result.data.form.widgets[1] as typeof rowContainer).widgets[0]).not.toHaveProperty("componentAttributes");
        expect(topWidget.componentAttributes).toBeDefined();
        expect(childWidget.componentAttributes).toBeDefined();
        expect(result.data.form).not.toBe(formData);
    });

    it("恢复顶层和行容器子组件的完整运行属性及动态函数", () => {
        const formData = createFormDefaultData();
        const topWidget = createTextDefaultData();
        const rowContainer = createRowContainerDefaultData();
        const childWidget = createTextDefaultData();
        changeTextSetting(topWidget, "formatter", "function formatter(value) {\n return '恢复:' + value;\n}");
        rowContainer.widgets.push(childWidget);
        formData.widgets.push(topWidget, rowContainer);
        const created = createDesignerFormDraft(formData, new Date("2026-09-17T08:00:00.000Z"));
        if (!created.ok) throw new Error(created.message);

        const restored = restoreDesignerFormDraft(created.data);

        expect(restored.ok).toBe(true);
        if (!restored.ok) return;
        expect(restored.data.form.widgets[0].componentAttributes?.formatter?.("A")).toBe("恢复:A");
        expect((restored.data.form.widgets[1] as typeof rowContainer).widgets[0].componentAttributes).toBeDefined();
    });

    it("拒绝不支持版本、非法时间和未知组件", () => {
        const formData = createFormDefaultData();
        formData.widgets.push(createTextDefaultData());
        const created = createDesignerFormDraft(formData, new Date("2026-09-17T08:00:00.000Z"));
        if (!created.ok) throw new Error(created.message);

        expect(restoreDesignerFormDraft({ ...created.data, schemaVersion: 2 }).ok).toBe(false);
        expect(restoreDesignerFormDraft({ ...created.data, savedAt: "invalid" }).ok).toBe(false);
        expect(
            restoreDesignerFormDraft({
                ...created.data,
                form: { ...created.data.form, widgets: [{ ...created.data.form.widgets[0], code: "unknown" }] }
            }).ok
        ).toBe(false);
    });

    it("拒绝非法根结构和嵌套行容器", () => {
        const formData = createFormDefaultData();
        const outerRow = createRowContainerDefaultData();
        const innerRow = createRowContainerDefaultData();
        const created = createDesignerFormDraft(formData, new Date("2026-09-17T08:00:00.000Z"));
        if (!created.ok) throw new Error(created.message);

        expect(restoreDesignerFormDraft({ ...created.data, form: { ...created.data.form, widgets: null } }).ok).toBe(false);
        expect(
            restoreDesignerFormDraft({
                ...created.data,
                form: { ...created.data.form, widgets: [{ ...outerRow, widgets: [innerRow] }] }
            }).ok
        ).toBe(false);
        expect(
            restoreDesignerFormDraft({
                ...created.data,
                form: { ...created.data.form, widgets: [{ ...outerRow, widgets: [null] }] }
            }).ok
        ).toBe(false);
    });

    it("不可序列化设计返回失败结果而不抛出", () => {
        const formData = createFormDefaultData();
        const cyclic = formData as unknown as Record<string, unknown>;
        cyclic.self = cyclic;

        expect(createDesignerFormDraft(formData).ok).toBe(false);
    });
});
