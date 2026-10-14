/**
 * @fileoverview 级联组件的数据契约和 JSON 解析结果类型，集中描述选项树、节点值与运行属性。
 * @remarks ElCascader 外层属性必须从组件 props 提取，不能混用 CascaderPanel 的字段映射配置。
 */
// 全类型导入必须整体擦除，避免 verbatimModuleSyntax 将内联 type 编译为空运行导入。
/* eslint import-x/consistent-type-specifier-style: ["error", "prefer-top-level"] */
import type { ExtractPropTypes } from "vue";
import type { CascaderOption as ElementPlusCascaderOption, FormItemProps } from "element-plus";
import type { WidgetBaseData } from "../base";
import type { Mutable } from "/#/global.d";

/**
 * @description ElCascader 组件实际接收的属性类型。
 * @remarks Element Plus 顶层导出的同名 CascaderProps 属于 CascaderPanel 的字段映射配置，不包含 options、props、placeholder 等 ElCascader 外层属性，因此必须从 cascaderProps 声明提取。
 */
type CascaderProps = ExtractPropTypes<typeof import("element-plus").cascaderProps>;

/**
 * @description 级联节点允许持久化和提交的标量值。
 */
export type CascaderNodeValue = string | number;

/**
 * @description 设计器使用的标准级联树节点。
 * @remarks 继承 Element Plus 公开选项契约，同时把设计器必需的 label 和 value 收紧为必填字段。
 */
export interface CascaderOption extends ElementPlusCascaderOption {
    /** 节点展示文案。 */
    label: string;
    /** 节点提交和匹配使用的值。 */
    value: CascaderNodeValue;
    /** 下一级节点；省略表示当前节点没有已配置的子节点。 */
    children?: CascaderOption[];
    /** 是否禁止用户选择当前节点。 */
    disabled?: boolean;
    /** 是否将当前节点显式标记为叶子节点。 */
    leaf?: boolean;
}

/**
 * @description 级联选项解析或校验成功后的结果。
 */
export interface CascaderParseSuccess<T> {
    /** 标识当前结果可安全使用。 */
    ok: true;
    /** 解析或校验完成的数据。 */
    data: T;
}

/**
 * @description 级联选项解析或校验失败后的结构化错误。
 */
export interface CascaderParseFailure {
    /** 标识当前结果不可用于覆盖上一份合法数据。 */
    ok: false;
    /** 面向设置面板展示的错误信息。 */
    message: string;
    /** JSONPath 风格的失败位置，根节点使用 `$`。 */
    path: string;
}

/**
 * @description 不抛出业务校验异常的级联选项处理结果。
 */
export type CascaderParseResult<T> = CascaderParseSuccess<T> | CascaderParseFailure;

/**
 * @description 级联选择器可序列化的单选或多选值。
 * @remarks Element Plus 的实际值形态由 multiple 与 emitPath 共同决定，因此领域层保留标量和嵌套数组组合。
 */
export type CascaderValue = string | number | Array<string | number | Array<string | number>>;

/**
 * @description 级联选择器节点数据，使用本地 JSON 完整树作为唯一选项来源。
 */
export interface WidgetCascaderData extends WidgetBaseData {
    /** 传递给 ElFormItem 的运行态表单属性。 */
    readonly formAttributes: Partial<Mutable<FormItemProps>>;
    /** 直接传递给 ElCascader 的展示与选择行为属性；options 由专用渲染组件从设置态注入。 */
    readonly componentAttributes?: Partial<Mutable<CascaderProps>>;
    /** 由设置态完整脚本转换得到的运行时函数体集合。 */
    readonly componentFunctions: {
        /** 自定义字段校验脚本的可执行函数体；null 表示未配置。 */
        validate: string | null;
        /** 值变更事件的可执行函数体；null 表示未配置。 */
        change: string | null;
        /** 面板显隐事件的可执行函数体；null 表示未配置。 */
        visibleChange: string | null;
        /** 节点展开事件的可执行函数体；null 表示未配置。 */
        expandChange: string | null;
        /** 清空事件的可执行函数体；null 表示未配置。 */
        clear: string | null;
        /** 多选标签移除事件的可执行函数体；null 表示未配置。 */
        removeTag: string | null;
        /** 组件失焦事件的可执行函数体；null 表示未配置。 */
        blur: string | null;
        /** 组件聚焦事件的可执行函数体；null 表示未配置。 */
        focus: string | null;
    };
    /** 设置面板直接编辑和回显的数据集合。 */
    readonly settingData: {
        /** 提交数据使用的业务字段名或嵌套路径；null 表示不进入提交对象。 */
        propName: string | null;
        /** 表单项展示的字段标签文案。 */
        label: string | null;
        /** 表单项标签相对于控件的位置。 */
        labelPosition: "left" | "top" | "right";
        /** 字段首次创建时写入渲染数据的默认值。 */
        defaultValue: CascaderValue | null;
        /** 字段是否参与必填校验。 */
        required: boolean;
        /** 字段必填校验失败时展示的错误信息。 */
        requiredMessage: string | null;
        /** 设置面板组合控制项，用于派生禁用和隐藏状态；空数组表示正常显示。 */
        control: ("disabled" | "isHidden")[];
        /** 最近一次校验合法的本地完整树。 */
        options: CascaderOption[];
        /** 本地树的多行 JSON 编辑文本；非法草稿也保留在设置组件本地状态而非此字段。 */
        optionsText: string;
        /** 字段没有值时展示的占位文案。 */
        placeholder: string | null;
        /** 是否允许清空当前值。 */
        clearable: boolean;
        /** 是否支持输入关键字过滤节点。 */
        filterable: boolean;
        /** 是否允许一次选择多个节点。 */
        multiple: boolean;
        /** 是否严格遵守父子节点不互相关联。 */
        checkStrictly: boolean;
        /** 组件值是否包含完整节点路径。 */
        emitPath: boolean;
        /** 子菜单通过点击或悬停展开。 */
        expandTrigger: "click" | "hover";
        /** 输入框是否展示完整选中路径。 */
        showAllLevels: boolean;
        /** 多选时是否折叠已选标签。 */
        collapseTags: boolean;
        /** 折叠前最多直接展示的标签数量。 */
        maxCollapseTags: number | null;
        /** 悬停折叠标签时是否展示完整内容。 */
        collapseTagsTooltip: boolean;
        /** 层级路径之间使用的分隔符。 */
        separator: string;
        /** 设置面板保存的自定义校验完整函数源码。 */
        onValidate: string | null;
        /** 设置面板保存的值变更事件完整函数源码。 */
        onChange: string | null;
        /** 设置面板保存的面板显隐事件完整函数源码。 */
        onVisibleChange: string | null;
        /** 设置面板保存的节点展开事件完整函数源码。 */
        onExpandChange: string | null;
        /** 设置面板保存的清空事件完整函数源码。 */
        onClear: string | null;
        /** 设置面板保存的多选标签移除事件完整函数源码。 */
        onRemoveTag: string | null;
        /** 设置面板保存的组件失焦事件完整函数源码。 */
        onBlur: string | null;
        /** 设置面板保存的组件聚焦事件完整函数源码。 */
        onFocus: string | null;
    };
}
