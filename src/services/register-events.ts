/*
 * @创建者: yujinjin9@126.com
 * @描述: 注册全局事件
 */
import { eventsStore } from "@/stores";

export default function () {
    const events = eventsStore();

    // 去定义跳转登录函数方法
    const gotoLogin = function (toFullPath?: string) {
        // 当前路由信息放在URL上，方便登录回来时自动打开
        // TODO: 实现
    };

    // 去定义退出登录函数方法
    const gotoLogout = function () {
        // 清理本地存储登录信息或者设置当前登录的信息为失效状态
        // storage.logout();
        // TODO: 实现
    };

    // 跳转登录全局事件
    events.on({
        eventName: "gotoLogin",
        callback: gotoLogin
    });

    // 退出登录全局事件
    events.on({
        eventName: "gotoLogout",
        callback: gotoLogout
    });
}
