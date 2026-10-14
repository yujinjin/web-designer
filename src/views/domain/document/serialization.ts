/**
 * @fileoverview 将运行表单投影为独立 JSON 文档，递归排除 componentAttributes 而不修改源对象。
 */
import { type DesignerFormResult, type DesignerFormDocumentV1, DESIGNER_FORM_DOCUMENT_SCHEMA_VERSION, createDesignerFormFailure } from "./types";
import { type WidgetFormData } from "@/views/types";

/**
 * @description 从当前设计创建带保存时间且不含运行属性的独立 JSON 文档。
 * @param form 当前表单设计数据。
 * @param now 本次保存或导出时间；业务默认使用当前时间。
 * @returns 成功时返回同一种可持久化文档，序列化或时间转换失败时返回错误。
 * @remarks componentAttributes 在 stringify 遍历阶段递归排除，源对象不会执行 delete 或其他写操作。
 */
export const createDesignerFormDocument = function (form: WidgetFormData, now = new Date()): DesignerFormResult<DesignerFormDocumentV1> {
    try {
        const text = JSON.stringify(
            {
                schemaVersion: DESIGNER_FORM_DOCUMENT_SCHEMA_VERSION,
                savedAt: now.toISOString(),
                form
            },
            (key, value) => (key === "componentAttributes" ? undefined : value)
        );
        return { ok: true, data: JSON.parse(text) as DesignerFormDocumentV1 };
    } catch {
        return createDesignerFormFailure("当前设计无法转换为 JSON 数据");
    }
};
