/**
 * @fileoverview 验证模板库图片卡片、页签状态和 Center Panel 模板拖入分发契约。
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getFormTemplateList } from "@/views/composables/form-template-registry";

const leftPanelSource = readFileSync(new URL("../../src/views/components/left-widget-panel.vue", import.meta.url), "utf-8");
const centerPanelSource = readFileSync(new URL("../../src/views/components/center-render-panel.vue", import.meta.url), "utf-8");

describe("form template library UI", () => {
    it("模板页签使用可写状态并展示 34 个单列 PNG 卡片", () => {
        expect(getFormTemplateList()).toHaveLength(34);
        expect(leftPanelSource).toContain('v-model="activeTab"');
        expect(leftPanelSource).toContain('name="templates"');
        expect(leftPanelSource).toContain('class="template-item"');
        expect(leftPanelSource).toContain(':data-template-id="template.id"');
        expect(leftPanelSource).toContain('loading="lazy"');
        expect(leftPanelSource).not.toContain("preview-src-list");
        expect(leftPanelSource).not.toContain("放大");
    });

    it("Center Panel 优先处理模板 ID 并保留普通组件插入", () => {
        expect(centerPanelSource).toContain('getAttribute("data-template-id")');
        expect(centerPanelSource).toContain("insertWidgetTemplate");
        expect(centerPanelSource).toContain('getAttribute("data-widget-type")');
        expect(centerPanelSource).toContain("insertWidgetDefaultData");
    });
});
