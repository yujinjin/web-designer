/**
 * @fileoverview 提供无 Widget 依赖的浏览器 JSON 文件读取和文本下载能力。
 * @remarks 文件大小在读取前校验；下载始终在 finally 中移除临时节点并释放 Object URL。
 */

/** 导入和导出的 JSON 文档最大 UTF-8 字节数。 */
export const JSON_FILE_MAX_BYTES = 2 * 1024 * 1024;

/** JSON 文件操作成功结果。 */
export interface JsonFileSuccess<T> {
    /** 标识操作成功。 */
    ok: true;
    /** 读取或处理完成的数据。 */
    data: T;
}

/** JSON 文件操作失败结果。 */
export interface JsonFileFailure {
    /** 标识操作失败。 */
    ok: false;
    /** 面向界面展示的失败原因。 */
    message: string;
}

/** JSON 文件操作可区分结果。 */
export type JsonFileResult<T> = JsonFileSuccess<T> | JsonFileFailure;

/** 下载环境适配器，测试可以替换 DOM 与 URL API。 */
export interface JsonDownloadEnvironment {
    /** 创建下载链接节点。 */
    createAnchor: () => HTMLAnchorElement;
    /** 把下载链接挂载到文档。 */
    appendAnchor: (anchor: HTMLAnchorElement) => void;
    /** 为 Blob 创建临时 URL。 */
    createObjectURL: (blob: Blob) => string;
    /** 释放临时 URL。 */
    revokeObjectURL: (url: string) => void;
}

/**
 * @description 读取用户选择的单个 JSON 文件文本。
 * @param file 用户选择的浏览器文件。
 * @param maxBytes 允许读取的最大字节数。
 * @returns 成功时返回 UTF-8 文本，空文件、超限或读取失败时返回错误。
 */
export const readJsonFileText = async function (file: File, maxBytes: number): Promise<JsonFileResult<string>> {
    if (file.size === 0) return { ok: false, message: "JSON 文件不能为空" };
    if (file.size > maxBytes) return { ok: false, message: `JSON 文件不能超过 ${Math.floor(maxBytes / 1024 / 1024)} MiB` };
    try {
        const text = await file.text();
        return text ? { ok: true, data: text } : { ok: false, message: "JSON 文件不能为空" };
    } catch {
        return { ok: false, message: "JSON 文件读取失败" };
    }
};

/**
 * @description 下载 UTF-8 JSON 文本并释放临时浏览器资源。
 * @param text 待下载的 JSON 文本。
 * @param fileName 安全的目标文件名。
 * @param environment DOM 与 URL 环境；业务默认使用当前浏览器。
 * @returns 无返回值。
 */
export const downloadJsonText = function (
    text: string,
    fileName: string,
    environment: JsonDownloadEnvironment = {
        createAnchor: () => document.createElement("a"),
        appendAnchor: anchor => document.body.appendChild(anchor),
        createObjectURL: blob => URL.createObjectURL(blob),
        revokeObjectURL: url => URL.revokeObjectURL(url)
    }
): void {
    const blob = new Blob([text], { type: "application/json;charset=utf-8" });
    const objectUrl = environment.createObjectURL(blob);
    const anchor = environment.createAnchor();
    try {
        anchor.href = objectUrl;
        anchor.download = fileName;
        anchor.style.display = "none";
        environment.appendAnchor(anchor);
        anchor.click();
    } finally {
        anchor.remove();
        environment.revokeObjectURL(objectUrl);
    }
};
