/**
 * @fileoverview 文档业务公共入口；聚合创建、恢复以及带风险标记的外部导入，底层模块不反向依赖入口。
 */
import { restoreDesignerFormDocument } from "./restore";
import { validateDocumentTree, inspectWidgetDynamicContent } from "./validation";
import { type DesignerFormResult, type ParsedDesignerFormDocument, type DesignerFormDynamicContent, type InspectHtmlFunction } from "./types";
import { inspectHtmlSafety } from "@/views/utils/html-safety";
import { type WidgetRowContainerData } from "@/views/types";
import { WIDGET_ROW_CONTAINER } from "@/views/domain/widgets/adapters/row-container";
export { createDesignerFormDocument } from "./serialization";
export { restoreDesignerFormDocument } from "./restore";
export { DESIGNER_FORM_DOCUMENT_SCHEMA_VERSION } from "./types";
export type { DesignerFormDocumentV1, DesignerFormSuccess, DesignerFormFailure, DesignerFormResult, DesignerFormDynamicContent, ParsedDesignerFormDocument, InspectHtmlFunction } from "./types";

/**
 * @description 解析外部 JSON 文本、恢复运行属性并执行导入专属安全门禁。
 * @param text 用户选择文件的 UTF-8 文本。
 * @param inspectHtml HTML 安全检查函数；业务默认使用 DOMPurify 实现。
 * @returns 成功时返回可原子提交的文档和风险标记，失败时返回具体路径。
 */
export const parseDesignerFormDocumentText = function (text: string, inspectHtml: InspectHtmlFunction = inspectHtmlSafety): DesignerFormResult<ParsedDesignerFormDocument> {
    // 外部文本先通过 JSON 解析，后续流程只处理可校验的结构。
    let value: unknown;
    try {
        value = JSON.parse(text);
    } catch {
        return { ok: false, message: "JSON 文件格式错误" };
    }
    // 结构恢复与安全门禁顺序保持不变，构建属性失败直接返回。
    const restored = restoreDesignerFormDocument(value);
    if (!restored.ok) return restored;
    // 候选完全独立，调用方确认前不会覆盖画布。
    const document = restored.data;
    const treeFailure = validateDocumentTree(document.form);
    if (treeFailure) return treeFailure;
    // 汇总风险供 UI 决定确认提示，不在领域模块弹窗。
    const dynamicContent: DesignerFormDynamicContent = { hasDynamicScripts: false, hasHtml: false };
    for (let index = 0; index < document.form.widgets.length; index += 1) {
        const widgetData = document.form.widgets[index];
        const path = `$.form.widgets[${index}]`;
        if (widgetData.code === WIDGET_ROW_CONTAINER.code) {
            const row = widgetData as WidgetRowContainerData;
            for (let childIndex = 0; childIndex < row.widgets.length; childIndex += 1) {
                const failure = inspectWidgetDynamicContent(row.widgets[childIndex], `${path}.widgets[${childIndex}]`, dynamicContent, inspectHtml);
                if (failure) return failure;
            }
        } else {
            const failure = inspectWidgetDynamicContent(widgetData, path, dynamicContent, inspectHtml);
            if (failure) return failure;
        }
    }
    return { ok: true, data: { document, dynamicContent } };
};
