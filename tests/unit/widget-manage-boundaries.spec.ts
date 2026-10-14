/**
 * @fileoverview 补充组件管理器非法操作、行容器布局同步、复制身份和提示恢复状态的边界测试。
 */
import { describe, expect, it, vi } from "vitest";
import { reactive, ref } from "vue";
import useWidgetManage from "@/views/composables/use-widget-manage";
import { getAlertRenderKey, showAlert } from "@/views/composables/use-alert-render-state";
import { useCreateDefaultData as createForm } from "@/views/domain/form/form-adapter";
import { useCreateDefaultData as createRow } from "@/views/domain/widgets/adapters/row-container";
import { useCreateDefaultData as createText } from "@/views/domain/widgets/adapters/text";
import { useCreateDefaultData as createAlert, useSettingDataValueChange as changeAlert } from "@/views/domain/widgets/adapters/alert";
import { ROW_CONTAINER_MAX_WIDGET_COUNT } from "@/views/domain/widgets/layout/row-container-layout";

describe("组件管理器边界", () => {
    it("无选中项、空树或失效 ID 时不调用设置适配器", () => {
        const form = createForm();
        const selected = ref<string | null>(null);
        const manage = useWidgetManage(form, selected);
        const adapter = vi.fn();
        manage.changeSelectedWidgetSettingData(adapter, "label", "不应写入");
        manage.changeSelectedWidgetId("missing");
        manage.changeSelectedWidgetSettingData(adapter, "label", "不应写入");
        form.widgets.push(createText());
        manage.changeSelectedWidgetSettingData(adapter, "label", "不应写入");
        manage.changeSelectedWidgetId(null);
        expect(selected.value).toBeNull();
        expect(adapter).not.toHaveBeenCalled();
    });
    it("拒绝错误父级、嵌套容器及超限插入且保持选中状态", () => {
        const form = createForm();
        const row = createRow();
        const text = createText();
        form.widgets.push(row, text);
        const selected = ref<string | null>(text.id);
        const manage = useWidgetManage(form, selected);
        manage.insertWidgetDefaultData("text", 0, "missing");
        manage.insertWidgetDefaultData("text", 0, text.id);
        manage.insertWidgetDefaultData("row-container", 0, row.id);
        expect(row.widgets).toHaveLength(0);
        for (let index = 0; index < ROW_CONTAINER_MAX_WIDGET_COUNT; index++) row.widgets.push(createText());
        const before = row.widgets.slice();
        manage.insertWidgetDefaultData("text", 0, row.id);
        expect(row.widgets).toEqual(before);
        expect(selected.value).toBe(text.id);
    });
    it("自动布局插入平均分配，手动布局排序让跨度跟随字段", () => {
        const form = createForm();
        const row = createRow();
        form.widgets.push(row);
        const manage = useWidgetManage(form, ref(null));
        manage.insertWidgetDefaultData("text", -10, row.id);
        manage.insertWidgetDefaultData("text", 99, row.id);
        expect(row.settingData.spans).toEqual([12, 12]);
        row.settingData.enableSpanConfig = true;
        row.settingData.spans = [8, 16];
        const [first, second] = row.widgets;
        manage.updateWidgetOrder(0, 1, row.id);
        expect(row.widgets).toEqual([second, first]);
        expect(row.settingData.spans).toEqual([16, 8]);
        manage.updateWidgetOrder(0, 1, "missing");
        manage.updateWidgetOrder(0, 1, first.id);
        manage.updateWidgetOrder(0, 2, row.id);
        manage.updateWidgetOrder(0, 0, row.id);
        expect(row.widgets).toEqual([second, first]);
    });
    it("复制行容器时子字段身份与模型值相互隔离，无效来源保持状态", () => {
        const form = createForm();
        const row = createRow();
        const text = createText();
        text.defaultValue = "原值";
        row.widgets.push(text);
        form.widgets.push(row);
        const selected = ref<string | null>(text.id);
        const manage = useWidgetManage(form, selected);
        manage.copyWidgetData(0, 999);
        expect(form.widgets).toHaveLength(1);
        expect(selected.value).toBe(text.id);
        manage.copyWidgetData(-1, 0);
        const copy = form.widgets[0];
        if (!("widgets" in copy)) throw new Error("副本必须为行容器");
        expect(copy.id).not.toBe(row.id);
        expect(copy.widgets[0].id).not.toBe(text.id);
        expect(copy.widgets[0].propName).toBe(copy.widgets[0].id);
        expect(copy.widgets[0].formAttributes!.prop).toBe(copy.widgets[0].id);
        copy.widgets[0].defaultValue = "副本值";
        expect(text.defaultValue).toBe("原值");
        expect(selected.value).toBe(copy.id);
    });
    it("删除未知或未选中字段保持选择，末字段删除后取消选择且清空不换数组", () => {
        const form = createForm();
        const first = createText();
        const second = createText();
        form.widgets.push(first, second);
        const selected = ref<string | null>(second.id);
        const manage = useWidgetManage(form, selected);
        manage.deleteWidget("missing");
        manage.deleteWidget(first.id);
        expect(selected.value).toBe(second.id);
        manage.deleteWidget(second.id);
        expect(selected.value).toBeNull();
        const widgets = form.widgets;
        form.widgets.push(createText());
        manage.clearWidgets();
        expect(form.widgets).toBe(widgets);
        expect(widgets).toEqual([]);
    });
    it("替换候选删除旧嵌套属性而不是留下陈旧配置", () => {
        const form = createForm();
        const candidate = createForm();
        Object.assign(form.formAttributes, { staleAttribute: "旧值" });
        Object.assign(form.settingData, { staleSetting: "旧值" });
        Object.assign(form.componentFunctions, { staleEvent: "旧值" });
        useWidgetManage(form, ref(null)).replaceWidgetFormData(candidate);
        expect(form.formAttributes).not.toHaveProperty("staleAttribute");
        expect(form.settingData).not.toHaveProperty("staleSetting");
        expect(form.componentFunctions).not.toHaveProperty("staleEvent");
        expect(form.id).toBe(candidate.id);
    });
});

describe("提示重挂载状态边界", () => {
    it("不预读 key 也能恢复，原对象与代理共享，重复业务 ID 仍分离", () => {
        const widget = createAlert();
        const sameIdWidget = createAlert();
        Object.assign(sameIdWidget, { id: widget.id });
        changeAlert(widget, "control", ["isHidden"]);
        const attributes = widget.componentAttributes;
        const proxy = reactive(widget);
        showAlert(proxy);
        expect(getAlertRenderKey(widget)).toBe(1);
        expect(getAlertRenderKey(proxy)).toBe(1);
        expect(getAlertRenderKey(sameIdWidget)).toBe(0);
        expect(proxy.isShow).toBe(true);
        expect(widget.componentAttributes).toBe(attributes);
        expect(JSON.stringify(widget)).not.toContain("renderKey");
    });
});
