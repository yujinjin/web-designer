/**
 * @fileoverview HTML 展示节点适配模块，保存原始 HTML 片段、字段身份和设计器显示状态，不参与表单校验与事件适配。
 * @remarks
 * 渲染器通过 `v-html` 直接输出 defaultValue，本模块刻意不解析或净化内容，以免编辑器源码被隐式改写。
 * 因此 HTML 必须来自可信设计配置；若接收用户输入，需要在进入设计器前完成清洗，否则存在 XSS 风险。
 */
import { randomId } from "@yujinjin/utils";
import { type WidgetHTMLData } from "../types";

/** 注册表使用的 HTML 展示节点稳定 code 与组件库展示元数据。 */
export const WIDGET_HTML = {
    code: "html",
    name: "HTML",
    description: "HTML",
    icon: "icon-html"
};

/**
 * @description 创建 HTML 展示节点数据。
 * @returns 相互隔离的新 HTML 节点数据。
 * @remarks defaultValue 保存将由渲染器通过 v-html 输出的原始片段。该内容必须来自可信设计配置，本层不做清洗；包含不可信输入时会有 XSS 风险。
 */
export function useCreateDefaultData(): WidgetHTMLData {
    // 根据组件 code 生成当前设计节点的唯一 ID。
    const id = WIDGET_HTML.code.replace(/-/g, "_") + "_" + randomId();
    return {
        id,
        code: WIDGET_HTML.code,
        name: WIDGET_HTML.name,
        isShow: true,
        defaultValue: "<b>html text</b>",
        propName: id,
        settingData: {
            propName: id,
            defaultValue: "<b>html text</b>",
            control: ["isShow"]
        }
    };
}

/**
 * @description 同步 HTML 内容、节点身份和显示状态。
 * @param widgetHTMLData 将被原地更新的 HTML 节点数据。
 * @param fileName 发生变化的设置字段。
 * @param value 设置字段的新值。
 * @returns 无返回值。
 * @remarks 这里只保存原文，不解析或净化 HTML，避免编辑器内容被隐式改写；安全过滤应在配置进入设计器前完成。
 */
export function useSettingDataValueChange(widgetHTMLData: WidgetHTMLData, fileName: keyof WidgetHTMLData["settingData"], value: any) {
    switch (fileName) {
        case "defaultValue":
            // 渲染器读取根级 defaultValue，设置态副本只负责面板回显，因此两者需要同步。
            widgetHTMLData.defaultValue = value;
            break;
        case "propName":
            widgetHTMLData.propName = value;
            break;
        case "control":
            widgetHTMLData.isShow = value.includes("isShow");
            break;
    }
    widgetHTMLData.settingData[fileName] = value;
}
