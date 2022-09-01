declare module "*.vue" {
    import { DefineComponent } from "vue";
    const Component: DefineComponent<{}, {}, any>;
    export default Component;
}

declare interface Window {
    appMain: any;
    __POWERED_BY_QIANKUN__: any;
    __INJECTED_PUBLIC_PATH_BY_QIANKUN__: any;
    WeixinJSBridge: any;
    App: any; // APP环境
}

declare interface Document {
    attachEvent(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
}
