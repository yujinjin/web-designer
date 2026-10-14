/**
 * @fileoverview 编排设计文档的保存、草稿恢复、导入与导出；通过页面提供的替换入口原子提交候选。
 * @remarks 持有根数据引用而不复制第二份编辑状态；确认和消息属于 UI 层，结构及安全规则交给文档领域模块。
 */
import { onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { type WidgetFormData } from "@/views/types";
import { createDesignerFormDocument, parseDesignerFormDocumentText, restoreDesignerFormDocument } from "@/views/domain/document/document";
import { downloadJsonText, JSON_FILE_MAX_BYTES, readJsonFileText } from "@/views/utils/browser-json-file";
import useStorageStore from "@/stores/storage";

/**
 * @description 创建当前设计器的文档 UI 操作并在挂载后询问恢复草稿。
 * @param widgetFormData 页面拥有的响应式表单根对象，保存和导出读取当前值。
 * @param replaceWidgetFormData 页面提供的原子替换入口，只在校验与确认完成后调用。
 * @returns 保存、导入、导出及恢复操作；所有失败保留现有设计。
 * @remarks 生命周期注册必须发生在组件 setup 中，Store 每次直接读取草稿而不建立状态缓存。
 */
export function useDesignerDocumentActions(widgetFormData: WidgetFormData, replaceWidgetFormData: (form: WidgetFormData) => void) {
    // 本地草稿不进入 Pinia 缓存，避免读取到过期文档。
    const storageStore = useStorageStore();
    /**
     * @description 将当前表单设计投影为与导出文件同格式的文档并通过 Storage Store 保存。
     * @returns 无返回值；成功或失败均通过 Element Plus 消息反馈。
     * @remarks 领域投影先完成 JSON 转换并排除 componentAttributes，Storage Store 只负责不缓存的持久化写入。
     */
    const handleSaveLocalDraft = function (): void {
        // 领域转换完成后才进入存储、下载或状态提交阶段。
        const documentResult = createDesignerFormDocument(widgetFormData);
        if (!documentResult.ok) {
            ElMessage.error(documentResult.message);
            return;
        }
        try {
            storageStore.setDesignerFormDraft(documentResult.data);
            ElMessage.success("当前设计已保存到本地");
        } catch {
            ElMessage.error("本地保存失败，请检查浏览器存储权限或空间");
        }
    };

    /**
     * @description 生成当前设计器 V1 文档并下载格式化 JSON 文件。
     * @returns 无返回值；序列化、大小或浏览器下载失败时显示错误反馈。
     */
    const handleExportJson = function (): void {
        // 领域转换完成后才进入存储、下载或状态提交阶段。
        const documentResult = createDesignerFormDocument(widgetFormData);
        if (!documentResult.ok) {
            ElMessage.error(documentResult.message);
            return;
        }
        try {
            // 美化仅影响文件可读性，保存与导出使用同一协议。
            const text = JSON.stringify(documentResult.data, null, 4);
            if (new TextEncoder().encode(text).byteLength > JSON_FILE_MAX_BYTES) {
                ElMessage.error("导出失败：JSON 文件不能超过 2 MiB");
                return;
            }
            // 默认文件名避免同次会话导出覆盖用户难以区分的同名文件。
            const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15);
            downloadJsonText(text, `web-designer-form-${timestamp}.json`);
            ElMessage.success("JSON 导出成功");
        } catch {
            ElMessage.error("JSON 导出失败，请检查浏览器下载权限");
        }
    };

    /**
     * @description 读取、校验并在用户确认后原子导入表单设计文档。
     * @param file Center Panel 文件选择器提供的单个 JSON 文件。
     * @returns Promise 完成后无返回值；任一失败或取消分支均保持当前设计及本地草稿不变。
     * @remarks 动态脚本只编译不执行；HTML 发现任何被白名单移除的高危内容会直接拒绝，合法动态内容需额外风险确认。
     */
    const handleImportJson = async function (file: File): Promise<void> {
        // 文件大小与文本读取属于浏览器边界，不直接对未读取的候选执行恢复。
        const fileResult = await readJsonFileText(file, JSON_FILE_MAX_BYTES);
        if (!fileResult.ok) {
            ElMessage.error(fileResult.message);
            return;
        }
        // 领域转换完成后才进入存储、下载或状态提交阶段。
        const documentResult = parseDesignerFormDocumentText(fileResult.data);
        if (!documentResult.ok) {
            ElMessage.error(`JSON 导入失败：${documentResult.path ? `${documentResult.path} ` : ""}${documentResult.message}`);
            return;
        }
        // 风险标记只决定确认措辞，合法动态内容仍由用户选择是否应用。
        const hasDynamicContent = documentResult.data.dynamicContent.hasDynamicScripts || documentResult.data.dynamicContent.hasHtml;
        // 普通导入也需覆盖确认，避免用户误操作丢失当前编辑。
        const message = hasDynamicContent
            ? "导入将覆盖当前设计。该文件包含动态脚本或 HTML 内容，后续渲染或交互时可能执行代码、发起请求或展示自定义内容。请确认文件来源可信，是否继续？"
            : "导入将覆盖当前设计，是否继续？";
        try {
            await ElMessageBox.confirm(message, "导入 JSON", {
                type: hasDynamicContent ? "warning" : "info",
                confirmButtonText: "确认导入",
                cancelButtonText: "取消"
            });
        } catch {
            return;
        }
        replaceWidgetFormData(documentResult.data.document.form);
        ElMessage.success("JSON 导入成功");
    };

    /**
     * @description 检测上次保存的草稿，并在用户确认后恢复到当前设计器。
     * @returns Promise 完成后无返回值；无草稿或用户取消时保留默认设计。
     * @remarks 读取、结构校验和运行属性构建全部发生在状态提交之前，任何失败都不会产生半更新表单，也不会删除原草稿。
     */
    const restoreLastDesignerFormDraft = async function (): Promise<void> {
        // localStorage 来源不可信，结构校验前不能断言为 WidgetFormData。
        let storedDraft: unknown;
        try {
            storedDraft = storageStore.getDesignerFormDraft();
        } catch {
            ElMessage.error("上次保存的设计读取失败，请检查浏览器存储权限");
            return;
        }
        if (storedDraft === undefined || storedDraft === null) return;
        // 领域转换完成后才进入存储、下载或状态提交阶段。
        const documentResult = restoreDesignerFormDocument(storedDraft);
        if (!documentResult.ok) {
            ElMessage.error(`上次保存的设计读取失败：${documentResult.message}`);
            return;
        }
        // 时间缺失仍允许恢复，显示提示不改变文档协议。
        const savedAtText = documentResult.data.savedAt ? `（保存时间：${new Date(documentResult.data.savedAt).toLocaleString("zh-CN", { hour12: false })}）` : "";
        try {
            await ElMessageBox.confirm(`检测到上次保存的设计${savedAtText}，是否恢复继续编辑？`, "恢复上次设计", {
                type: "info",
                confirmButtonText: "恢复",
                cancelButtonText: "取消"
            });
        } catch {
            return;
        }
        replaceWidgetFormData(documentResult.data.form);
        ElMessage.success("已恢复上次保存的设计");
    };

    /**
     * @description 页面挂载后检查草稿并向用户确认是否恢复。
     * @remarks 不在 setup 中弹窗，确保工作区已装配；取消与读取失败不清空草稿。
     */
    onMounted(() => {
        void restoreLastDesignerFormDraft();
    });
    return { handleSaveLocalDraft, handleExportJson, handleImportJson, restoreLastDesignerFormDraft };
}
