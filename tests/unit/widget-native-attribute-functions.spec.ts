/**
 * @fileoverview 验证 Switch、DatePicker 和 TimePicker 动态属性只使用 Element Plus 原生回调参数。
 */
import { describe, expect, it, vi } from "vitest";
import dayjs from "dayjs";
import { useAttributes as buildDatePickerAttributes, useCreateDefaultData as createDatePickerDefaultData } from "@/views/composables/widgets/date-picker";
import { useAttributes as buildSwitchAttributes, useCreateDefaultData as createSwitchDefaultData } from "@/views/composables/widgets/switch";
import { useAttributes as buildTimePickerAttributes, useCreateDefaultData as createTimePickerDefaultData } from "@/views/composables/widgets/time-picker";

describe("native widget attribute functions", () => {
    it("Switch beforeChange 以零参数执行", async () => {
        const widgetData = createSwitchDefaultData();
        const callback = vi.fn(() => true);
        (globalThis as any).nativeCallback = callback;
        widgetData.componentFunctions.beforeChange = "return nativeCallback(...arguments);";

        const attributes = buildSwitchAttributes(widgetData);
        await attributes.beforeChange?.();

        expect(callback).toHaveBeenCalledWith();
        expect(widgetData.settingData.beforeChange).toContain("beforeChange()");
        delete (globalThis as any).nativeCallback;
    });

    it("DatePicker 禁用函数只转发 Element Plus 原生参数", () => {
        const widgetData = createDatePickerDefaultData();
        const callback = vi.fn(() => []);
        (globalThis as any).nativeCallback = callback;
        widgetData.componentFunctions.disabledDate = "return nativeCallback(...arguments);";
        widgetData.componentFunctions.disabledMinutes = "return nativeCallback(...arguments);";

        const attributes = buildDatePickerAttributes(widgetData);
        const date = new Date();
        attributes.disabledDate?.(date);
        expect(callback).toHaveBeenLastCalledWith(date);

        const comparingDate = dayjs();
        attributes.disabledMinutes?.(12, "start", comparingDate);
        expect(callback).toHaveBeenLastCalledWith(12, "start", comparingDate);
        expect(widgetData.settingData.disabledDate).toContain("disabledDate(date)");
        expect(widgetData.settingData.disabledMinutes).toContain("disabledMinutes(hour, role, comparingDate)");
        delete (globalThis as any).nativeCallback;
    });

    it("TimePicker 禁用函数只转发 Element Plus 原生参数", () => {
        const widgetData = createTimePickerDefaultData();
        const callback = vi.fn(() => []);
        (globalThis as any).nativeCallback = callback;
        widgetData.componentFunctions.disabledSeconds = "return nativeCallback(...arguments);";

        const attributes = buildTimePickerAttributes(widgetData);
        const comparingDate = { valueOf: () => 1 } as any;
        attributes.disabledSeconds?.(12, 30, "end", comparingDate);

        expect(callback).toHaveBeenCalledWith(12, 30, "end", comparingDate);
        expect(widgetData.settingData.disabledSeconds).toContain("disabledSeconds(hour, minute, role, comparingDate)");
        delete (globalThis as any).nativeCallback;
    });
});
