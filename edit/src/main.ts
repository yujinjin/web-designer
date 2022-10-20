/*
 * @创建者: yujinjin9@126.com
 * @创建时间: 2022-09-01 14:18:30
 * @最后修改作者: yujinjin9@126.com
 * @最后修改时间: 2022-10-20 09:48:54
 * @项目的路径: \web-designer\edit\src\main.ts
 * @描述: 项目入口页
 */
import "@style/app.less";
import "@style/icomoon.css";
import AppMain from "./app-main";

const appMain = new AppMain();

if (config.isDebug) {
    // 调试模式加全局模式
    window.appMain = appMain;
}

appMain.init();
