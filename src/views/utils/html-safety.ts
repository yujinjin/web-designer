/**
 * @fileoverview 使用 DOMPurify 为 HTML Widget 提供导入高危内容检查和运行时净化边界。
 * @remarks 导入时任何被白名单移除的节点、属性或 URL 都会拒绝整个文档；运行时仅渲染净化结果，原始设置文本保持不变。
 */
import createDOMPurify, { type DOMPurify } from "dompurify";

/** 允许 HTML Widget 使用的展示型标签，以及 DOMPurify 解析片段时必需的 body 根节点。 */
const ALLOWED_HTML_TAGS = [
    "a",
    "b",
    "body",
    "blockquote",
    "br",
    "code",
    "div",
    "em",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "i",
    "li",
    "ol",
    "p",
    "pre",
    "span",
    "strong",
    "table",
    "tbody",
    "td",
    "th",
    "thead",
    "tr",
    "u",
    "ul"
];

/** 允许 HTML Widget 使用的非脚本属性。 */
const ALLOWED_HTML_ATTRIBUTES = ["class", "href", "rel", "target", "title"];

/**
 * @description HTML 安全检查成功结果。
 */
export interface HtmlSafetySuccess {
    /** 标识内容满足白名单。 */
    ok: true;
    /** DOMPurify 生成的安全 HTML。 */
    data: string;
}

/**
 * @description HTML 安全检查失败结果。
 */
export interface HtmlSafetyFailure {
    /** 标识内容包含高危内容或环境不支持检查。 */
    ok: false;
    /** 面向导入界面的失败原因。 */
    message: string;
}

/** HTML 安全检查结果。 */
export type HtmlSafetyResult = HtmlSafetySuccess | HtmlSafetyFailure;

/**
 * @description 获取当前浏览器可用的 DOMPurify 实例。
 * @returns 浏览器支持时返回实例，否则返回 null。
 */
const getPurifier = function (): DOMPurify | null {
    if (typeof createDOMPurify.sanitize === "function") return createDOMPurify;
    if (typeof window === "undefined") return null;
    const purifier = createDOMPurify(window);
    return typeof purifier.sanitize === "function" ? purifier : null;
};

/**
 * @description 从 DOMPurify 移除记录中提取可理解的高危内容名称。
 * @param purifier 完成本次净化的 DOMPurify 实例。
 * @returns 被删除的标签或属性名，无法识别时返回“未知内容”。
 */
const getRemovedContentName = function (purifier: DOMPurify): string {
    const removed = purifier.removed[0];
    if (!removed) return "未知内容";
    if ("attribute" in removed) return removed.attribute?.name || "危险属性";
    return removed.element.nodeName.toLowerCase();
};

/**
 * @description 检查 HTML 是否完全满足展示白名单。
 * @param html HTML Widget 的原始配置文本。
 * @returns 未发生任何移除时返回净化文本；发现高危内容时返回失败。
 * @remarks 采用“发生移除即拒绝”策略，禁止用户通过确认绕过脚本、事件属性、危险 URL、SVG/MathML 或其他非白名单内容。
 */
export const inspectHtmlSafety = function (html: string, purifier: DOMPurify | null = getPurifier()): HtmlSafetyResult {
    if (!purifier) return { ok: false, message: "当前环境不支持 HTML 安全检查" };
    try {
        const sanitized = purifier.sanitize(html, {
            ALLOWED_TAGS: ALLOWED_HTML_TAGS,
            ALLOWED_ATTR: ALLOWED_HTML_ATTRIBUTES,
            ALLOW_ARIA_ATTR: false,
            ALLOW_DATA_ATTR: false,
            ALLOW_UNKNOWN_PROTOCOLS: false,
            FORBID_ATTR: ["style", "srcdoc"],
            FORBID_TAGS: ["base", "embed", "form", "iframe", "link", "math", "meta", "object", "script", "style", "svg"],
            SANITIZE_DOM: true,
            SANITIZE_NAMED_PROPS: true
        });
        if (purifier.removed.length > 0) {
            return { ok: false, message: `HTML 内容包含高危代码：${getRemovedContentName(purifier)}` };
        }
        return { ok: true, data: sanitized };
    } catch {
        return { ok: false, message: "HTML 内容安全检查失败" };
    }
};

/**
 * @description 为运行时 v-html 返回安全内容。
 * @param html HTML Widget 的原始配置文本。
 * @returns 安全检查通过时返回净化结果，否则返回空字符串。
 * @remarks 渲染失败绝不回退原文，避免手工配置或外部数据绕过导入门禁。
 */
export const sanitizeHtmlForRendering = function (html: string): string {
    const result = inspectHtmlSafety(html);
    return result.ok ? result.data : "";
};
