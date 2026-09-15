/**
 * @fileoverview 验证 Widget 运行属性可从设计源完整构建、由设置面板局部同步，并在复制后恢复。
 */
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildWidgetComponentAttributes, WIDGET_DEFINITIONS } from "@/views/composables/widget-registry";
import { cloneWidgetData } from "@/views/composables/widget-tree";
import { useCreateDefaultData as createRowContainerDefaultData } from "@/views/composables/widgets/row-container";
import { useCreateDefaultData as createTextDefaultData, useSettingDataValueChange as changeTextSetting } from "@/views/composables/widgets/text";
import { useCreateDefaultData as createSelectDefaultData, useSettingDataValueChange as changeSelectSetting } from "@/views/composables/widgets/select";
import { useCreateDefaultData as createSwitchDefaultData, useSettingDataValueChange as changeSwitchSetting } from "@/views/composables/widgets/switch";
import { useCreateDefaultData as createDatePickerDefaultData, useSettingDataValueChange as changeDatePickerSetting } from "@/views/composables/widgets/date-picker";
import { useCreateDefaultData as createUploadDefaultData, useSettingDataValueChange as changeUploadSetting } from "@/views/composables/widgets/upload";
import { useCreateDefaultData as createInputNumberDefaultData, useSettingDataValueChange as changeInputNumberSetting } from "@/views/composables/widgets/input-number";
import { useCreateDefaultData as createRadioGroupDefaultData, useSettingDataValueChange as changeRadioGroupSetting } from "@/views/composables/widgets/radio-group";
import { useCreateDefaultData as createCheckboxGroupDefaultData, useSettingDataValueChange as changeCheckboxGroupSetting } from "@/views/composables/widgets/checkbox-group";
import { useCreateDefaultData as createCascaderDefaultData, useSettingDataValueChange as changeCascaderSetting } from "@/views/composables/widgets/cascader";
import { useCreateDefaultData as createTimePickerDefaultData, useSettingDataValueChange as changeTimePickerSetting } from "@/views/composables/widgets/time-picker";
import { useCreateDefaultData as createTimeSelectDefaultData, useSettingDataValueChange as changeTimeSelectSetting } from "@/views/composables/widgets/time-select";
import { useCreateDefaultData as createRateDefaultData, useSettingDataValueChange as changeRateSetting } from "@/views/composables/widgets/rate";
import { useCreateDefaultData as createColorPickerDefaultData, useSettingDataValueChange as changeColorPickerSetting } from "@/views/composables/widgets/color-picker";
import { useCreateDefaultData as createSliderDefaultData, useSettingDataValueChange as changeSliderSetting } from "@/views/composables/widgets/slider";
import { useCreateDefaultData as createAlertDefaultData, useSettingDataValueChange as changeAlertSetting } from "@/views/composables/widgets/alert";
import { useCreateDefaultData as createDividerDefaultData, useSettingDataValueChange as changeDividerSetting } from "@/views/composables/widgets/divider";

/**
 * @description 将属性对象中的函数替换为稳定标记，供全量重建结果比较。
 * @param attributes 待标准化的组件属性。
 * @returns 可进行深度相等比较的新对象。
 */
const normalizeFunctions = function (attributes: Record<string, any> | undefined): Record<string, any> | undefined {
    if (!attributes) return attributes;
    return Object.fromEntries(
        Object.entries(attributes)
            .filter(([, value]) => value !== null && value !== undefined)
            .map(([key, value]) => [key, typeof value === "function" ? "[function]" : value])
    );
};

const widgetRendererSource = readFileSync(new URL("../../src/views/components/widget-renderer.vue", import.meta.url), "utf-8");
const widgetRuntimeUrl = new URL("../../src/views/composables/widget-runtime.ts", import.meta.url);
const widgetAttributeUtilsSource = readFileSync(new URL("../../src/views/composables/widget-attribute-utils.ts", import.meta.url), "utf-8");
const widgetModuleNames = [
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
    "alert",
    "divider"
] as const;
const widgetModuleSources = widgetModuleNames.map(moduleName => ({
    moduleName,
    source: readFileSync(new URL(`../../src/views/composables/widgets/${moduleName}.ts`, import.meta.url), "utf-8")
}));

describe("widget runtime attributes", () => {
    it("注册表不维护重复的组件属性能力标志", () => {
        WIDGET_DEFINITIONS.forEach(definition => {
            expect(definition).not.toHaveProperty("hasComponentAttributes");
        });
    });

    it("删除缓存后仍能从设计源构建完整新属性且不写回", () => {
        WIDGET_DEFINITIONS.filter(definition => definition.getAttributes).forEach(definition => {
            const widgetData = definition.createDefaultData();
            const originalAttributes = widgetData.componentAttributes;
            delete (widgetData as { componentAttributes?: Record<string, any> }).componentAttributes;

            const first = buildWidgetComponentAttributes(widgetData);
            const second = buildWidgetComponentAttributes(widgetData);

            expect(first).toBeTypeOf("object");
            expect(first).not.toBe(second);
            expect(widgetData.componentAttributes).toBeUndefined();
            expect(originalAttributes).toBeTypeOf("object");
        });
    });

    it("组件工厂初始缓存与设计源构建结果一致", () => {
        WIDGET_DEFINITIONS.filter(definition => definition.getAttributes).forEach(definition => {
            const widgetData = definition.createDefaultData();

            expect(normalizeFunctions(widgetData.componentAttributes)).toEqual(normalizeFunctions(buildWidgetComponentAttributes(widgetData)));
        });
    });

    it("组件工厂显式保留运行属性默认对象且不调用属性构建器初始化", () => {
        widgetModuleSources.forEach(({ moduleName, source }) => {
            const factorySource = source.slice(source.indexOf("export function useCreateDefaultData"), source.indexOf("export function useSettingDataValueChange"));
            expect(factorySource, `${moduleName} 工厂应显式声明 componentAttributes`).toContain("componentAttributes:");
            expect(factorySource, `${moduleName} 工厂不应调用 useAttributes 初始化`).not.toContain("initializeWidgetComponentAttributes");
        });
    });

    it("设置同步直接维护组件运行属性而不经过通用读写辅助方法", () => {
        expect(widgetAttributeUtilsSource).not.toContain("getRequiredWidgetComponentAttributes");
        expect(widgetAttributeUtilsSource).not.toContain("setWidgetComponentAttribute");
        expect(widgetAttributeUtilsSource).not.toContain("initializeWidgetComponentAttributes");
        widgetModuleSources.forEach(({ source }) => {
            expect(source).not.toContain("getRequiredWidgetComponentAttributes");
            expect(source).not.toContain("setWidgetComponentAttribute");
            expect(source).not.toContain("initializeWidgetComponentAttributes");
        });
    });

    it("注册表属性构建使用严格组件识别", () => {
        const widgetData = createTextDefaultData();
        delete (widgetData as { componentAttributes?: Record<string, any> }).componentAttributes;

        expect(buildWidgetComponentAttributes(widgetData)).toMatchObject({ type: "text", placeholder: "请输入内容" });
        expect(() => buildWidgetComponentAttributes({ ...widgetData, code: "unknown" })).toThrow("未知组件类型：unknown");
    });

    it("表单文档与预览职责不提前放入 Widget 运行模块", () => {
        expect(existsSync(widgetRuntimeUrl)).toBe(false);
    });

    it("设置变更后缓存始终等于从设计源重新构建的结果", () => {
        const cases = [
            [createTextDefaultData(), changeTextSetting, "type", "textarea"],
            [createTextDefaultData(), changeTextSetting, "formatter", "function formatter(value) {\n return String(value);\n}"],
            [createSelectDefaultData(), changeSelectSetting, "placeholder", "重新选择"],
            [createSwitchDefaultData(), changeSwitchSetting, "beforeChange", "async function beforeChange() {\n return true;\n}"],
            [createDatePickerDefaultData(), changeDatePickerSetting, "format", "YYYY/MM/DD"],
            [createUploadDefaultData(), changeUploadSetting, "action", "/upload"]
        ] as const;

        cases.forEach(([widgetData, changeSetting, fieldName, value]) => {
            changeSetting(widgetData as never, fieldName as never, value);
            expect(normalizeFunctions(widgetData.componentAttributes)).toEqual(normalizeFunctions(buildWidgetComponentAttributes(widgetData)));
        });
    });

    it("设置面板只原地更新受影响的运行属性", () => {
        const widgetData = createTextDefaultData();
        changeTextSetting(widgetData, "formatter", "function formatter(value) {\n return String(value);\n}");
        const componentAttributes = widgetData.componentAttributes;
        const formatter = componentAttributes?.formatter;

        changeTextSetting(widgetData, "placeholder", "新的占位文案");

        expect(widgetData.componentAttributes).toBe(componentAttributes);
        expect(widgetData.componentAttributes?.formatter).toBe(formatter);
        expect(widgetData.componentAttributes?.placeholder).toBe("新的占位文案");
    });

    it("动态属性脚本只增删对应运行函数且不替换属性对象", () => {
        const widgetData = createUploadDefaultData();
        const componentAttributes = widgetData.componentAttributes;

        changeUploadSetting(widgetData, "onPreview", "function onPreview(uploadFile) {\n return uploadFile.name;\n}");

        expect(widgetData.componentAttributes).toBe(componentAttributes);
        expect(widgetData.componentAttributes?.onPreview).toBeTypeOf("function");

        changeUploadSetting(widgetData, "onPreview", null);

        expect(widgetData.componentAttributes).toBe(componentAttributes);
        expect(widgetData.componentAttributes).not.toHaveProperty("onPreview");
    });

    it("设置生成的选择器动态方法保留 Widget 运行上下文", () => {
        const widgetData = createSelectDefaultData();
        changeSelectSetting(widgetData, "remoteMethod", "function remoteMethod(query, widgetSelectData) {\n widgetSelectData.settingData.placeholder = query;\n}");

        widgetData.componentAttributes?.remoteMethod?.("远程搜索");

        expect(widgetData.settingData.placeholder).toBe("远程搜索");
    });

    it("设置同步只接受已初始化运行属性的设计态 Widget", () => {
        const widgetData = createTextDefaultData();
        delete (widgetData as { componentAttributes?: Record<string, any> }).componentAttributes;

        expect(() => changeTextSetting(widgetData, "placeholder", "无效更新")).toThrow(TypeError);
    });

    it("复制函数直接恢复普通节点和行容器子节点的动态运行属性", () => {
        const widgetData = createTextDefaultData();
        changeTextSetting(widgetData, "formatter", "function formatter(value) {\n return '复制:' + value;\n}");
        const rowContainer = createRowContainerDefaultData();
        rowContainer.widgets.push(widgetData);

        const copiedWidgetData = cloneWidgetData(rowContainer);

        expect(copiedWidgetData.widgets[0].componentAttributes?.formatter?.("A")).toBe("复制:A");
    });

    it("字段型组件工厂保留表单项默认属性", () => {
        WIDGET_DEFINITIONS.filter(definition => !["html", "alert", "divider", "row-container"].includes(definition.meta.code))
            .map(definition => definition.createDefaultData())
            .forEach(widgetData => {
                expect(widgetData.formAttributes).toBeTypeOf("object");
                expect(widgetData.formAttributes?.prop).toBe(widgetData.id);
            });
    });

    it("全部组件设置字段局部同步后仍与完整属性物化结果等价", () => {
        const cases = [
            [createTextDefaultData, changeTextSetting],
            [createInputNumberDefaultData, changeInputNumberSetting],
            [createRadioGroupDefaultData, changeRadioGroupSetting],
            [createCheckboxGroupDefaultData, changeCheckboxGroupSetting],
            [createSelectDefaultData, changeSelectSetting],
            [createCascaderDefaultData, changeCascaderSetting],
            [createDatePickerDefaultData, changeDatePickerSetting],
            [createTimePickerDefaultData, changeTimePickerSetting],
            [createTimeSelectDefaultData, changeTimeSelectSetting],
            [createSwitchDefaultData, changeSwitchSetting],
            [createRateDefaultData, changeRateSetting],
            [createColorPickerDefaultData, changeColorPickerSetting],
            [createSliderDefaultData, changeSliderSetting],
            [createUploadDefaultData, changeUploadSetting],
            [createAlertDefaultData, changeAlertSetting],
            [createDividerDefaultData, changeDividerSetting]
        ] as const;

        cases.forEach(([createDefaultData, changeSetting]) => {
            const widgetData = createDefaultData();
            const componentAttributes = widgetData.componentAttributes;
            Object.entries(widgetData.settingData).forEach(([fieldName, value]) => {
                changeSetting(widgetData as never, fieldName as never, value);
                expect(widgetData.componentAttributes, `${widgetData.code}.${fieldName} 不应替换运行属性对象`).toBe(componentAttributes);
                expect(normalizeFunctions(widgetData.componentAttributes), `${widgetData.code}.${fieldName} 的局部同步结果应与完整物化一致`).toEqual(
                    normalizeFunctions(buildWidgetComponentAttributes(widgetData))
                );
            });
        });
    });

    it("Widget 渲染器只读取已物化的运行属性缓存", () => {
        expect(widgetRendererSource).not.toContain("getWidgetComponentAttributes");
        expect(widgetRendererSource).not.toContain("buildWidgetComponentAttributes");
        expect(widgetRendererSource).not.toContain('v-bind="widgetData.componentAttributes"');
        expect(widgetRendererSource.match(/v-bind="renderComponentAttributes"/g)?.length).toBe(16);
    });

    it("复杂组件从字符串函数体构建可调用属性且支持清除", async () => {
        const textWidget = createTextDefaultData();
        changeTextSetting(textWidget, "formatter", "function formatter(value) {\n return '文本:' + value;\n}");
        expect(textWidget.componentAttributes?.formatter?.("A")).toBe("文本:A");
        changeTextSetting(textWidget, "formatter", null);
        expect(textWidget.componentAttributes).not.toHaveProperty("formatter");

        const uploadWidget = createUploadDefaultData();
        changeUploadSetting(uploadWidget, "data", "async function data(rawFile) {\n return { name: rawFile.name };\n}");
        changeUploadSetting(uploadWidget, "httpRequest", "function httpRequest(options) {\n return options.action;\n}");
        expect(uploadWidget.componentAttributes?.data?.({ name: "a.txt" } as File)).toEqual({ name: "a.txt" });
        expect(uploadWidget.componentAttributes?.httpRequest?.({ action: "/upload" } as never)).toBe("/upload");
    });
});
