/**
 * @fileoverview 验证 HTML 设置值只有通过安全检查后才更新设计数据。
 */
import { describe, expect, it, vi } from "vitest";
import { updateHtmlDefaultValue, useCreateDefaultData, useSettingDataValueChange } from "@/views/composables/widgets/html";

describe("html widget setting", () => {
    it("危险 HTML 不提交，修正为安全内容后恢复同步", () => {
        const widget = useCreateDefaultData();
        const commit = vi.fn((value: string) => useSettingDataValueChange(widget, "defaultValue", value));
        const inspect = (html: string) => (html.includes("onerror") ? ({ ok: false, message: "HTML 内容包含高危代码：onerror" } as const) : ({ ok: true, data: html } as const));

        const invalid = updateHtmlDefaultValue('<b onerror="alert(1)">危险</b>', commit, inspect);
        expect(invalid).toEqual({ ok: false, message: "HTML 内容包含高危代码：onerror" });
        expect(commit).not.toHaveBeenCalled();
        expect(widget.settingData.defaultValue).toBe("<b>html text</b>");

        const valid = updateHtmlDefaultValue("<b>安全内容</b>", commit, inspect);
        expect(valid).toEqual({ ok: true, data: "<b>安全内容</b>" });
        expect(commit).toHaveBeenCalledExactlyOnceWith("<b>安全内容</b>");
        expect(widget.defaultValue).toBe("<b>安全内容</b>");
        expect(widget.settingData.defaultValue).toBe("<b>安全内容</b>");
    });
});
