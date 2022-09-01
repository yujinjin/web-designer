import type { ComponentPublicInstance, FunctionalComponent } from "vue";
import type { App } from "/#/app";
declare global {
    //TODO: 很奇怪只有导入的import，该全局对象在其他地方被引用是不会提示错误
    // const __APP_INFO__: {
    //     appName: string;
    //     buildEnv: string;
    //     isDebug: boolean;
    //     version: string;
    //     buildTime: number;
    // };
    // const __POWERED_BY_QIANKUN__: any;

    const config: App.Config;

    const logs: App.Logs;
}

declare module "vue" {
    export type JSXComponent<Props = any> = { new (): ComponentPublicInstance<Props> } | FunctionalComponent<Props>;
    import { CompatVue } from "@vue/runtime-dom";
    const Vue: CompatVue;
    export default Vue;
    export * from "@vue/runtime-dom";
}
