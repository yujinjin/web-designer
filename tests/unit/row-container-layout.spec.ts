import { describe, expect, it } from "vitest";
import { nextTick, reactive, ref } from "vue";
import { calcAverageSpans, normalizeRowContainerSpan } from "@/views/composables/row-container-layout";
import { type WidgetFormData } from "@/views/composables/types";
import useWidgetManage from "@/views/composables/widget-manage";
import { isRowContainerWidget } from "@/views/composables/widget-tree";
import { useCreateDefaultData as useCreateFormDefaultData, useFlatWidgetList, useFormRenderData, useSubmitFormData } from "@/views/composables/widgets/form";
import { useCreateDefaultData as useCreateRowContainerDefaultData } from "@/views/composables/widgets/row-container";
import { useCreateDefaultData as useCreateTextDefaultData } from "@/views/composables/widgets/text";

describe("row container layout", () => {
    it("自动平均分配 24 栅格并把余数分配给前面的组件", () => {
        expect(calcAverageSpans(0)).toEqual([]);
        expect(calcAverageSpans(1)).toEqual([24]);
        expect(calcAverageSpans(2)).toEqual([12, 12]);
        expect(calcAverageSpans(3)).toEqual([8, 8, 8]);
        expect(calcAverageSpans(4)).toEqual([6, 6, 6, 6]);
        expect(calcAverageSpans(5)).toEqual([5, 5, 5, 5, 4]);
        expect(calcAverageSpans(6)).toEqual([4, 4, 4, 4, 4, 4]);
    });

    it("手动 span 保存时会归一到 1 到 24 的整数", () => {
        expect(normalizeRowContainerSpan(null)).toBe(1);
        expect(normalizeRowContainerSpan(0)).toBe(1);
        expect(normalizeRowContainerSpan(1.8)).toBe(1);
        expect(normalizeRowContainerSpan(25)).toBe(24);
    });

    it("表单字段遍历会扁平化顶层普通组件和行容器内部普通组件", () => {
        const formData = useCreateFormDefaultData();
        const outerWidget = useCreateTextDefaultData();
        const innerWidget = useCreateTextDefaultData();
        const rowContainer = useCreateRowContainerDefaultData();
        rowContainer.widgets.push(innerWidget);
        rowContainer.settingData.spans = [24];
        formData.widgets.push(outerWidget, rowContainer);

        expect(useFlatWidgetList(formData.widgets).map(item => item.id)).toEqual([outerWidget.id, innerWidget.id]);
    });

    it("表单字段只在首次创建时使用默认值并保留合法空值", async () => {
        const widgetFormData = reactive(useCreateFormDefaultData() as object) as WidgetFormData;
        const nullWidget = useCreateTextDefaultData();
        const falseWidget = useCreateTextDefaultData();
        const zeroWidget = useCreateTextDefaultData();
        const emptyWidget = useCreateTextDefaultData();
        nullWidget.defaultValue = "默认值";
        widgetFormData.widgets.push(nullWidget, falseWidget, zeroWidget, emptyWidget);

        const renderData = useFormRenderData(widgetFormData);
        expect(renderData[nullWidget.id]).toBe("默认值");

        renderData[nullWidget.id] = null;
        renderData[falseWidget.id] = false;
        renderData[zeroWidget.id] = 0;
        renderData[emptyWidget.id] = "";
        const addedWidget = useCreateTextDefaultData();
        widgetFormData.widgets.push(addedWidget);
        await nextTick();

        expect(renderData[nullWidget.id]).toBeNull();
        expect(renderData[falseWidget.id]).toBe(false);
        expect(renderData[zeroWidget.id]).toBe(0);
        expect(renderData[emptyWidget.id]).toBe("");

        widgetFormData.widgets.reverse();
        await nextTick();
        expect(renderData[nullWidget.id]).toBeNull();

        widgetFormData.widgets.splice(
            widgetFormData.widgets.findIndex(item => item.id === addedWidget.id),
            1
        );
        await nextTick();
        expect(renderData[nullWidget.id]).toBeNull();
    });

    it("删除字段或清空组件时会同步清理渲染数据", async () => {
        const widgetFormData = reactive(useCreateFormDefaultData() as object) as WidgetFormData;
        const outerWidget = useCreateTextDefaultData();
        const innerWidget = useCreateTextDefaultData();
        const rowContainer = useCreateRowContainerDefaultData();
        rowContainer.widgets.push(innerWidget);
        rowContainer.settingData.spans = [24];
        widgetFormData.widgets.push(outerWidget, rowContainer);
        const renderData = useFormRenderData(widgetFormData);

        const reactiveRowContainer = widgetFormData.widgets[1] as typeof rowContainer;
        reactiveRowContainer.widgets.splice(0, 1);
        await nextTick();
        expect(renderData).not.toHaveProperty(innerWidget.id);
        expect(renderData).toHaveProperty(outerWidget.id);

        widgetFormData.widgets.splice(0, widgetFormData.widgets.length);
        await nextTick();
        expect(Object.keys(renderData)).toEqual([]);
    });

    it("修改已有字段的默认值不会覆盖当前渲染值", async () => {
        const widgetFormData = reactive(useCreateFormDefaultData() as object) as WidgetFormData;
        const widget = useCreateTextDefaultData();
        widget.defaultValue = "首次默认值";
        widgetFormData.widgets.push(widget);
        const renderData = useFormRenderData(widgetFormData);

        widget.defaultValue = "修改后的默认值";
        widget.settingData.defaultValue = "修改后的默认值";
        await nextTick();

        expect(renderData[widget.id]).toBe("首次默认值");
    });

    it("行容器内部新增普通组件时最多 6 个且自动更新 span", () => {
        const widgetFormData = useCreateFormDefaultData() as WidgetFormData;
        const selectedWigetId = ref<string | null>(null);
        const rowContainer = useCreateRowContainerDefaultData();
        widgetFormData.widgets.push(rowContainer);
        const { insertWidgetDefaultData } = useWidgetManage(widgetFormData, selectedWigetId);

        for (let index = 0; index < 6; index++) {
            insertWidgetDefaultData("text", index, rowContainer.id);
        }
        insertWidgetDefaultData("text", 6, rowContainer.id);
        insertWidgetDefaultData("row-container", 6, rowContainer.id);

        expect(rowContainer.widgets).toHaveLength(6);
        expect(rowContainer.settingData.spans).toEqual([4, 4, 4, 4, 4, 4]);
    });

    it("行容器内部排序会让 span 跟随组件移动", () => {
        const widgetFormData = useCreateFormDefaultData() as WidgetFormData;
        const selectedWigetId = ref<string | null>(null);
        const rowContainer = useCreateRowContainerDefaultData();
        const firstWidget = useCreateTextDefaultData();
        const secondWidget = useCreateTextDefaultData();
        rowContainer.widgets.push(firstWidget, secondWidget);
        rowContainer.settingData.enableSpanConfig = true;
        rowContainer.settingData.spans = [8, 16];
        widgetFormData.widgets.push(rowContainer);
        const { updateWidgetOrder } = useWidgetManage(widgetFormData, selectedWigetId);

        updateWidgetOrder(0, 1, rowContainer.id);

        expect(rowContainer.widgets.map(item => item.id)).toEqual([secondWidget.id, firstWidget.id]);
        expect(rowContainer.settingData.spans).toEqual([16, 8]);
    });

    it("复制行容器会深拷贝内部组件并重置字段标识", () => {
        const widgetFormData = useCreateFormDefaultData() as WidgetFormData;
        const selectedWigetId = ref<string | null>(null);
        const rowContainer = useCreateRowContainerDefaultData();
        const innerWidget = useCreateTextDefaultData();
        rowContainer.widgets.push(innerWidget);
        rowContainer.settingData.spans = [24];
        widgetFormData.widgets.push(rowContainer);
        const { copyWidgetData } = useWidgetManage(widgetFormData, selectedWigetId);

        copyWidgetData(1, 0);
        const copiedRowContainer = widgetFormData.widgets[1];
        expect(isRowContainerWidget(copiedRowContainer)).toBe(true);
        if (!isRowContainerWidget(copiedRowContainer)) {
            throw new Error("复制后的组件应为行容器");
        }

        expect(copiedRowContainer.id).not.toBe(rowContainer.id);
        expect(copiedRowContainer.code).toBe(rowContainer.code);
        expect(copiedRowContainer.widgets[0].id).not.toBe(innerWidget.id);
        expect(copiedRowContainer.widgets[0].propName).toBe(copiedRowContainer.widgets[0].id);
        expect(copiedRowContainer.widgets[0].settingData?.propName).toBe(copiedRowContainer.widgets[0].id);
        expect(copiedRowContainer.widgets[0].formAttributes?.prop).toBe(copiedRowContainer.widgets[0].id);
        expect(copiedRowContainer.settingData.spans).toEqual([24]);
    });

    it("渲染数据和提交数据包含行容器内部普通组件", () => {
        const widgetFormData = useCreateFormDefaultData() as WidgetFormData;
        const innerWidget = useCreateTextDefaultData();
        const rowContainer = useCreateRowContainerDefaultData();
        rowContainer.widgets.push(innerWidget);
        rowContainer.settingData.spans = [24];
        widgetFormData.widgets.push(rowContainer);

        const renderData = useFormRenderData(widgetFormData);
        renderData[innerWidget.id] = "内部值";

        expect(renderData).toHaveProperty(innerWidget.id);
        expect(useSubmitFormData(widgetFormData, renderData)).toEqual({ [innerWidget.propName as string]: "内部值" });
    });
});
