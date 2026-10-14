/**
 * @fileoverview 表单根节点的默认工厂和设置同步适配；不持有 Vue 状态，初始化脚本只存储而不执行。
 */
import { randomId } from "@yujinjin/utils";
import { type WidgetFormData } from "@/views/types";
import { extractFunctionBody } from "@/views/utils/widget-scripts";

/** 表单根节点的稳定类型标识；用于生成实例 id，不参与普通组件注册分组。 */
export const WIDGET_FORM_CODE = "form";

/**
 * @description 创建一份独立的表单设计数据。
 * @returns 尚未包含字段的新表单设计数据。
 * @remarks `settingData` 保存设置面板使用的可编辑值，`formAttributes` 保存传给 ElForm 的运行态属性，二者分离是为了避免渲染组件直接依赖设置面板结构。
 */
export function useCreateDefaultData(): WidgetFormData {
    return {
        id: WIDGET_FORM_CODE.replace(/-/g, "_") + "_" + randomId(),
        code: WIDGET_FORM_CODE,
        formAttributes: {
            inline: false,
            labelPosition: "left",
            labelWidth: 120,
            disabled: false
        },
        componentFunctions: {
            init: null
        },
        settingData: {
            inline: false,
            labelPosition: "left",
            labelWidth: 120,
            onInit: `function onInit(widgetFormData, formData) {
    // 请在这里编写函数体逻辑，可直接使用 widgetFormData/formData 参数
}`
        },
        widgets: []
    };
}

/**
 * @description 同步表单级设置。
 * @param data 将被原地更新的表单设计数据。
 * @param fileName 发生变化的设置字段。
 * @param value 设置字段的新值。
 * @returns 无返回值。
 * @remarks 可直接渲染的字段写入 formAttributes，脚本字段只保存函数体到 componentFunctions，最后始终保留设置面板原文。onInit 必须是完整函数文本，格式不符合约定时不会主动修复。
 */
export function useSettingDataValueChange(data: WidgetFormData, fileName: keyof WidgetFormData["settingData"], value: any) {
    switch (fileName) {
        case "inline":
        case "labelPosition":
        case "labelWidth":
            data.formAttributes[fileName] = value;
            break;
        case "onInit": {
            // 运行时使用 new Function 注入上下文，只需要函数体；设置态保留完整源码，编辑器才能再次展示函数声明和参数提示。
            data.componentFunctions.init = extractFunctionBody(value);
        }
    }
    (data.settingData as any)[fileName] = value;
}
