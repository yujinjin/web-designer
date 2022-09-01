/**
 * 作者：yujinjin9@126.com
 * 时间：2022-01-14
 *
 * @param url 当前要修改的URL
 * @param name 参数名，如果参数名(name)在URL中不存在有value值且可以增加就表示增加该参数
 * @param value 参数值，如果value为null或者空字符串就表示删除该参数
 * @param isAdd 如果没有该参数时是否可以增加该参数，默认为true.
 * @return 返回新的URL
 * 描述：修改url中的参数值，如果参数名(name)在URL中不存在且有value值就表示增加该参数，如果value为null或者空字符串就表示删除该参数
 */

export default function (url: string, name: string, value?: string | number, isAdd = true): string {
    if (!url && !name) return "";
    if (value === undefined || value === null) {
        // 删除参数
        return url.replace(eval("/(\\?|\\&)(" + name + "=)([^&]*)(&*)/gi"), function (matchWord, parame1, parame2, parame3, parame4) {
            if (parame4 != "&") {
                return "";
            } else {
                return parame1;
            }
        });
    } else {
        let _is_has_name = false; // 是否有该参数
        let _new_url = url.replace(eval("/(\\?|\\&)(" + name + "=)([^&]*)(&*)/gi"), function (matchWord, parame1, parame2, parame3, parame4) {
            _is_has_name = true;
            return parame1 + parame2 + value + parame4;
        });
        if (!_is_has_name && isAdd) {
            let symbol_character = "?";
            if (_new_url.indexOf("?") !== -1 && (_new_url.indexOf("#/") === -1 || _new_url.substring(_new_url.indexOf("#/")).indexOf("?") !== -1)) {
                // 兼容http://xxxx/?orderNo=xxx#/?id=xxx这种格式
                symbol_character = "&";
            }
            _new_url += symbol_character + name + "=" + value;
        }
        return _new_url;
    }
}
