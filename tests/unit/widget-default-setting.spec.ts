import { describe, expect, it } from "vitest";
import { useCreateDefaultData as useCreateDatePickerDefaultData, useSettingDataValueChange as changeDatePickerSetting } from "@/views/domain/widgets/adapters/date-picker";
import { useCreateDefaultData as useCreateSwitchDefaultData, useSettingDataValueChange as changeSwitchSetting } from "@/views/domain/widgets/adapters/switch";
import { useCreateDefaultData as useCreateTimePickerDefaultData, useSettingDataValueChange as changeTimePickerSetting } from "@/views/domain/widgets/adapters/time-picker";
import { useCreateDefaultData as useCreateTimeSelectDefaultData, useSettingDataValueChange as changeTimeSelectSetting } from "@/views/domain/widgets/adapters/time-select";
import { WIDGET_DEFINITIONS } from "@/views/domain/widgets/registry";
import { useCreateDefaultData as createRate, useSettingDataValueChange as changeRate } from "@/views/domain/widgets/adapters/rate";

describe("widget default value settings", () => {
    it.each([
        "text",
        "input-number",
        "radio-group",
        "checkbox-group",
        "select",
        "cascader",
        "date-picker",
        "time-picker",
        "time-select",
        "switch",
        "rate",
        "color-picker",
        "slider",
        "upload",
        "html",
        "alert",
        "divider"
    ])("%s 的隐藏控制可往返，空control不隐藏", async code => {
        const adapter = await import(`../../src/views/domain/widgets/adapters/${code}.ts`);
        const widget = adapter.useCreateDefaultData();
        adapter.useSettingDataValueChange(widget, "control", ["isHidden"]);
        expect(widget.isShow).toBe(false);
        expect(widget.settingData.control).toEqual(["isHidden"]);
        adapter.useSettingDataValueChange(widget, "control", []);
        expect(widget.isShow).toBe(true);
        expect(widget.settingData.control).toEqual([]);
        if (widget.componentAttributes && "disabled" in widget.componentAttributes) {
            adapter.useSettingDataValueChange(widget, "control", ["disabled"]);
            expect(widget.isShow).toBe(true);
            expect(widget.componentAttributes.disabled).toBe(true);
            adapter.useSettingDataValueChange(widget, "control", ["disabled", "isHidden"]);
            expect(widget.isShow).toBe(false);
            expect(widget.componentAttributes.disabled).toBe(true);
        }
        if (widget.componentAttributes && "readonly" in widget.componentAttributes) {
            adapter.useSettingDataValueChange(widget, "control", ["readonly", "isHidden"]);
            expect(widget.isShow).toBe(false);
            expect(widget.componentAttributes.readonly).toBe(true);
            adapter.useSettingDataValueChange(widget, "control", ["readonly"]);
            expect(widget.isShow).toBe(true);
            expect(widget.componentAttributes.readonly).toBe(true);
            adapter.useSettingDataValueChange(widget, "control", []);
            expect(widget.componentAttributes.readonly).toBe(false);
        }
    });
    it("所有支持控制属性的组件默认control为空且正常显示", () => {
        for (const definition of WIDGET_DEFINITIONS) {
            const widget = definition.createDefaultData();
            const control = widget.settingData && "control" in widget.settingData ? widget.settingData.control : undefined;
            if (Array.isArray(control)) {
                expect(control, definition.meta.code).toEqual([]);
                expect(widget.isShow, definition.meta.code).toBe(true);
            }
        }
    });

    it("评分只勾选隐藏才隐藏，禁用状态与隐藏独立", () => {
        const widget = createRate();
        changeRate(widget, "control", [...widget.settingData.control, "disabled"]);
        expect(widget.isShow).toBe(true);
        expect(widget.componentAttributes!.disabled).toBe(true);
        changeRate(widget, "control", ["isHidden"]);
        expect(widget.isShow).toBe(false);
        expect(widget.componentAttributes!.disabled).toBe(false);
        changeRate(widget, "control", []);
        expect(widget.isShow).toBe(true);
    });
    it("时间选择默认值同步写入根级和设置态数据", () => {
        const widgetData = useCreateTimeSelectDefaultData();

        changeTimeSelectSetting(widgetData, "defaultValue", "10:30");

        expect(widgetData.defaultValue).toBe("10:30");
        expect(widgetData.settingData.defaultValue).toBe("10:30");
    });

    it("日期默认值正常写回并在类型变化时同步清空", () => {
        const widgetData = useCreateDatePickerDefaultData();

        changeDatePickerSetting(widgetData, "defaultValue", "2026-08-18");
        expect(widgetData.defaultValue).toBe("2026-08-18");
        expect(widgetData.settingData.defaultValue).toBe("2026-08-18");

        changeDatePickerSetting(widgetData, "type", "daterange");
        expect(widgetData.defaultValue).toBeNull();
        expect(widgetData.settingData.defaultValue).toBeNull();
    });

    it("时间默认值正常写回并在范围模式变化时同步清空", () => {
        const widgetData = useCreateTimePickerDefaultData();

        changeTimePickerSetting(widgetData, "defaultValue", "10:30:00");
        expect(widgetData.defaultValue).toBe("10:30:00");
        expect(widgetData.settingData.defaultValue).toBe("10:30:00");

        changeTimePickerSetting(widgetData, "isRange", true);
        expect(widgetData.defaultValue).toBeNull();
        expect(widgetData.settingData.defaultValue).toBeNull();
    });

    it("开关默认值保持布尔类型并同步写入两处数据", () => {
        const widgetData = useCreateSwitchDefaultData();

        changeSwitchSetting(widgetData, "defaultValue", true);
        expect(widgetData.defaultValue).toBe(true);
        expect(widgetData.settingData.defaultValue).toBe(true);

        changeSwitchSetting(widgetData, "defaultValue", false);
        expect(widgetData.defaultValue).toBe(false);
        expect(widgetData.settingData.defaultValue).toBe(false);
    });
});
