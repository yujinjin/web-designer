/**
 * @fileoverview 验证 HTML Widget 白名单检查发生任何移除时拒绝内容。
 */
import { describe, expect, it, vi } from "vitest";
import { type DOMPurify } from "dompurify";
import { inspectHtmlSafety, sanitizeHtmlForRendering } from "@/views/composables/html-safety";

describe("html safety", () => {
    it("白名单内容完整保留时通过", () => {
        const purifier = {
            removed: [],
            sanitize: vi.fn().mockReturnValue("<p><strong>安全内容</strong></p>")
        } as unknown as DOMPurify;

        expect(inspectHtmlSafety("<p><strong>安全内容</strong></p>", purifier)).toEqual({ ok: true, data: "<p><strong>安全内容</strong></p>" });
    });

    it("合法 b 标签不会因 DOMPurify 的内部 body 容器被误判为空", () => {
        const html = "<b>html teddddddxt</b>";
        const purifier = {
            removed: [] as Array<{ element: { nodeName: string } }>,
            sanitize: vi.fn((_html: string, config: { ALLOWED_TAGS: string[] }) => {
                purifier.removed = config.ALLOWED_TAGS.includes("body") ? [] : [{ element: { nodeName: "BODY" } }];
                return html;
            })
        } as unknown as DOMPurify;

        expect(inspectHtmlSafety(html, purifier)).toEqual({ ok: true, data: html });
    });

    it("DOMPurify 删除事件属性时直接拒绝", () => {
        const purifier = {
            removed: [{ attribute: { name: "onerror" }, from: {} }],
            sanitize: vi.fn().mockReturnValue('<img src="x">')
        } as unknown as DOMPurify;

        const result = inspectHtmlSafety('<img src="x" onerror="alert(1)">', purifier);

        expect(result).toEqual({ ok: false, message: "HTML 内容包含高危代码：onerror" });
    });

    it("运行环境不支持安全检查时不回退原始 HTML", () => {
        expect(inspectHtmlSafety("<p>内容</p>", null).ok).toBe(false);
        expect(typeof sanitizeHtmlForRendering("<script>alert(1)</script>")).toBe("string");
    });
});
