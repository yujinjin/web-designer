/**
 * @fileoverview 验证 Storage Store 对设计器草稿采用直接持久化而非 Pinia state 缓存。
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

const storageService = vi.hoisted(() => ({
    getValue: vi.fn(),
    setValue: vi.fn()
}));

vi.mock("@/services/local-storage", () => storageService);

import useStorageStore from "@/stores/storage";

describe("storage store designer form draft", () => {
    beforeEach(() => {
        storageService.getValue.mockReset();
        storageService.setValue.mockReset();
        storageService.getValue.mockImplementation((key: string) => (key === "pageRouteDatas" ? {} : undefined));
        setActivePinia(createPinia());
    });

    it("每次读取草稿都直接访问本地存储且不进入 state", () => {
        const draft = { schemaVersion: 1, savedAt: "2026-09-17T08:00:00.000Z", form: {} };
        storageService.getValue.mockImplementation((key: string) => (key === "designerFormDraft" ? draft : {}));
        const store = useStorageStore();

        expect(store.$state).not.toHaveProperty("designerFormDraft");
        expect(store.getDesignerFormDraft()).toEqual(draft);
        expect(store.getDesignerFormDraft()).toEqual(draft);
        expect(storageService.getValue).toHaveBeenNthCalledWith(2, "designerFormDraft");
        expect(storageService.getValue).toHaveBeenNthCalledWith(3, "designerFormDraft");
    });

    it("写入草稿直接覆盖独立业务 key", () => {
        const draft = { schemaVersion: 1, savedAt: "2026-09-17T08:00:00.000Z", form: {} };
        const store = useStorageStore();

        store.setDesignerFormDraft(draft);

        expect(storageService.setValue).toHaveBeenCalledWith("designerFormDraft", draft);
    });
});
