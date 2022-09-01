/**
 * 作者：yujinjin9@126.com
 * 时间：2021-12-30
 * app数据管理入口文件
 */
import { createStore } from "vuex";
import event from "./event";
import data from "./data";
import { App } from "/#/app";

export default createStore<App.StoreStateType>({
    strict: config.isDebug,
    modules: {
        data,
        event
    }
});
