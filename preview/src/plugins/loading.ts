/**
 * 作者：yujinjin9@126.com
 * 时间：2022-01-10
 * 描述：封装第三方加载插件，由于Loading的加载是单例的，所以这里要做到如果被多次调用显示，以最后一次的close才真正关闭
 */
import { Toast, ToastOptions } from "vant";
import { ComponentInstance } from "vant/lib/utils";

let loadingInstance: ComponentInstance | null = null;
let showTimes = 0;

export default {
    show(options?: ToastOptions) {
        ++showTimes;
        logs.debug(showTimes, "showLoading");
        loadingInstance = Toast.loading(
            Object.assign(
                {
                    duration: 0,
                    loadingType: "spinner",
                    message: "加载中...",
                    forbidClick: true
                },
                options || {}
            )
        );
    },

    hide() {
        --showTimes;
        if (showTimes < 0) {
            logs.debug("hideLoading次数异常，当前showTimes：" + showTimes);
            showTimes = 0;
        }
        if (loadingInstance && showTimes <= 0) {
            loadingInstance.clear();
            loadingInstance = null;
        }
    }
};
