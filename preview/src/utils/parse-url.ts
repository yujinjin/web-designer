/**
 * 作者：yujinjin9@126.com
 * 时间：2019-12-26
 *
 * @param url 需要解析的目标url
 * 描述：解析URL的参数、域名、协议、端口等对象
 */
export default function (url: string): Record<string, any> {
    const _a_el = document.createElement("a");
    _a_el.href = url;
    return {
        sources: url,
        protocol: _a_el.protocol.replace(":", ""), //协议
        host: _a_el.hostname, //域名
        port: _a_el.port,
        query: (function () {
            let search: string = _a_el.search || "";
            if (!search && url.indexOf("?") !== -1) {
                //兼容http://xxxx/#/?id=xxx这种格式
                return url.substring(url.indexOf("?"));
            } else if (url.indexOf("?") !== url.lastIndexOf("?")) {
                // 兼容http://xxxx/?orderNo=xxx#/?id=xxx这种格式
                search += (search.indexOf("?") === -1 ? "?" : "&") + url.substring(url.lastIndexOf("?") + 1);
            }
            return search;
        })(),
        params: (function () {
            const params: Record<string, any> = {};
            let search: string | string[] = _a_el.search || "";
            if (!search && url.indexOf("?") !== -1) {
                //兼容http://xxxx/#/?id=xxx这种格式
                return url.substring(url.indexOf("?"));
            } else if (url.indexOf("?") !== url.lastIndexOf("?")) {
                // 兼容http://xxxx/?orderNo=xxx#/?id=xxx这种格式
                search += (search.indexOf("?") === -1 ? "?" : "&") + url.substring(url.lastIndexOf("?") + 1);
            }
            search = (<string>search).replace(/^\?/, "").split("&");
            const len = search.length;
            for (let i = 0; i < len; i++) {
                if (!search[i]) {
                    continue;
                }
                const paramsString: string[] = search[i].split("=");
                params[paramsString[0]] = paramsString[1];
            }
            return params;
        })(), //参数对象
        file: (_a_el.pathname.match(/\/([^/?#]+)$/i) || ["", ""])[1],
        hash: _a_el.hash.replace("#", ""),
        path: _a_el.pathname.replace(/^([^/])/, "/$1"),
        relative: (_a_el.href.match(/tps?:\/\/[^/]+(.+)/) || ["", ""])[1],
        segments: _a_el.pathname.replace(/^\//, "").split("/")
    };
}
