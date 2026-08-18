import { describe, expect, it } from "vitest";
import { useCreateDefaultData as useCreateDatePickerDefaultData, useSettingDataValueChange as changeDatePickerSetting } from "@/views/composables/widgets/date-picker";
import { useCreateDefaultData as useCreateSwitchDefaultData, useSettingDataValueChange as changeSwitchSetting } from "@/views/composables/widgets/switch";
import { useCreateDefaultData as useCreateTimePickerDefaultData, useSettingDataValueChange as changeTimePickerSetting } from "@/views/composables/widgets/time-picker";
import { useCreateDefaultData as useCreateTimeSelectDefaultData, useSettingDataValueChange as changeTimeSelectSetting } from "@/views/composables/widgets/time-select";

describe("widget default value settings", () => {
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
