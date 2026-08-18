import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { type WidgetFormData } from "@/views/composables/types";
import useWidgetManage from "@/views/composables/widget-manage";
import { useCreateDefaultData as useCreateFormDefaultData } from "@/views/composables/widgets/form";
import { useCreateDefaultData as useCreateRowContainerDefaultData } from "@/views/composables/widgets/row-container";
import { useCreateDefaultData as useCreateTextDefaultData, useSettingDataValueChange as useTextSettingDataValueChange } from "@/views/composables/widgets/text";

describe("widget manager", () => {
    it("顶层插入会限制索引、更新选中项并保留未知 code 回退", () => {
        const widgetFormData = useCreateFormDefaultData() as WidgetFormData;
        const selectedWidgetId = ref<string | null>(null);
        const { insertWidgetDefaultData } = useWidgetManage(widgetFormData, selectedWidgetId);

        insertWidgetDefaultData("input-number", 99);
        insertWidgetDefaultData("unknown-widget", -1);

        expect(widgetFormData.widgets.map(item => item.code)).toEqual(["text", "input-number"]);
        expect(selectedWidgetId.value).toBe(widgetFormData.widgets[0].id);
    });

    it("顶层排序保持组件数据并忽略非法索引", () => {
        const widgetFormData = useCreateFormDefaultData() as WidgetFormData;
        const selectedWidgetId = ref<string | null>(null);
        const firstWidget = useCreateTextDefaultData();
        const secondWidget = useCreateTextDefaultData();
        widgetFormData.widgets.push(firstWidget, secondWidget);
        const { updateWidgetOrder } = useWidgetManage(widgetFormData, selectedWidgetId);

        updateWidgetOrder(0, 1);
        updateWidgetOrder(-1, 0);

        expect(widgetFormData.widgets.map(item => item.id)).toEqual([secondWidget.id, firstWidget.id]);
    });

    it("行容器手动 span 模式插入字段时补充剩余栅格", () => {
        const widgetFormData = useCreateFormDefaultData() as WidgetFormData;
        const selectedWidgetId = ref<string | null>(null);
        const rowContainer = useCreateRowContainerDefaultData();
        rowContainer.widgets.push(useCreateTextDefaultData());
        rowContainer.settingData.enableSpanConfig = true;
        rowContainer.settingData.spans = [8];
        widgetFormData.widgets.push(rowContainer);
        const { insertWidgetDefaultData } = useWidgetManage(widgetFormData, selectedWidgetId);

        insertWidgetDefaultData("text", 1, rowContainer.id);

        expect(rowContainer.widgets).toHaveLength(2);
        expect(rowContainer.settingData.spans).toEqual([8, 16]);
    });

    it("删除选中字段后选择相邻字段并同步行容器 span", () => {
        const widgetFormData = useCreateFormDefaultData() as WidgetFormData;
        const firstWidget = useCreateTextDefaultData();
        const secondWidget = useCreateTextDefaultData();
        const rowContainer = useCreateRowContainerDefaultData();
        rowContainer.widgets.push(firstWidget, secondWidget);
        rowContainer.settingData.enableSpanConfig = true;
        rowContainer.settingData.spans = [8, 16];
        widgetFormData.widgets.push(rowContainer);
        const selectedWidgetId = ref<string | null>(firstWidget.id);
        const { deleteWidget } = useWidgetManage(widgetFormData, selectedWidgetId);

        deleteWidget(firstWidget.id);

        expect(rowContainer.widgets.map(item => item.id)).toEqual([secondWidget.id]);
        expect(rowContainer.settingData.spans).toEqual([16]);
        expect(selectedWidgetId.value).toBe(secondWidget.id);
    });

    it("可以更新行容器内选中字段和表单设置", () => {
        const widgetFormData = useCreateFormDefaultData() as WidgetFormData;
        const innerWidget = useCreateTextDefaultData();
        const rowContainer = useCreateRowContainerDefaultData();
        rowContainer.widgets.push(innerWidget);
        widgetFormData.widgets.push(rowContainer);
        const selectedWidgetId = ref<string | null>(innerWidget.id);
        const { changeFormSettingData, changeSelectedWidgetSettingData } = useWidgetManage(widgetFormData, selectedWidgetId);

        changeSelectedWidgetSettingData(useTextSettingDataValueChange, "label", "内部字段");
        changeFormSettingData("inline", true);

        expect(innerWidget.formAttributes.label).toBe("内部字段");
        expect(innerWidget.settingData.label).toBe("内部字段");
        expect(widgetFormData.formAttributes.inline).toBe(true);
        expect(widgetFormData.settingData.inline).toBe(true);
    });

    it("清空组件时同时清空选中状态", () => {
        const widgetFormData = useCreateFormDefaultData() as WidgetFormData;
        const widget = useCreateTextDefaultData();
        widgetFormData.widgets.push(widget);
        const selectedWidgetId = ref<string | null>(widget.id);
        const { clearWidgets } = useWidgetManage(widgetFormData, selectedWidgetId);

        clearWidgets();

        expect(widgetFormData.widgets).toEqual([]);
        expect(selectedWidgetId.value).toBeNull();
    });
});
