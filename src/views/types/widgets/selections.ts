/**
 * @fileoverview 单选、复选与下拉组件的数据契约，定义候选项和设置态选中值。
 * @remarks 保留各组件单值与数组值的差异，避免类型拆分改变设置面板与渲染器的已有协议。
 */
// 全类型导入必须整体擦除，避免 verbatimModuleSyntax 将内联 type 编译为空运行导入。
/* eslint import-x/consistent-type-specifier-style: ["error", "prefer-top-level"] */
import type { FormItemProps, RadioGroupProps, CheckboxGroupProps, SelectProps } from "element-plus";
import type { WidgetBaseData } from "../base";
import type { Mutable } from "/#/global.d";

/**
 * @description 单选组节点数据，支持普通单选和按钮两种展示形态。
 */
export interface WidgetRadioGroupData extends WidgetBaseData {
    /** 传递给 ElFormItem 或 ElForm 的运行态表单属性。 */
    readonly formAttributes: Partial<Mutable<FormItemProps>>;
    /** 直接传递给渲染组件的运行态属性。 */
    readonly componentAttributes?: Partial<Mutable<RadioGroupProps>>;
    /** 由设置态完整脚本转换得到的运行时函数体集合。 */
    readonly componentFunctions: {
        /** 自定义字段校验脚本的可执行函数体；null 表示未配置。 */
        validate: string | null;
        /** 组件值确认变更事件的可执行函数体；null 表示未配置。 */
        change: string | null;
    };
    /** 设置面板直接编辑和回显的数据集合。 */
    readonly settingData: {
        /** 提交数据使用的业务字段名或嵌套路径；null 表示不进入提交对象。 */
        propName: string | null;
        /** 表单项展示的字段标签文案。 */
        label: string | null;
        /** 表单项标签相对于控件的位置。 */
        labelPosition: "left" | "top" | "right";
        /** 字段首次进入渲染数据时使用的默认值；null 通常表示未设置。 */
        defaultValue: string | number | boolean | null;
        /** 字段是否参与必填校验。 */
        required: boolean;
        /** 字段必填校验失败时展示的错误信息。 */
        requiredMessage: string | null;
        /** 设置面板组合控制项，用于派生禁用、只读和隐藏状态；空数组表示正常显示。 */
        control: ("disabled" | "isHidden")[];
        /** 按钮形态选项或评分文本使用的颜色。 */
        textColor: string | null;
        /** 按钮形态单选组或复选组的激活背景色。 */
        fill: string | null;
        /** 单选、复选或选择器使用的候选项列表。 */
        options: Array<{
            /** 候选项展示文案。 */
            label: string;
            /** 候选选项提交和匹配使用的实际值。 */
            value: string;
            /** 是否禁止用户选择当前候选项。 */
            disabled?: boolean;
        }>;
        /** 组件具体展示模式或数据选择类型。 */
        type: "radio" | "button";
        /** 设置面板保存的自定义校验完整函数源码。 */
        onValidate: string | null;
        /** 设置面板保存的值变更事件完整函数源码。 */
        onChange: string | null;
    };
}

/**
 * @description 复选组节点数据，使用数组值并支持最少和最多选择数量。
 */
export interface WidgetCheckboxGroupData extends WidgetBaseData {
    /** 传递给 ElFormItem 或 ElForm 的运行态表单属性。 */
    readonly formAttributes: Partial<Mutable<FormItemProps>>;
    /** 直接传递给渲染组件的运行态属性。 */
    readonly componentAttributes?: Partial<Mutable<CheckboxGroupProps>>;
    /** 由设置态完整脚本转换得到的运行时函数体集合。 */
    readonly componentFunctions: {
        /** 自定义字段校验脚本的可执行函数体；null 表示未配置。 */
        validate: string | null;
        /** 组件值确认变更事件的可执行函数体；null 表示未配置。 */
        change: string | null;
    };
    /** 设置面板直接编辑和回显的数据集合。 */
    readonly settingData: {
        /** 提交数据使用的业务字段名或嵌套路径；null 表示不进入提交对象。 */
        propName: string | null;
        /** 表单项展示的字段标签文案。 */
        label: string | null;
        /** 表单项标签相对于控件的位置。 */
        labelPosition: "left" | "top" | "right";
        /** 字段首次进入渲染数据时使用的选中值数组；空数组表示未选择。 */
        defaultValue: string[] | number[] | boolean[];
        /** 字段是否参与必填校验。 */
        required: boolean;
        /** 字段必填校验失败时展示的错误信息。 */
        requiredMessage: string | null;
        /** 设置面板组合控制项，用于派生禁用、只读和隐藏状态；空数组表示正常显示。 */
        control: ("disabled" | "isHidden")[];
        /** 组件允许的最小数值或最少选中数量。 */
        min: number | null;
        /** 组件允许的最大数值、最大选中数量或最大评分。 */
        max: number | null;
        /** 按钮形态选项或评分文本使用的颜色。 */
        textColor: string | null;
        /** 按钮形态单选组或复选组的激活背景色。 */
        fill: string | null;
        /** 单选、复选或选择器使用的候选项列表。 */
        options: Array<{
            /** 候选项展示文案。 */
            label: string;
            /** 候选选项提交和匹配使用的实际值。 */
            value: string;
            /** 是否禁止用户选择当前候选项。 */
            disabled?: boolean;
        }>;
        /** 组件具体展示模式或数据选择类型。 */
        type: "checkbox" | "button";
        /** 设置面板保存的自定义校验完整函数源码。 */
        onValidate: string | null;
        /** 设置面板保存的值变更事件完整函数源码。 */
        onChange: string | null;
    };
}

/**
 * @description 下拉选择器节点数据，支持多选、本地过滤、远程搜索及面板事件。
 */
export interface WidgetSelectData extends WidgetBaseData {
    /** 传递给 ElFormItem 或 ElForm 的运行态表单属性。 */
    readonly formAttributes: Partial<Mutable<FormItemProps>>;
    /** 直接传递给渲染组件的运行态属性。 */
    readonly componentAttributes?: Partial<Mutable<SelectProps>>;
    /** 由设置态完整脚本转换得到的运行时函数体集合。 */
    readonly componentFunctions: {
        /** 自定义字段校验脚本的可执行函数体；null 表示未配置。 */
        validate: string | null;
        /** 组件值确认变更事件的可执行函数体；null 表示未配置。 */
        change: string | null;
        /** 组件失焦事件的可执行函数体；null 表示未配置。 */
        blur: string | null;
        /** 组件聚焦事件的可执行函数体；null 表示未配置。 */
        focus: string | null;
        /** 组件清空事件的可执行函数体；null 表示未配置。 */
        clear: string | null;
        /** 多选标签移除事件的可执行函数体；null 表示未配置。 */
        removeTag: string | null;
        /** 弹出面板显隐事件的可执行函数体；null 表示未配置。 */
        visibleChange: string | null;
        /** 自定义选项过滤脚本；运行态保存函数体，设置态保存完整源码。 */
        filterMethod: string | null;
        /** 远程选项查询脚本；运行态保存函数体，设置态保存完整源码。 */
        remoteMethod: string | null;
    };
    /** 设置面板直接编辑和回显的数据集合。 */
    readonly settingData: {
        /** 提交数据使用的业务字段名或嵌套路径；null 表示不进入提交对象。 */
        propName: string | null;
        /** 表单项展示的字段标签文案。 */
        label: string | null;
        /** 表单项标签相对于控件的位置。 */
        labelPosition: "left" | "top" | "right";
        /** 字段首次进入渲染数据时使用的默认值；null 通常表示未设置。 */
        defaultValue: string | null;
        /** 字段是否参与必填校验。 */
        required: boolean;
        /** 字段必填校验失败时展示的错误信息。 */
        requiredMessage: string | null;
        /** 设置面板组合控制项，用于派生禁用、只读和隐藏状态；空数组表示正常显示。 */
        control: ("disabled" | "isHidden")[];
        /** 是否允许一次选择多个选项或多个文件。 */
        multiple: boolean | null;
        /** 单选、复选或选择器使用的候选项列表。 */
        options: Array<{
            /** 候选项展示文案。 */
            label: string;
            /** 候选选项提交和匹配使用的实际值。 */
            value: string;
            /** 是否禁止用户选择当前候选项。 */
            disabled?: boolean;
        }>;
        /** 是否允许用户通过清除按钮移除当前值。 */
        clearable: boolean | null;
        /** 多选时是否把已选项折叠为标签摘要。 */
        collapseTags: boolean | null;
        /** 多选标签折叠前最多直接展示的标签数量。 */
        maxCollapseTags: number | null;
        /** 鼠标悬停折叠标签时是否展示完整选项提示。 */
        collapseTagsTooltip: boolean | null;
        /** 选择器多选模式允许的最大选中数量；null 表示不额外限制。 */
        multipleLimit: number | null;
        /** 字段没有值时在输入区域展示的占位文案。 */
        placeholder: string | null;
        /** 选择器是否支持输入关键字过滤选项。 */
        filterable: boolean | null;
        /** 是否允许根据当前搜索文本创建新选项。 */
        allowCreate: boolean | null;
        /** 选择器是否启用远程搜索模式。 */
        remote: boolean | null;
        /** 远程选项查询脚本；运行态保存函数体，设置态保存完整源码。 */
        remoteMethod: string | null;
        /** 自定义选项过滤脚本；运行态保存函数体，设置态保存完整源码。 */
        filterMethod: string | null;
        /** 设置面板保存的自定义校验完整函数源码。 */
        onValidate: string | null;
        /** 设置面板保存的值变更事件完整函数源码。 */
        onChange: string | null;
        /** 设置面板保存的失焦事件完整函数源码。 */
        onBlur: string | null;
        /** 设置面板保存的聚焦事件完整函数源码。 */
        onFocus: string | null;
        /** 设置面板保存的清空事件完整函数源码。 */
        onClear: string | null;
        /** 设置面板保存的多选标签移除事件完整函数源码。 */
        onRemoveTag: string | null;
        /** 设置面板保存的弹出面板显隐事件完整函数源码。 */
        onVisibleChange: string | null;
    };
}
