/**
 * @fileoverview 验证浏览器 JSON 文件读取上限和下载资源释放。
 */
import { describe, expect, it, vi } from "vitest";
import { downloadJsonText, readJsonFileText } from "@/views/composables/browser-json-file";

describe("browser json file", () => {
    it("读取 UTF-8 JSON 文本并拒绝超限或空文件", async () => {
        const validFile = { size: 12, text: vi.fn().mockResolvedValue('{"ok":true}') } as unknown as File;
        const validResult = await readJsonFileText(validFile, 100);
        expect(validResult).toEqual({ ok: true, data: '{"ok":true}' });

        const oversized = { size: 101, text: vi.fn() } as unknown as File;
        expect((await readJsonFileText(oversized, 100)).ok).toBe(false);

        const empty = { size: 0, text: vi.fn().mockResolvedValue("") } as unknown as File;
        expect((await readJsonFileText(empty, 100)).ok).toBe(false);
    });

    it("下载后移除临时节点并释放 Object URL", () => {
        const click = vi.fn();
        const remove = vi.fn();
        const anchor = { href: "", download: "", style: {}, click, remove } as unknown as HTMLAnchorElement;
        const createObjectURL = vi.fn().mockReturnValue("blob:test");
        const revokeObjectURL = vi.fn();
        const environment = {
            createAnchor: () => anchor,
            appendAnchor: vi.fn(),
            createObjectURL,
            revokeObjectURL
        };

        downloadJsonText('{"ok":true}', "form.json", environment);

        expect(click).toHaveBeenCalledOnce();
        expect(remove).toHaveBeenCalledOnce();
        expect(revokeObjectURL).toHaveBeenCalledWith("blob:test");
    });
});
