/*
 * @创建者: yujinjin9@126.com
 * @描述: 常用工具方法
 */

// 特殊字符替换
export function escapeStringRegexp(string = "") {
    return string.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
