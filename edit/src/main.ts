import "@style/app.less";
import "@style/iconfont.css";
import AppMain from "./app-main";

const appMain = new AppMain();

if (config.isDebug) {
    // 调试模式加全局模式
    window.appMain = appMain;
}

appMain.init();
