/**
 * @fileoverview 验证表单预览快照隔离、重复创建和初始化脚本运行协议。
 */
import { describe, expect, it } from "vitest";
import { createDesignerFormPreviewSnapshot, runDesignerFormPreviewInit } from "@/views/composables/designer-form-preview";
import { useCreateDefaultData as createFormDefaultData } from "@/views/composables/widgets/form";
import { useCreateDefaultData as createTextDefaultData } from "@/views/composables/widgets/text";
import { getWidgetComponentEvents } from "@/views/composables/widget-registry";

describe("designer form preview", () => {
    it("每次创建独立快照并恢复运行属性且不修改设计源", () => {
        const source = createFormDefaultData();
        const widget = createTextDefaultData();
        widget.componentFunctions.formatter = "return 'preview:' + value;";
        source.widgets.push(widget);

        const first = createDesignerFormPreviewSnapshot(source);
        const second = createDesignerFormPreviewSnapshot(source);

        expect(first.ok).toBe(true);
        expect(second.ok).toBe(true);
        if (!first.ok || !second.ok) return;
        expect(first.data).not.toBe(source);
        expect(second.data).not.toBe(first.data);
        expect(first.data.widgets[0].componentAttributes).toBeDefined();
        expect(first.data.widgets[0].componentAttributes?.formatter?.("A")).toBe("preview:A");
        first.data.widgets[0].isShow = false;
        expect(source.widgets[0].isShow).toBe(true);
        expect(second.data.widgets[0].isShow).toBe(true);
    });

    it("每次新快照都保留字段默认值而不复用上一次预览输入", () => {
        const source = createFormDefaultData();
        const widget = createTextDefaultData();
        widget.defaultValue = "默认值";
        source.widgets.push(widget);
        const first = createDesignerFormPreviewSnapshot(source);
        if (!first.ok) throw new Error(first.message);
        first.data.widgets[0].defaultValue = "预览修改";

        const second = createDesignerFormPreviewSnapshot(source);
        if (!second.ok) throw new Error(second.message);
        expect(second.data.widgets[0].defaultValue).toBe("默认值");
        expect(source.widgets[0].defaultValue).toBe("默认值");
    });

    it("同步和异步 onInit 均只修改传入的预览上下文", async () => {
        const source = createFormDefaultData();
        const preview = createDesignerFormPreviewSnapshot(source);
        if (!preview.ok) throw new Error(preview.message);
        const formData: Record<string, any> = { state: "before" };

        preview.data.componentFunctions.init = "formData.state = 'sync'; widgetFormData.settingData.labelWidth = 180;";
        await runDesignerFormPreviewInit(preview.data, formData);
        expect(formData.state).toBe("sync");
        expect(preview.data.settingData.labelWidth).toBe(180);
        expect(source.settingData.labelWidth).toBe(120);

        preview.data.componentFunctions.init = "await Promise.resolve(); formData.state = 'async';";
        await runDesignerFormPreviewInit(preview.data, formData);
        expect(formData.state).toBe("async");
    });

    it("初始化异常向调用方传播以便 Dialog 展示表单级错误", async () => {
        const preview = createDesignerFormPreviewSnapshot(createFormDefaultData());
        if (!preview.ok) throw new Error(preview.message);
        preview.data.componentFunctions.init = "throw new Error('init failed');";

        await expect(runDesignerFormPreviewInit(preview.data, {})).rejects.toThrow("init failed");
    });

    it("组件事件动态切换预览副本显隐且不删除字段值或修改设计源", () => {
        const source = createFormDefaultData();
        const controller = createTextDefaultData();
        const target = createTextDefaultData();
        controller.componentFunctions.change = `
            const target = widgetFormData.widgets.find(item => item.id === "${target.id}");
            target.isShow = value === "show";
        `;
        target.isShow = false;
        source.widgets.push(controller, target);
        const preview = createDesignerFormPreviewSnapshot(source);
        if (!preview.ok) throw new Error(preview.message);
        const previewController = preview.data.widgets[0];
        const previewTarget = preview.data.widgets[1];
        const formData = { [target.id]: "保留值" };
        const events = getWidgetComponentEvents(previewController, formData, preview.data);

        events.change("show");
        expect(previewTarget.isShow).toBe(true);
        expect(formData[target.id]).toBe("保留值");
        expect(source.widgets[1].isShow).toBe(false);

        events.change("hide");
        expect(previewTarget.isShow).toBe(false);
        expect(formData[target.id]).toBe("保留值");
    });
});
