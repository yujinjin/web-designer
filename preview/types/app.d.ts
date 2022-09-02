/**
 * 作者：yujinjin9@126.com
 * 时间：2020-12-28
 * 描述：APP命名空间
 */
import { BuildEnv, Activities, ServiceActivityCodes } from "/@/services/enums";
import type { App as VueApplication } from "vue";
declare namespace App {
    /** APP当前环境配置 */
    interface Config {
        /** 当前环境模式 */
        readonly buildEnv: BuildEnv;

        /** 应用名称 */
        readonly appName: string;

        /** 是否调试模式 */
        readonly isDebug: boolean;

        /** 应用的版本 */
        readonly version: string;

        /** 应该构建时间 */
        readonly buildTime: Date;

        /** web站点的接口地址 */
        webApiDomain: string;

        /** 本地站点的地址 */
        localDomain: string;

        /** 请求的API版本号 */
        readonly apiVersion: string;

        /** 浏览器环境 */
        browser: string;
    }

    /** 站点本地存储 */
    interface Storage {
        /** 获取站点本地存储信息 */
        getSiteLocalStorage(key: string): undefined | Record<string, any>;

        /** 设置站点本地存储信息 */
        setSiteLocalStorage(key: string, value: Record<string, any>): void;

        /** 本地存储 */
        localStorage(key: string, value?: string);
    }

    interface StoreStateType {
        data: {
            locationInfo: LocationInfo;
        };
        event: {
            events: Record<string, Array<Function>>;
            onceEvents: Record<string, Array<Function>>;
        };
    }

    /** 站点数据 */
    interface LocationInfo {}

    /** 日志 */
    interface Logs {
        debug(...contents: any[]): void;
        info(...contents: any[]): void;
        warn(...contents: any[]): void;
        error(...contents: any[]): void;
        fatal(...contents: any[]): void;
    }

    /** qiankun微应用传入的属性值 */
    interface QiankunInputData {
        events: {
            /** 当前选中的组件索引变化（主应用实现） */
            onChangeSelectedIndex(index: number): void;

            /** 拖拽排序（主应用实现） */
            onDrag(oldIndex: number, newIndex: number): void;

            /** 新增之后（主应用实现） */
            onInsertAfter(index, componentData: Record<string, any>): void;

            /** 删除（主应用实现） */
            onDelete(index): void;
        };

        methods: {
            /** 初始化页面数据（子应用实现） */
            init(dataList: Record<string, any>[]): void;

            /** 新增之前（子应用实现） */
            insert(componentData: Record<string, any>): void;

            /** 修改组件属性值（子应用实现） */
            updateComponentProperty(key, value): void;
        };
    }

    /** qiankun微应用框架 */
    interface QiankunInput extends QiankunInputData {
        // 微应用名称
        name: string;

        // 插入主应用内的容器
        container: string | HTMLElement;

        // 在当前应用监听全局状态，有变更触发
        onGlobalStateChange(callback: (data: QiankunInputData, oldData: QiankunInputData) => void, fireImmediately?: boolean): void;

        // 按一级属性设置全局状态，微应用中只能修改已存在的一级属性
        setGlobalState(data: QiankunInputData): boolean;
    }

    /** 当前页面主要方法 */
    interface AppMain {
        // 项目配置
        config: App.Config;

        // 日志
        logs: App.Logs;

        // 当前vue实例
        vueAppInstance: VueApplication | null;

        // VUE存储状态
        store: Store<StoreStateType>;

        // qiankun属性
        qiankunProps: QiankunInput | null;

        // 初始化
        init(qiankunProps: QiankunInput | null): Promise<void>;

        // 初始化项目配置
        initConfig(): void;

        // 初始化vue
        initVue(): Promise<VueApplication>;

        // 挂载dom
        mount(container: string | HTMLElement): void;

        // 卸载组件实例
        unmount(): void;
    }
}
