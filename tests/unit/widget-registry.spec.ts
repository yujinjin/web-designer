import { describe, expect, it } from "vitest";
import { WIDGET_DEFINITIONS, createWidgetDefaultData, getWidgetComponentAttributes, getWidgetComponentEvents, getWidgetGroup, getWidgetList } from "@/views/composables/widget-registry";
import { useCreateDefaultData as useCreateFormDefaultData } from "@/views/composables/widgets/form";

const expectedWidgetListKeys = [
    "WIDGET_TEXT",
    "WIDGET_INPUT_NUMBER",
    "WIDGET_RADIO_GROUP",
    "WIDGET_CHECKBOX_GROUP",
    "WIDGET_SELECT",
    "WIDGET_CASCADER",
    "WIDGET_DATE_PICKER",
    "WIDGET_TIME_PICKER",
    "WIDGET_TIME_SELECT",
    "WIDGET_SWITCH",
    "WIDGET_RATE",
    "WIDGET_COLOR_PICKER",
    "WIDGET_SLIDER",
    "WIDGET_UPLOAD",
    "WIDGET_HTML",
    "WIDGET_ALERT",
    "WIDGET_DIVIDER",
    "WIDGET_ROW_CONTAINER"
];

const expectedGroups = [
    { groupName: "布局型组件", codes: ["row-container"] },
    { groupName: "输入型组件", codes: ["text", "input-number"] },
    { groupName: "选择型组件", codes: ["select", "cascader", "radio-group", "checkbox-group", "switch", "slider", "upload"] },
    { groupName: "日期时间型组件", codes: ["date-picker", "time-picker", "time-select"] },
    { groupName: "其他", codes: ["color-picker", "rate", "html", "alert", "divider"] }
];

describe("widget registry", () => {
    it("注册项 code 唯一且默认数据与注册元数据匹配", () => {
        const codes = WIDGET_DEFINITIONS.map(item => item.meta.code);

        expect(new Set(codes).size).toBe(codes.length);
        WIDGET_DEFINITIONS.forEach(item => {
            expect(item.createDefaultData().code).toBe(item.meta.code);
        });
    });

    it("组件分组保持现有名称、顺序和成员", () => {
        expect(
            getWidgetGroup().map(group => ({
                groupName: group.groupName,
                codes: group.children.map(item => item.code)
            }))
        ).toEqual(expectedGroups);
    });

    it("组件列表保持现有键名并覆盖全部注册项", () => {
        const widgetList = getWidgetList();

        expect(Object.keys(widgetList)).toEqual(expectedWidgetListKeys);
        expect(new Set(Object.values(widgetList).map(item => item.code))).toEqual(new Set(WIDGET_DEFINITIONS.map(item => item.meta.code)));
    });

    it("未知 code 创建默认数据时继续回退到文本组件", () => {
        expect(createWidgetDefaultData("unknown-widget").code).toBe("text");
    });

    it("已注册的属性和事件适配器可以使用默认数据执行", () => {
        const widgetFormData = useCreateFormDefaultData();

        WIDGET_DEFINITIONS.forEach(item => {
            const widgetData = item.createDefaultData();
            if (item.getAttributes) {
                expect(getWidgetComponentAttributes(widgetData, widgetData.defaultValue)).toBeTypeOf("object");
            }
            expect(getWidgetComponentEvents(widgetData, {}, widgetFormData)).toBeTypeOf("object");
        });
    });
});
