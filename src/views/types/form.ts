/**
 * @fileoverview 表单根节点契约，定义表单属性、初始化脚本与顶层组件树的边界。
 * @remarks 根表单拥有唯一组件树；设置源码与可执行函数体并存的语义保持不变。
 */
// 全类型导入必须整体擦除，避免 verbatimModuleSyntax 将内联 type 编译为空运行导入。
/* eslint import-x/consistent-type-specifier-style: ["error", "prefer-top-level"] */
import type { Mutable } from "/#/global.d";
import type { FormProps } from "element-plus";
import type { WidgetData } from "./widget";

/**
 * @description 表单根节点数据，聚合表单运行属性、初始化脚本、设置态数据和顶层组件树。
 */
export interface WidgetFormData {
    /** 设计器节点实例的全局唯一标识，同时作为渲染表单值键。 */
    readonly id: string;
    /** 节点或表单类型的稳定标识，用于注册表分发和持久化识别。 */
    readonly code: string;
    /** 传递给 ElFormItem 或 ElForm 的运行态表单属性。 */
    readonly formAttributes: Partial<Mutable<FormProps>>;
    /** 由设置态完整脚本转换得到的运行时函数体集合。 */
    readonly componentFunctions: {
        /** 表单初始化脚本的可执行函数体；null 表示未配置。 */
        init: string | null;
    };
    /** 设置面板直接编辑和回显的数据集合。 */
    readonly settingData: {
        /** 表单是否使用行内排列模式。 */
        inline: boolean;
        /** 表单项标签相对于控件的位置。 */
        labelPosition: "left" | "top" | "right";
        /** 表单标签宽度，可使用数值或带单位字符串。 */
        labelWidth: string | number | null;
        /** 设置面板保存的表单初始化完整函数源码。 */
        onInit: string;
    };
    /** 表单顶层组件或行容器直接子组件的响应式数组。 */
    readonly widgets: Array<WidgetData>;
}
