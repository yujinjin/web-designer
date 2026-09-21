/**
 * @fileoverview 验证预览入口、Dialog 生命周期、纯运行态布局和事件绑定源码契约。
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { WIDGET_DEFINITIONS } from "@/views/composables/widget-registry";
import designerFormPreviewErrorBoundary from "@/views/components/designer-form-preview-error-boundary.vue";

const readSource = (path: string): string => readFileSync(new URL(path, import.meta.url), "utf-8");
const appSource = readSource("../../src/views/app.vue");
const centerPanelSource = readSource("../../src/views/components/center-render-panel.vue");
const dialogSource = readSource("../../src/views/components/designer-form-preview-dialog.vue");
const rendererSource = readSource("../../src/views/components/designer-form-preview-renderer.vue");
const rowSource = readSource("../../src/views/components/designer-form-preview-row.vue");
const widgetRendererSource = readSource("../../src/views/components/widget-renderer.vue");
const errorBoundarySource = readSource("../../src/views/components/designer-form-preview-error-boundary.vue");

describe("designer form preview UI", () => {
    it("Center Panel 发出预览请求且根页面只在快照成功后打开 Dialog", () => {
        expect(centerPanelSource).toContain("preview: []");
        expect(centerPanelSource).toContain("emit('preview')");
        expect(appSource).toContain('@preview="handlePreview"');
        expect(appSource).toContain("createDesignerFormPreviewSnapshot(widgetFormData)");
        expect(appSource).toContain("previewWidgetFormData.value = previewResult.data");
    });

    it("Dialog 关闭后销毁内容并释放快照且只提供关闭命令", () => {
        expect(dialogSource).toContain("destroy-on-close");
        expect(dialogSource).toContain("@closed=\"emit('closed')\"");
        expect(dialogSource).toContain("关闭");
        expect(appSource).toContain("previewWidgetFormData.value = null");
        expect(dialogSource).not.toContain("提交");
        expect(dialogSource).not.toContain("重置");
    });

    it("纯预览层保留完整树并在顶层、行容器和子列响应 isShow", () => {
        expect(rendererSource).toContain('v-show="item.isShow"');
        expect(rowSource).toContain('v-show="item.isShow"');
        expect(rendererSource).not.toContain("filter(");
        expect(rowSource).not.toContain("Sortable");
        expect(rendererSource).not.toContain("Sortable");
        expect(rendererSource).not.toContain("selectedWigetId");
        expect(rendererSource).toContain("runDesignerFormPreviewInit");
    });

    it("普通组件继续复用分发器且 TimePicker 不再遗漏注册事件", () => {
        expect(rendererSource).toContain("<widget-renderer");
        const timePickerBranch = widgetRendererSource.slice(widgetRendererSource.indexOf("<el-time-picker"), widgetRendererSource.indexOf("<el-time-select"));
        expect(timePickerBranch).toContain("getWidgetComponentEvents(widgetData, formData, widgetFormData)");
        const registeredEventWidgetCount = WIDGET_DEFINITIONS.filter(definition => definition.getEvents).length;
        const rendererEventBindingCount = widgetRendererSource.match(/v-on="getWidgetComponentEvents\(widgetData, formData, widgetFormData\)"/g)?.length ?? 0;
        expect(rendererEventBindingCount).toBeGreaterThanOrEqual(registeredEventWidgetCount);
        expect(widgetRendererSource).not.toContain("preview");
    });

    it("组件级错误边界只记录安全身份摘要并阻止异常扩散", () => {
        expect(rendererSource).toContain("designer-form-preview-error-boundary");
        expect(rowSource).toContain("designer-form-preview-error-boundary");
        expect(errorBoundarySource).toContain("onErrorCaptured");
        expect(errorBoundarySource).toContain("widgetId: props.widgetId");
        expect(errorBoundarySource).toContain("widgetCode: props.widgetCode");
        expect(errorBoundarySource).toContain("return false");
        expect(errorBoundarySource).not.toContain("componentFunctions");
        expect(errorBoundarySource).not.toContain("formData");
    });

    it("错误边界使用单一根节点承接 class 等非 prop 属性", async () => {
        const warnings: string[] = [];
        const app = createSSRApp({
            render: () => h(designerFormPreviewErrorBoundary, { class: "preview-form__item", widgetId: "widget-1", widgetCode: "text" }, () => h("span", "内容"))
        });
        app.config.warnHandler = message => warnings.push(message);

        const html = await renderToString(app);

        expect(warnings).not.toContainEqual(expect.stringContaining("Extraneous non-props attributes"));
        expect(html).toContain("preview-form__item");
    });
});
