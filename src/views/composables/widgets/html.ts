/**
 * @fileoverview HTML 展示节点适配模块，保存原始 HTML 片段、字段身份和设计器显示状态，不参与表单校验与事件适配。
 * @remarks
 * 原始 HTML 始终保存在设置数据中，渲染器通过 DOMPurify 白名单净化后才交给 `v-html`，避免隐式改写用户编辑源码。
 */
import { randomId } from "@yujinjin/utils";
import { type WidgetHTMLData } from "../types";
import { inspectHtmlSafety, type HtmlSafetyResult } from "@/views/composables/html-safety";

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
 * @remarks defaultValue 保存原始片段供编辑和文档往返，实际渲染必须经过统一 HTML 安全边界。
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
 * @remarks 本函数保留原文，不隐式净化；设置面板与文件导入在提交前校验内容，渲染边界再次净化输出。
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

/**
 * @description 只把通过 HTML 安全检查的设置内容提交给设计器。
 * @param value 设置面板中正在编辑的原始 HTML。
 * @param commit 已通过校验时使用的组件设置更新入口。
 * @param inspect 与外部文件导入共用的 HTML 安全检查函数。
 * @returns 检查结果；失败时调用方保留输入草稿并展示错误，不修改已保存的组件值。
 * @remarks 校验成功后提交原文而非净化结果，保证再次编辑和导出 JSON 时保留用户输入。
 */
export function updateHtmlDefaultValue(value: string, commit: (value: string) => void, inspect: (html: string) => HtmlSafetyResult = inspectHtmlSafety): HtmlSafetyResult {
    const result = inspect(value);
    if (result.ok) commit(value);
    return result;
}
