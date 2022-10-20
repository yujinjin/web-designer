/*
 * @创建者: yujinjin9@126.com
 * @创建时间: 2022-07-21 21:47:59
 * @最后修改作者: yujinjin9@126.com
 * @最后修改时间: 2022-10-20 11:46:50
 * @项目的路径: \web-designer\preview\src\main.ts
 * @描述: 头部注释配置模板
 */
import { App } from "/#/app";
import "@style/app.less";
import "@style/iconfont.css";
import "vant/lib/index.css";
import AppMain from "./app-main";

const appMain = new AppMain();

// 非微应用模式需要手动初始化
// appMain.init(null);

/**
 * bootstrap 只会在微应用初始化的时候调用一次，下次微应用重新进入时会直接调用 mount 钩子，不会再重复触发 bootstrap。
 * 通常我们可以在这里做一些全局变量的初始化，比如不会在 unmount 阶段被销毁的应用级别的缓存等。
 */
export async function bootstrap() {
    logs.info(appMain.config.appName + " app bootstraped");
}

/**
 * 应用每次进入都会调用 mount 方法，通常我们在这里触发应用的渲染方法
 */
export async function mount(props: App.QiankunInput) {
    logs.info(appMain.config.appName + "mount props from main framework", props);
    // props.methods.init = function (dataList: Record<string, any>[]) {
    //     console.info("03>>>>>>>>>>", dataList);
    // };

    // props.setGlobalState({ methods: props.methods, events: props.events });
    await appMain.init(props);
}

/**
 * 应用每次 切出/卸载 会调用的方法，通常在这里我们会卸载微应用的应用实例
 */
export async function unmount(props: Record<string, any> = {}) {
    logs.info("vue unmount", props);
    appMain.unmount();
}

/**
 * 可选生命周期钩子，仅使用 loadMicroApp 方式加载微应用时生效
 */
export async function update(props: Record<string, any> = {}) {
    console.log("update props", props);
}
