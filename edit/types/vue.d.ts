import { App } from "/#/app";

/** 将第三方变量挂载到每一个 vue 示例中 */
declare module "@vue/runtime-core" {
    interface ComponentCustomProperties {
        $store: Store<App.StoreStateType>;
    }
}

