/**
 * @fileoverview 在 Node 中挂载真实 Vue 组件的测试宿主，提供节点查询和控件事件驱动。
 * @remarks 不模拟浏览器排版；只替代宿主 DOM 与第三方控件外壳，项目组件的 setup、渲染、响应式和生命周期正常执行。
 */
import { createRenderer, defineComponent, h, type Component, type App } from "vue";

/** 测试宿主节点，记录渲染结果与真实项目传入的属性、事件。 */
export interface HostNode {
    /** 节点类型。 */
    tag: string;
    /** 文本内容。 */
    text: string;
    /** 当前属性及监听器。 */
    props: Record<string, any>;
    /** 有序子节点。 */
    children: HostNode[];
    /** 所属父节点。 */
    parent: HostNode | null;
    /** v-show 需要写入的样式对象。 */
    style: Record<string, any>;
}

/**
 * @description 创建一个独立的宿主节点。
 * @param tag 元素或文本节点类型。
 * @param text 初始文本。
 * @returns 新节点。
 */
const node = (tag: string, text = ""): HostNode => ({ tag, text, props: {}, children: [], parent: null, style: {} });

/**
 * @description 将节点插入指定父节点并维护移动顺序。
 * @param child 当前节点。
 * @param parent 目标父节点。
 * @param anchor 目标锚点，缺省时追加。
 * @returns 无返回值。
 */
const insert = (child: HostNode, parent: HostNode, anchor?: HostNode | null): void => {
    if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
    child.parent = parent;
    const index = anchor ? parent.children.indexOf(anchor) : -1;
    parent.children.splice(index < 0 ? parent.children.length : index, 0, child);
};

/**
 * @description 创建受控的第三方 UI 外壳，保留真实项目的 props、slots 与事件协议。
 * @param name 测试节点名称。
 * @returns 用于全局注册的 Vue 组件。
 * @remarks 测试操作调用 update 来发出控件原生更新事件；外壳不实现项目业务逻辑。
 */
export function control(name: string): Component {
    return defineComponent({
        name,
        inheritAttrs: false,
        props: {
            modelValue: { type: null, default: undefined },
            fileList: { type: Array, default: undefined },
            label: { type: String, default: undefined },
            value: { type: null, default: undefined },
            disabled: Boolean,
            error: { type: String, default: undefined },
            indeterminate: Boolean,
            title: { type: String, default: undefined },
            closable: Boolean
        },
        emits: ["update:modelValue", "update:fileList", "change", "closed", "close"],
        setup(props, { attrs, slots, emit }) {
            return () =>
                h(
                    name,
                    {
                        ...attrs,
                        ...props,
                        update: (value: any) => {
                            emit("update:modelValue", value);
                            emit("change", value);
                        },
                        updateFiles: (value: any) => emit("update:fileList", value),
                        closeDialog: () => {
                            emit("update:modelValue", false);
                            emit("closed");
                        },
                        closeAlert: () => emit("close")
                    },
                    Object.values(slots).flatMap(slot => slot?.() ?? [])
                );
        }
    });
}

/** 第三方外壳注册范围，保留每种控件的可区分节点。 */
const controls = [
    "el-form",
    "el-form-item",
    "el-collapse",
    "el-collapse-item",
    "el-input",
    "el-input-number",
    "el-radio-group",
    "el-radio",
    "el-radio-button",
    "el-checkbox-group",
    "el-checkbox",
    "el-checkbox-button",
    "el-select",
    "el-option",
    "el-cascader",
    "el-date-picker",
    "el-time-picker",
    "el-time-select",
    "el-switch",
    "el-rate",
    "el-color-picker",
    "el-slider",
    "el-upload",
    "el-button",
    "el-icon",
    "el-alert",
    "el-divider",
    "el-row",
    "el-col",
    "el-dialog",
    "el-empty",
    "el-tooltip",
    "el-tabs",
    "el-tab-pane",
    "el-splitter",
    "el-splitter-panel"
];

/**
 * @description 挂载真实项目组件并提供必要的注入值和第三方 UI 注册。
 * @param component 被测真实组件。
 * @param props 组件输入及外部事件监听。
 * @param provided 页面注入契约。
 * @param overrides 需要改用真实子组件或特定外部替身的控件。
 * @returns 宿主根节点、应用实例及卸载方法。
 */
export function mountComponent(
    component: Component,
    props: Record<string, any> = {},
    provided: Record<string, any> = {},
    overrides: Record<string, Component> = {}
): { root: HostNode; app: App; unmount: () => void } {
    const renderer = createRenderer<HostNode, HostNode>({
        patchProp: (element, key, _previous, value) => {
            element.props[key] = value;
        },
        insert,
        remove: element => {
            if (element.parent) element.parent.children.splice(element.parent.children.indexOf(element), 1);
            element.parent = null;
        },
        createElement: tag => node(tag),
        createText: text => node("#text", text),
        createComment: text => node("#comment", text),
        setText: (element, text) => {
            element.text = text;
        },
        setElementText: (element, text) => {
            element.text = text;
            element.children = [];
        },
        parentNode: element => element.parent,
        nextSibling: element => element.parent?.children[element.parent.children.indexOf(element) + 1] ?? null,
        insertStaticContent: (text, parent, anchor) => {
            const element = node("#static", text);
            insert(element, parent, anchor);
            return [element, element];
        }
    });
    const app = renderer.createApp(component, props);
    for (const [key, value] of Object.entries(provided)) app.provide(key, value);
    for (const name of controls) app.component(name, overrides[name] ?? control(name));
    // 模板转译时部分内置指令仍带布局容器事件；宿主不需要浏览器专有动画和焦点实现。
    const root = node("root");
    app.mount(root);
    // 用例可提前验证销毁，afterEach 再次清理时不重复触发生命周期。
    let unmounted = false;
    return {
        root,
        app,
        unmount: () => {
            if (!unmounted) {
                app.unmount();
                unmounted = true;
            }
        }
    };
}

/**
 * @description 深度查询当前渲染节点。
 * @param root 当前宿主根节点。
 * @param predicate 判断目标节点的条件。
 * @returns 顺序匹配的节点数组。
 */
export function findNodes(root: HostNode, predicate: (node: HostNode) => boolean): HostNode[] {
    return [...(predicate(root) ? [root] : []), ...root.children.flatMap(child => findNodes(child, predicate))];
}

/**
 * @description 获取节点及后代的文本，用于断言实际题干、按钮和错误消息。
 * @param root 被查询节点。
 * @returns 合并后的文本。
 */
export function textContent(root: HostNode): string {
    if (root.tag === "#comment") return "";
    return root.text + root.children.map(textContent).join("");
}
