/**
 * @fileoverview 创建隔离的表单预览快照，并执行预览表单初始化脚本。
 * @remarks 快照沿用统一文档投影与恢复边界；初始化脚本只接收预览副本，不访问设计器根状态。
 */
import { createDesignerFormDocument, restoreDesignerFormDocument, type DesignerFormResult } from "@/views/composables/designer-form-document";
import { type WidgetFormData } from "@/views/composables/types";

/**
 * @description 从当前设计创建完成运行属性恢复的独立预览快照。
 * @param source 当前设计器表单数据。
 * @returns 成功时返回独立 WidgetFormData，失败时返回文档领域错误。
 */
export const createDesignerFormPreviewSnapshot = function (source: WidgetFormData): DesignerFormResult<WidgetFormData> {
    const documentResult = createDesignerFormDocument(source);
    if (!documentResult.ok) return documentResult;
    const restoredResult = restoreDesignerFormDocument(documentResult.data);
    return restoredResult.ok ? { ok: true, data: restoredResult.data.form } : restoredResult;
};

/**
 * @description 执行一次预览表单初始化函数，并统一等待同步或异步结果。
 * @param widgetFormData 可由初始化脚本修改的响应式预览表单副本。
 * @param formData 当前预览字段运行值。
 * @returns 初始化函数完成后的 Promise；没有配置函数体时立即完成。
 * @throws {Error} 初始化函数语法错误、同步异常或异步拒绝时向调用方传播。
 */
export const runDesignerFormPreviewInit = async function (widgetFormData: WidgetFormData, formData: Record<string, any>): Promise<void> {
    const functionBody = widgetFormData.componentFunctions.init;
    if (!functionBody) return;
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (...args: string[]) => (...params: any[]) => Promise<any>;
    await new AsyncFunction("widgetFormData", "formData", functionBody)(widgetFormData, formData);
};
