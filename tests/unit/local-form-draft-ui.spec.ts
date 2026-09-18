/**
 * @fileoverview 验证本地草稿保存按钮、页面保存编排和挂载恢复询问的源码契约。
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const centerPanelSource = readFileSync(new URL("../../src/views/components/center-render-panel.vue", import.meta.url), "utf-8");
const appSource = readFileSync(new URL("../../src/views/app.vue", import.meta.url), "utf-8");

describe("local form draft UI", () => {
    it("Center Panel 提供保存到本地按钮和 typed emit", () => {
        expect(centerPanelSource).toContain("DocumentChecked");
        expect(centerPanelSource).toContain("保存到本地");
        expect(centerPanelSource).toContain("saveLocalDraft: []");
        expect(centerPanelSource).toContain("emit('saveLocalDraft')");
    });

    it("根页面编排保存并提供成功失败反馈", () => {
        expect(appSource).toContain('@save-local-draft="handleSaveLocalDraft"');
        expect(appSource).toContain("createDesignerFormDraft(widgetFormData)");
        expect(appSource).toContain("storageStore.setDesignerFormDraft");
        expect(appSource).toContain("当前设计已保存到本地");
        expect(appSource).toContain("本地保存失败，请检查浏览器存储权限或空间");
    });

    it("挂载时读取草稿并在用户确认后恢复", () => {
        expect(appSource).toContain("storageStore.getDesignerFormDraft");
        expect(appSource).toContain("restoreDesignerFormDraft");
        expect(appSource).toContain("ElMessageBox.confirm");
        expect(appSource).toContain("检测到上次保存的设计");
        expect(appSource).toContain("replaceWidgetFormData");
        expect(appSource).toContain("已恢复上次保存的设计");
        expect(appSource).toContain("void restoreLastDesignerFormDraft()");
    });
});
