/**
 * @fileoverview 验证级联选择器在画布、本地树和右侧设置面板中的关键接线契约。
 */
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const widgetRendererSource = readFileSync(new URL("../../src/views/components/widget-renderer.vue", import.meta.url), "utf-8");
const cascaderRendererUrl = new URL("../../src/views/components/cascader-widget-renderer.vue", import.meta.url);
const cascaderSettingSource = readFileSync(new URL("../../src/views/components/widgets-setting/cascader.vue", import.meta.url), "utf-8");
const rightSettingPanelSource = readFileSync(new URL("../../src/views/components/right-setting-panel.vue", import.meta.url), "utf-8");

describe("cascader UI contract", () => {
    it("通用渲染器直接分发级联选择器", () => {
        expect(existsSync(cascaderRendererUrl)).toBe(false);
        expect(widgetRendererSource).toMatch(/<el-cascader[\s\S]*?widgetData\.code === widgetList\.WIDGET_CASCADER\.code[\s\S]*?v-model="renderValue"/);
        expect(widgetRendererSource).toMatch(/<el-cascader[\s\S]*?getWidgetComponentAttributes\(widgetData, renderValue\)/);
        expect(widgetRendererSource).toMatch(/<el-cascader[\s\S]*?getWidgetComponentEvents\(widgetData, formData, widgetFormData\)/);
        expect(widgetRendererSource).not.toContain("cascaderWidgetRenderer");
        expect(widgetRendererSource).not.toContain("isWidgetCascaderData");
        expect(widgetRendererSource).not.toContain("cascaderWidgetData");
    });

    it("同文件中的上传组件使用 Element Plus 支持的 file-list 双向绑定参数", () => {
        expect(widgetRendererSource).toMatch(/<el-upload[\s\S]*?v-model:file-list="renderValue"/);
        expect(widgetRendererSource).not.toMatch(/<el-upload[\s\S]*?\sv-model="renderValue"/);
    });

    it("设置面板只提供可换行本地 JSON 草稿校验", () => {
        expect(cascaderSettingSource).toContain('type="textarea"');
        expect(cascaderSettingSource).toContain("parseCascaderOptionsJson(value)");
        expect(cascaderSettingSource).toMatch(/if \(!result\.ok\)[\s\S]*?return;[\s\S]*?updateSetting\("options", result\.data\)/);
        expect(cascaderSettingSource).not.toContain("dataSourceType");
        expect(cascaderSettingSource).not.toContain("settingData.remote");
        expect(cascaderSettingSource).not.toContain("updateRemote");
        expect(cascaderSettingSource).not.toContain("updateMapping");
        expect(cascaderSettingSource).not.toContain("接口地址");
        expect(cascaderSettingSource).not.toContain("请求方式");
        expect(cascaderSettingSource).not.toContain("响应路径");
        expect(cascaderSettingSource).not.toContain("字段映射");
        expect(cascaderSettingSource).not.toContain("lazyLoad");
    });

    it("右侧设置面板按注册 code 加载级联设置组件", () => {
        expect(rightSettingPanelSource).toContain("case widgetList.WIDGET_CASCADER.code:");
        expect(rightSettingPanelSource).toContain('import("./widgets-setting/cascader.vue")');
    });
});
