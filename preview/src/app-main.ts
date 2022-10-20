/*
 * @创建者: yujinjin9@126.com
 * @创建时间: 2022-08-30 11:29:05
 * @最后修改作者: yujinjin9@126.com
 * @最后修改时间: 2022-10-18 16:08:55
 * @项目的路径: \web-designer\preview\src\app-main.ts
 * @描述：基础环境
 */

import { createApp, App as VueApplication } from "vue";
import Appvue from "@/App.vue";
import { App } from "/#/app";
import type { Store } from "vuex";
import store from "@/store/";

export default class AppMain implements App.AppMain {
    // 项目配置
    config: App.Config;

    // 日志
    logs: App.Logs;

    // 当前vue实例
    vueAppInstance: VueApplication | null;

    // VUE存储状态
    store: Store<App.StoreStateType>;

    // qiankun属性
    qiankunProps: App.QiankunInput | null;

    constructor() {
        this.logs = logs;
        this.store = store;
        this.initConfig();
        this.config = config;
        this.vueAppInstance = null;
        this.qiankunProps = null;
    }

    // 初始化
    async init(qiankunProps: App.QiankunInput) {
        this.qiankunProps = qiankunProps;
        this.vueAppInstance = await this.initVue();
        this.mount(this.qiankunProps.container);
    }

    // 初始化项目配置
    initConfig() {
        // 判断是否使用qiankun框架
        if (window.__POWERED_BY_QIANKUN__) {
            __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
        }
    }

    // 初始化vue
    async initVue() {
        const vueAppInstance = createApp(Appvue, { qiankun: this.qiankunProps });
        // 是否启用对组件初始化、编译、渲染和更新的性能追踪
        vueAppInstance.config.performance = config.isDebug;
        // debug 模式
        if (!config.isDebug) {
            /**
             * @param {String}  errorMessage   错误信息
             * @param {String}  scriptURI      出错的文件
             * @param {Long}    lineNumber     出错代码的行号
             * @param {Long}    columnNumber   出错代码的列号
             * @param {Object}  errorObj       错误的详细信息，Anything
             */
            window.onerror = function (errorMessage, scriptURI, lineNumber, columnNumber, errorObj) {
                logs.error({ errorMessage, scriptURI, lineNumber, columnNumber, errorObj });
            };
            vueAppInstance.config.errorHandler = function (err, vm, info) {
                logs.error(JSON.stringify({ message: "Vue errorHandler:" + err, type: info }));
            };
        }
        vueAppInstance.use(this.store);
        return vueAppInstance;
    }

    // 挂载dom
    mount(container: string | HTMLElement) {
        this.vueAppInstance!.mount(typeof container === "string" ? container : container.querySelector("#app-preview"));
    }

    // 卸载组件实例
    unmount() {
        this.vueAppInstance!.unmount();
    }
}
