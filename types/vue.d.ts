/*
 * @创建者: yujinjin9@126.com
 * @描述: vue 声明
 */
import { type ComponentPublicInstance, type FunctionalComponent } from "vue";

/** 将第三方变量挂载到每一个 vue 示例中 */
declare module "vue" {
    export type JSXComponent<Props = any> = { new (): ComponentPublicInstance<Props> } | FunctionalComponent<Props>;
    import { type CompatVue } from "vue";
    const Vue: CompatVue;
    export default Vue;
    export * from "vue";
    interface ComponentCustomProperties {
        $store: Store;
    }
}

declare module "*.vue" {
    import { type DefineComponent } from "vue";
    const Component: DefineComponent<object, object, any>;
    export default Component;
}
