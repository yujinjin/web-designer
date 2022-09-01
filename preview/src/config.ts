/**
 * 作者：yujinjin9@126.com
 * 时间：2021-12-29
 * 描述：APP应用配置
 */
import { App } from "/#/app";
import { BuildEnv } from "@/services/enums";

// 获取全局应用配置信息
const config: App.Config = {
    /** 当前环境模式 */
    buildEnv: <BuildEnv>process.env.NODE_ENV,

    /** 应用名称 */
    appName: process.env.VUE_APP_NAME,

    /** 是否调试模式 */
    isDebug: <BuildEnv>process.env.NODE_ENV !== BuildEnv.PRODUCTION,

    /** 应用的版本 */
    version: process.env.VUE_APP_VERSION,

    /** 应该构建时间 */
    buildTime: new Date(process.env.VUE_APP_BUILD_TIME),

    /** web站点的接口地址 */
    webApiDomain: "",

    /** 本地站点的地址 */
    localDomain: "",

    /** 请求的API版本号 */
    apiVersion: "",

    /** 浏览器环境 */
    browser: ""
};
export default config;
