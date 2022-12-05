/*
 * @创建者: yujinjin9@126.com
 * @创建时间: 2022-09-01 14:18:28
 * @最后修改作者: yujinjin9@126.com
 * @最后修改时间: 2022-12-02 17:38:47
 * @项目的路径: \web-designer\edit\src\app-main.ts
 * @描述：项目程序入口
 */
import { createApp, App as VueApplication } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
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

    constructor() {
        this.logs = logs;
        this.store = store;
        this.initConfig();
        this.config = config;
        this.vueAppInstance = null;
    }

    // 初始化
    async init() {
        this.vueAppInstance = await this.initVue();
        this.mount();
    }

    // 初始化项目配置
    initConfig() {
        // TODO:
    }

    // 初始化vue
    async initVue() {
        const vueAppInstance = createApp(Appvue);
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
        vueAppInstance.use(ElementPlus);
        vueAppInstance.use(this.store);
        return vueAppInstance;
    }

    // 挂载dom
    mount() {
        this.vueAppInstance!.mount("#app-edit");
    }

    // 卸载组件实例
    unmount() {
        this.vueAppInstance!.unmount();
    }
}
