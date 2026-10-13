/**
 * @fileoverview 验证提示组件恢复显示的临时渲染状态、配置保留和实例隔离。
 */
import { describe, expect, it } from "vitest";
import { reactive, ref, watchEffect, nextTick } from "vue";
import { getAlertRenderKey, showAlert, useCreateDefaultData, useSettingDataValueChange } from "@/views/composables/widgets/alert";
import { useCreateDefaultData as createForm } from "@/views/composables/widgets/form";
import { useCreateDefaultData as createRow } from "@/views/composables/widgets/row-container";
import useWidgetManage from "@/views/composables/widget-manage";

describe("alert restore", () => {
    it("恢复显示清除隐藏设置并重置渲染标识，保留提示配置和属性引用", () => {
        const widget = useCreateDefaultData();
        useSettingDataValueChange(widget, "control", ["isHidden"]);
        useSettingDataValueChange(widget, "title", "测试提示");
        useSettingDataValueChange(widget, "description", "测试描述");
        const attributes = widget.componentAttributes;
        const before = JSON.stringify(widget);
        expect(getAlertRenderKey(widget)).toBe(0);
        showAlert(widget);
        expect(widget.isShow).toBe(true);
        expect(widget.settingData.control).toEqual([]);
        expect(widget.componentAttributes).toBe(attributes);
        expect(widget.componentAttributes).toMatchObject({ title: "测试提示", description: "测试描述", closable: true });
        expect(getAlertRenderKey(widget)).toBe(1);
        const saved = JSON.stringify(widget);
        showAlert(widget);
        expect(getAlertRenderKey(widget)).toBe(2);
        expect(JSON.stringify(widget)).toBe(saved);
        expect(JSON.parse(before).isShow).toBe(false);
    });

    it("运行标识驱动响应式更新，原对象和代理共享状态，其他实例互不影响", async () => {
        const widget = useCreateDefaultData();
        const proxy = reactive(widget);
        const other = useCreateDefaultData();
        const seen: number[] = [];
        const stop = watchEffect(() => seen.push(getAlertRenderKey(proxy)));
        showAlert(widget);
        await nextTick();
        expect(seen).toEqual([0, 1]);
        expect(getAlertRenderKey(other)).toBe(0);
        const restored = JSON.parse(JSON.stringify(widget));
        expect(getAlertRenderKey(restored)).toBe(0);
        stop();
    });

    it("通过统一设置入口恢复行容器内当前选中提示，不影响其他提示", () => {
        const form = createForm();
        const row = createRow();
        const widget = useCreateDefaultData();
        const other = useCreateDefaultData();
        row.widgets.push(widget, other);
        form.widgets.push(row);
        const { changeSelectedWidgetSettingData } = useWidgetManage(form, ref(widget.id));
        changeSelectedWidgetSettingData(showAlert, "control", null);
        expect(getAlertRenderKey(widget)).toBe(1);
        expect(getAlertRenderKey(other)).toBe(0);
    });
});
