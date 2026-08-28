import { describe, expect, it, vi } from "vitest";
import { createWidgetDefaultData, getWidgetComponentAttributes, getWidgetComponentEvents, getWidgetGroup, getWidgetList } from "@/views/composables/widget-registry";
import { useCreateDefaultData, useEvents, useSettingDataValueChange } from "@/views/composables/widgets/cascader";
import { useCreateDefaultData as useCreateFormDefaultData } from "@/views/composables/widgets/form";

describe("cascader widget", () => {
    it("创建相互隔离的本地树且不包含远程数据源配置", () => {
        const first = useCreateDefaultData();
        const second = useCreateDefaultData();

        first.settingData.options[0].label = "已修改";

        expect(second.settingData.options[0].label).toBe("浙江省");
        expect(first.settingData).not.toHaveProperty("dataSourceType");
        expect(first.settingData).not.toHaveProperty("remote");
        expect(first.componentAttributes).not.toHaveProperty("options");
    });

    it("由注册表创建并归入选择型组件", () => {
        const widgetList = getWidgetList();
        const selectionGroup = getWidgetGroup().find(group => group.groupName === "选择型组件");

        expect(widgetList.WIDGET_CASCADER.code).toBe("cascader");
        expect(selectionGroup?.children.map(item => item.code)).toContain("cascader");
        expect(createWidgetDefaultData("cascader").code).toBe("cascader");
    });

    it("同步常用属性且保持本地树引用", () => {
        const widgetData = useCreateDefaultData();
        const localOptions = widgetData.settingData.options;

        useSettingDataValueChange(widgetData, "multiple", true);
        useSettingDataValueChange(widgetData, "emitPath", false);
        useSettingDataValueChange(widgetData, "expandTrigger", "hover");

        expect(widgetData.componentAttributes.props).toMatchObject({ multiple: true, emitPath: false, expandTrigger: "hover" });
        expect(widgetData.settingData.options).toBe(localOptions);
        expect(getWidgetComponentAttributes(widgetData, null).options).toBe(localOptions);
        expect(widgetData.componentAttributes).not.toHaveProperty("options");
    });

    it("事件适配器按 Element Plus 事件名注入表单上下文", () => {
        const widgetData = useCreateDefaultData();
        const widgetFormData = useCreateFormDefaultData();
        const formData = { [widgetData.id]: ["330000"] };
        const handler = vi.fn();
        widgetData.componentFunctions.change = "callback(value, formData, widgetFormData);";
        widgetData.componentFunctions.visibleChange = "callback(visible, formData, widgetFormData);";
        (globalThis as any).callback = handler;

        const events = useEvents(widgetData, formData, widgetFormData);
        events.change?.(["330000"]);
        events.visibleChange?.(true);

        expect(handler).toHaveBeenCalledWith(["330000"], formData, widgetFormData);
        expect(handler).toHaveBeenCalledWith(true, formData, widgetFormData);
        expect(getWidgetComponentEvents(widgetData, formData, widgetFormData)).toHaveProperty("change");
        delete (globalThis as any).callback;
    });
});
