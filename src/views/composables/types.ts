/**
 * @fileoverview 表单设计器核心类型契约，定义表单、组件节点、设置态数据、运行属性和动态脚本函数体之间的数据边界。
 * @remarks settingData 保存设置面板原始值，componentAttributes/formAttributes 面向渲染层，componentFunctions 只保存从完整脚本提取的函数体；readonly 用于限制常规替换，不代表所有嵌套值在运行时不可变。
 */
import {
    type FormItemProps,
    type InputProps,
    type InputNumberProps,
    type RadioGroupProps,
    type CheckboxGroupProps,
    type SelectProps,
    type DatePickerProps,
    type TimePickerDefaultProps,
    type TimeSelectProps,
    type SwitchProps,
    type RateProps,
    type ColorPickerProps,
    type SliderProps,
    type UploadProps,
    type FormProps,
    type AlertProps,
    type BorderStyle,
    type DividerProps
} from "element-plus";
import { type Mutable } from "/#/global.d";

/**
 * @description 组件专属设置同步函数协议。
 * @param data 将被原地更新的组件数据。
 * @param fileName 发生变化的设置字段。
 * @param value 设置字段的新值。
 * @returns 无返回值。
 */
export type UseSettingDataValueChangeFun = (data: any, fileName: keyof WidgetBaseData["settingData"], value: any) => void;

/**
 * @description 当前选中组件设置值的统一分发函数协议。
 * @param useSettingDataValueChangeFun 当前组件专属设置同步函数。
 * @param fileName 发生变化的设置字段名。
 * @param value 设置字段的新值。
 * @returns 无返回值。
 */
export type ChangeSelectedWidgetSettingDataFun = (useSettingDataValueChangeFun: UseSettingDataValueChangeFun, fileName: string, value: any) => void;

/**
 * @description 所有可直接参与渲染、取值或展示的非容器组件数据联合类型。
 */
export type WidgetNormalData =
    | WidgetTextData
    | WidgetInputNumberData
    | WidgetRadioGroupData
    | WidgetCheckboxGroupData
    | WidgetSelectData
    | WidgetDatePickerData
    | WidgetTimePickerData
    | WidgetTimeSelectData
    | WidgetSwitchData
    | WidgetRateData
    | WidgetColorPickerData
    | WidgetSliderData
    | WidgetUploadData
    | WidgetHTMLData
    | WidgetAlertData
    | WidgetDividerData;

/**
 * @description 设计器组件树允许保存的节点联合类型，包括普通组件和行容器。
 */
export type WidgetData = WidgetNormalData | WidgetRowContainerData;

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

/**
 * @description 所有设计器组件节点共享的身份、显示、默认值和可选运行数据契约。
 */
export interface WidgetBaseData {
    /** 设计器节点实例的全局唯一标识，同时作为渲染表单值键。 */
    readonly id: string;
    /** 节点或表单类型的稳定标识，用于注册表分发和持久化识别。 */
    readonly code: string;
    /** 组件展示名称、行容器名称或上传文件字段名。 */
    readonly name: string;
    /** 设计器和预览中是否渲染当前节点。 */
    isShow: boolean;
    /** 字段首次进入渲染数据时使用的默认值；null 通常表示未设置。 */
    defaultValue: any;
    /** 提交数据使用的业务字段名或嵌套路径；null 表示不进入提交对象。 */
    propName: string | null;
    /** 传递给 ElFormItem 或 ElForm 的运行态表单属性。 */
    readonly formAttributes?: Record<string, any>;
    /** 直接传递给渲染组件的运行态属性。 */
    readonly componentAttributes?: Record<string, any>;
    /** 由设置态完整脚本转换得到的运行时函数体集合。 */
    readonly componentFunctions?: Record<string, any>;
    /** 设置面板直接编辑和回显的数据集合。 */
    readonly settingData?: Record<string, any>;
}

/**
 * @description 行容器布局节点数据，只组织普通组件并通过 spans 描述 24 栅格宽度。
 */
export interface WidgetRowContainerData extends WidgetBaseData {
    /** 表单顶层组件或行容器直接子组件的响应式数组。 */
    readonly widgets: Array<WidgetNormalData>;
    /** 设置面板直接编辑和回显的数据集合。 */
    readonly settingData: {
        /** 组件展示名称、行容器名称或上传文件字段名。 */
        name: string;
        /** 行容器相邻栅格列之间的间距。 */
        gutter: number;
        /** 行容器子项在主轴方向的排列方式。 */
        justify: "start" | "end" | "center" | "space-around" | "space-between" | "space-evenly";
        /** 组件内容或行容器子项的对齐方式。 */
        align: "top" | "middle" | "bottom";
        /** 是否启用行容器手动栅格宽度配置。 */
        enableSpanConfig: boolean;
        /** 与行容器子组件索引一一对应的栅格宽度数组。 */
        spans: number[];
    };
}

/**
 * @description 文本框或多行文本框节点数据。
 */
export interface WidgetTextData extends WidgetBaseData {
    /** 传递给 ElFormItem 或 ElForm 的运行态表单属性。 */
    readonly formAttributes: Partial<Mutable<FormItemProps>>;
    /** 直接传递给渲染组件的运行态属性。 */
    readonly componentAttributes: Partial<Mutable<InputProps>>;
    /** 由设置态完整脚本转换得到的运行时函数体集合。 */
    readonly componentFunctions: {
        /** 自定义字段校验脚本的可执行函数体；null 表示未配置。 */
        validate: string | null;
        /** 组件失焦事件的可执行函数体；null 表示未配置。 */
        blur: string | null;
        /** 组件聚焦事件的可执行函数体；null 表示未配置。 */
        focus: string | null;
        /** 组件输入过程事件的可执行函数体；null 表示未配置。 */
        input: string | null;
        /** 组件值确认变更事件的可执行函数体；null 表示未配置。 */
        change: string | null;
        /** 输入展示格式化脚本；运行态保存函数体，设置态保存完整源码。 */
        formatter: string | null;
        /** 输入展示值解析脚本；运行态保存函数体，设置态保存完整源码。 */
        parser: string | null;
    };
    /** 设置面板直接编辑和回显的数据集合。 */
    readonly settingData: {
        /** 提交数据使用的业务字段名或嵌套路径；null 表示不进入提交对象。 */
        propName: string | null;
        /** 表单项展示的字段标签文案。 */
        label: string | null;
        /** 表单项标签相对于控件的位置。 */
        labelPosition: "left" | "top" | "right";
        /** 组件具体展示模式或数据选择类型。 */
        type: "text" | "password" | "textarea";
        /** 字段没有值时在输入区域展示的占位文案。 */
        placeholder: string | null;
        /** 字段首次进入渲染数据时使用的默认值；null 通常表示未设置。 */
        defaultValue: string | null;
        /** 多行文本框默认展示的行数。 */
        rows?: number | null;
        /** 文本框是否展示已输入字符数和最大字符数。 */
        showWordLimit: boolean | null;
        /** 设置面板组合控制项，用于派生禁用、只读和显示状态。 */
        control: ("disabled" | "isShow" | "readonly")[];
        /** 是否允许用户通过清除按钮移除当前值。 */
        clearable: boolean | null;
        /** 文本输入允许的最大字符数。 */
        maxlength: number | null;
        /** 文本输入要求的最小字符数。 */
        minlength: number | null;
        /** 输入展示格式化脚本；运行态保存函数体，设置态保存完整源码。 */
        formatter: string | null;
        /** 输入展示值解析脚本；运行态保存函数体，设置态保存完整源码。 */
        parser: string | null;
        /** 字段是否参与必填校验。 */
        required: boolean;
        /** 字段必填校验失败时展示的错误信息。 */
        requiredMessage: string | null;
        /** 字段值校验使用的正则表达式文本；null 表示不启用正则规则。 */
        regExp: string | null;
        /** 正则校验失败时展示的错误信息。 */
        regExpMessage: string | null;
        /** 设置面板保存的自定义校验完整函数源码。 */
        onValidate: string | null;
        /** 设置面板保存的失焦事件完整函数源码。 */
        onBlur: string | null;
        /** 设置面板保存的聚焦事件完整函数源码。 */
        onFocus: string | null;
        /** 设置面板保存的输入过程事件完整函数源码。 */
        onInput: string | null;
        /** 设置面板保存的值变更事件完整函数源码。 */
        onChange: string | null;
    };
}

/**
 * @description 数字输入节点数据，包含数值边界、步长、精度和焦点事件配置。
 */
export interface WidgetInputNumberData extends WidgetBaseData {
    /** 传递给 ElFormItem 或 ElForm 的运行态表单属性。 */
    readonly formAttributes: Partial<Mutable<FormItemProps>>;
    /** 直接传递给渲染组件的运行态属性。 */
    readonly componentAttributes: Partial<Mutable<InputNumberProps>>;
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
    };
    /** 设置面板直接编辑和回显的数据集合。 */
    readonly settingData: {
        /** 提交数据使用的业务字段名或嵌套路径；null 表示不进入提交对象。 */
        propName: string | null;
        /** 表单项展示的字段标签文案。 */
        label: string | null;
        /** 表单项标签相对于控件的位置。 */
        labelPosition: "left" | "top" | "right";
        /** 字段没有值时在输入区域展示的占位文案。 */
        placeholder: string | null;
        /** 字段首次进入渲染数据时使用的默认值；null 通常表示未设置。 */
        defaultValue: string | null;
        /** 字段是否参与必填校验。 */
        required: boolean;
        /** 字段必填校验失败时展示的错误信息。 */
        requiredMessage: string | null;
        /** 设置面板组合控制项，用于派生禁用、只读和显示状态。 */
        control: ("disabled" | "isShow" | "readonly")[];
        /** 组件允许的最小数值或最少选中数量。 */
        min: number | null;
        /** 组件允许的最大数值、最大选中数量或最大评分。 */
        max: number | null;
        /** 数字增减或固定时间选项之间使用的步长。 */
        step: number | null;
        /** 数字输入值是否必须为步长的整数倍。 */
        stepStrictly: boolean | null;
        /** 数字输入保留的小数位数；null 表示沿用组件默认行为。 */
        precision: number | null;
        /** 数字输入组件是否显示增减控制按钮。 */
        controls: boolean | null;
        /** 数字输入增减控制按钮的位置。 */
        controlsPosition: "right" | "" | null;
        /** 组件内容或行容器子项的对齐方式。 */
        align: "center" | "left" | "right";
        /** 设置面板保存的自定义校验完整函数源码。 */
        onValidate: string | null;
        /** 设置面板保存的失焦事件完整函数源码。 */
        onBlur: string | null;
        /** 设置面板保存的聚焦事件完整函数源码。 */
        onFocus: string | null;
        /** 设置面板保存的值变更事件完整函数源码。 */
        onChange: string | null;
    };
}

/**
 * @description 单选组节点数据，支持普通单选和按钮两种展示形态。
 */
export interface WidgetRadioGroupData extends WidgetBaseData {
    /** 传递给 ElFormItem 或 ElForm 的运行态表单属性。 */
    readonly formAttributes: Partial<Mutable<FormItemProps>>;
    /** 直接传递给渲染组件的运行态属性。 */
    readonly componentAttributes: Partial<Mutable<RadioGroupProps>>;
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
        /** 设置面板组合控制项，用于派生禁用、只读和显示状态。 */
        control: ("disabled" | "isShow")[];
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
    readonly componentAttributes: Partial<Mutable<CheckboxGroupProps>>;
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
        defaultValue: string[] | number[] | boolean[] | null;
        /** 字段是否参与必填校验。 */
        required: boolean;
        /** 字段必填校验失败时展示的错误信息。 */
        requiredMessage: string | null;
        /** 设置面板组合控制项，用于派生禁用、只读和显示状态。 */
        control: ("disabled" | "isShow")[];
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
    readonly componentAttributes: Partial<Mutable<SelectProps>>;
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
        /** 设置面板组合控制项，用于派生禁用、只读和显示状态。 */
        control: ("disabled" | "isShow")[];
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

/**
 * @description 日期选择器节点数据，统一描述单值、范围和日期时间模式。
 */
export interface WidgetDatePickerData extends WidgetBaseData {
    /** 传递给 ElFormItem 或 ElForm 的运行态表单属性。 */
    readonly formAttributes: Partial<Mutable<FormItemProps>>;
    /** 直接传递给渲染组件的运行态属性。 */
    readonly componentAttributes: Partial<Mutable<DatePickerProps>>;
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
        /** 弹出面板显隐事件的可执行函数体；null 表示未配置。 */
        visibleChange: string | null;
        /** 禁用日期规则脚本；运行态保存函数体，设置态保存完整源码。 */
        disabledDate: string | null;
        /** 禁用小时规则脚本；运行态保存函数体，设置态保存完整源码。 */
        disabledHours: string | null;
        /** 禁用分钟规则脚本；运行态保存函数体，设置态保存完整源码。 */
        disabledMinutes: string | null;
        /** 禁用秒规则脚本；运行态保存函数体，设置态保存完整源码。 */
        disabledSeconds: string | null;
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
        defaultValue: any;
        /** 字段是否参与必填校验。 */
        required: boolean;
        /** 字段必填校验失败时展示的错误信息。 */
        requiredMessage: string | null;
        /** 设置面板组合控制项，用于派生禁用、只读和显示状态。 */
        control: ("disabled" | "isShow" | "readonly")[];
        /** 组件具体展示模式或数据选择类型。 */
        type: "year" | "years" | "month" | "months" | "date" | "dates" | "datetime" | "week" | "datetimerange" | "daterange" | "monthrange" | "yearrange";
        /** 是否允许用户通过清除按钮移除当前值。 */
        clearable: boolean | null;
        /** 字段没有值时在输入区域展示的占位文案。 */
        placeholder: string | null;
        /** 范围选择器开始值输入区域的占位文案。 */
        startPlaceholder: string | null;
        /** 范围选择器结束值输入区域的占位文案。 */
        endPlaceholder: string | null;
        /** 组件写入模型时使用的值格式。 */
        valueFormat: string | null;
        /** 组件值在界面中的展示格式。 */
        format: string | null;
        /** 日期部分的展示格式。 */
        dateFormat: string | null;
        /** 日期时间选择器时间部分的展示格式。 */
        timeFormat: string | null;
        /** 是否允许用户直接编辑输入框中的日期或时间文本。 */
        editable: boolean | null;
        /** 范围选择器开始值与结束值之间的分隔文案。 */
        rangeSeparator: string | null;
        /** 选择日期时补入的默认时间值。 */
        defaultTime: string | null;
        /** 禁用日期规则脚本；运行态保存函数体，设置态保存完整源码。 */
        disabledDate: string | null;
        /** 禁用小时规则脚本；运行态保存函数体，设置态保存完整源码。 */
        disabledHours: string | null;
        /** 禁用分钟规则脚本；运行态保存函数体，设置态保存完整源码。 */
        disabledMinutes: string | null;
        /** 禁用秒规则脚本；运行态保存函数体，设置态保存完整源码。 */
        disabledSeconds: string | null;
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
        /** 设置面板保存的弹出面板显隐事件完整函数源码。 */
        onVisibleChange: string | null;
    };
}

/**
 * @description 时间选择器节点数据，支持单时间、时间范围和禁用时分秒规则。
 */
export interface WidgetTimePickerData extends WidgetBaseData {
    /** 传递给 ElFormItem 或 ElForm 的运行态表单属性。 */
    readonly formAttributes: Partial<Mutable<FormItemProps>>;
    /** 直接传递给渲染组件的运行态属性。 */
    readonly componentAttributes: Partial<Mutable<TimePickerDefaultProps>>;
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
        /** 弹出面板显隐事件的可执行函数体；null 表示未配置。 */
        visibleChange: string | null;
        /** 禁用小时规则脚本；运行态保存函数体，设置态保存完整源码。 */
        disabledHours: string | null;
        /** 禁用分钟规则脚本；运行态保存函数体，设置态保存完整源码。 */
        disabledMinutes: string | null;
        /** 禁用秒规则脚本；运行态保存函数体，设置态保存完整源码。 */
        disabledSeconds: string | null;
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
        defaultValue: Date | Array<Date> | null;
        /** 字段是否参与必填校验。 */
        required: boolean;
        /** 字段必填校验失败时展示的错误信息。 */
        requiredMessage: string | null;
        /** 设置面板组合控制项，用于派生禁用、只读和显示状态。 */
        control: ("disabled" | "isShow" | "readonly")[];
        /** 是否允许用户通过清除按钮移除当前值。 */
        clearable: boolean | null;
        /** 字段没有值时在输入区域展示的占位文案。 */
        placeholder: string | null;
        /** 范围选择器开始值输入区域的占位文案。 */
        startPlaceholder: string | null;
        /** 范围选择器结束值输入区域的占位文案。 */
        endPlaceholder: string | null;
        /** 时间选择器是否使用开始和结束时间范围模式。 */
        isRange: boolean | null;
        /** 组件写入模型时使用的值格式。 */
        valueFormat: string | null;
        /** 组件值在界面中的展示格式。 */
        format: string | null;
        /** 是否允许用户直接编辑输入框中的日期或时间文本。 */
        editable: boolean | null;
        /** 范围选择器开始值与结束值之间的分隔文案。 */
        rangeSeparator: string | null;
        /** 禁用小时规则脚本；运行态保存函数体，设置态保存完整源码。 */
        disabledHours: string | null;
        /** 禁用分钟规则脚本；运行态保存函数体，设置态保存完整源码。 */
        disabledMinutes: string | null;
        /** 禁用秒规则脚本；运行态保存函数体，设置态保存完整源码。 */
        disabledSeconds: string | null;
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
        /** 设置面板保存的弹出面板显隐事件完整函数源码。 */
        onVisibleChange: string | null;
    };
}

/**
 * @description 固定步长时间选项节点数据，模型值使用格式化后的时间字符串。
 */
export interface WidgetTimeSelectData extends WidgetBaseData {
    /** 传递给 ElFormItem 或 ElForm 的运行态表单属性。 */
    readonly formAttributes: Partial<Mutable<FormItemProps>>;
    /** 直接传递给渲染组件的运行态属性。 */
    readonly componentAttributes: Partial<Mutable<TimeSelectProps>>;
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
        /** 设置面板组合控制项，用于派生禁用、只读和显示状态。 */
        control: ("disabled" | "isShow")[];
        /** 是否允许用户通过清除按钮移除当前值。 */
        clearable: boolean | null;
        /** 字段没有值时在输入区域展示的占位文案。 */
        placeholder: string | null;
        /** 组件值在界面中的展示格式。 */
        format: string | null;
        /** 是否允许用户直接编辑输入框中的日期或时间文本。 */
        editable: boolean | null;
        /** 固定时间选项列表的开始时间。 */
        start: string | null;
        /** 固定时间选项列表的结束时间。 */
        end: string | null;
        /** 数字增减或固定时间选项之间使用的步长。 */
        step: string | null;
        /** 固定时间选项允许选择的最小时间。 */
        minTime: string | null;
        /** 固定时间选项允许选择的最大时间。 */
        maxTime: string | null;
        /** 固定时间选项是否包含结束时间本身。 */
        includeEndTime: boolean | null;
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
    };
}

/**
 * @description 开关节点数据，包含状态文案和切换前异步拦截脚本。
 */
export interface WidgetSwitchData extends WidgetBaseData {
    /** 传递给 ElFormItem 或 ElForm 的运行态表单属性。 */
    readonly formAttributes: Partial<Mutable<FormItemProps>>;
    /** 直接传递给渲染组件的运行态属性。 */
    readonly componentAttributes: Partial<Mutable<SwitchProps>>;
    /** 由设置态完整脚本转换得到的运行时函数体集合。 */
    readonly componentFunctions: {
        /** 自定义字段校验脚本的可执行函数体；null 表示未配置。 */
        validate: string | null;
        /** 组件值确认变更事件的可执行函数体；null 表示未配置。 */
        change: string | null;
        /** 开关切换前拦截脚本；运行态保存函数体，设置态保存完整源码。 */
        beforeChange: string | null;
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
        defaultValue: boolean | null;
        /** 字段是否参与必填校验。 */
        required: boolean;
        /** 字段必填校验失败时展示的错误信息。 */
        requiredMessage: string | null;
        /** 设置面板组合控制项，用于派生禁用、只读和显示状态。 */
        control: ("disabled" | "isShow")[];
        /** 开关状态文案是否显示在开关轨道内部。 */
        inlinePrompt: boolean | null;
        /** 开关处于激活状态时展示的文案。 */
        activeText: string | null;
        /** 开关处于未激活状态时展示的文案。 */
        inactiveText: string | null;
        /** 开关切换前拦截脚本；运行态保存函数体，设置态保存完整源码。 */
        beforeChange: string | null;
        /** 设置面板保存的自定义校验完整函数源码。 */
        onValidate: string | null;
        /** 设置面板保存的值变更事件完整函数源码。 */
        onChange: string | null;
    };
}

/**
 * @description 评分节点数据，包含最大分值、半星、颜色阈值和展示文本配置。
 */
export interface WidgetRateData extends WidgetBaseData {
    /** 传递给 ElFormItem 或 ElForm 的运行态表单属性。 */
    readonly formAttributes: Partial<Mutable<FormItemProps>>;
    /** 直接传递给渲染组件的运行态属性。 */
    readonly componentAttributes: Partial<Mutable<RateProps>>;
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
        defaultValue: string | null;
        /** 字段是否参与必填校验。 */
        required: boolean;
        /** 字段必填校验失败时展示的错误信息。 */
        requiredMessage: string | null;
        /** 设置面板组合控制项，用于派生禁用、只读和显示状态。 */
        control: ("disabled" | "isShow")[];
        /** 组件允许的最大数值、最大选中数量或最大评分。 */
        max: number | null;
        /** 评分组件是否允许选择半星。 */
        allowHalf: boolean | null;
        /** 评分颜色离开低分区间的阈值。 */
        lowThreshold: number | null;
        /** 评分颜色进入高分区间的阈值。 */
        highThreshold: number | null;
        /** 评分组件是否展示当前分值对应的辅助文本。 */
        showText: boolean | null;
        /** 评分组件是否展示当前数值分数。 */
        showScore: boolean | null;
        /** 按钮形态选项或评分文本使用的颜色。 */
        textColor: string | null;
        /** 是否允许用户通过清除按钮移除当前值。 */
        clearable: boolean | null;
        /** 设置面板保存的自定义校验完整函数源码。 */
        onValidate: string | null;
        /** 设置面板保存的值变更事件完整函数源码。 */
        onChange: string | null;
    };
}

/**
 * @description 颜色选择器节点数据，支持透明度、输出格式和临时激活值事件。
 */
export interface WidgetColorPickerData extends WidgetBaseData {
    /** 传递给 ElFormItem 或 ElForm 的运行态表单属性。 */
    readonly formAttributes: Partial<Mutable<FormItemProps>>;
    /** 直接传递给渲染组件的运行态属性。 */
    readonly componentAttributes: Partial<Mutable<ColorPickerProps>>;
    /** 由设置态完整脚本转换得到的运行时函数体集合。 */
    readonly componentFunctions: {
        /** 自定义字段校验脚本的可执行函数体；null 表示未配置。 */
        validate: string | null;
        /** 组件值确认变更事件的可执行函数体；null 表示未配置。 */
        change: string | null;
        /** 颜色面板临时激活值变更事件的可执行函数体；null 表示未配置。 */
        activeChange: string | null;
        /** 组件聚焦事件的可执行函数体；null 表示未配置。 */
        focus: string | null;
        /** 组件失焦事件的可执行函数体；null 表示未配置。 */
        blur: string | null;
        /** 组件清空事件的可执行函数体；null 表示未配置。 */
        clear: string | null;
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
        /** 设置面板组合控制项，用于派生禁用、只读和显示状态。 */
        control: ("disabled" | "isShow")[];
        /** 是否允许用户通过清除按钮移除当前值。 */
        clearable: boolean | null;
        /** 颜色选择器是否允许编辑透明度通道。 */
        showAlpha: boolean | null;
        /** 颜色值的输出格式，例如 hex、rgb 或 hsl。 */
        colorFormat: string | null;
        /** 设置面板保存的自定义校验完整函数源码。 */
        onValidate: string | null;
        /** 设置面板保存的值变更事件完整函数源码。 */
        onChange: string | null;
        /** 设置面板保存的颜色临时激活值事件完整函数源码。 */
        onActiveChange: string | null;
        /** 设置面板保存的聚焦事件完整函数源码。 */
        onFocus: string | null;
        /** 设置面板保存的失焦事件完整函数源码。 */
        onBlur: string | null;
        /** 设置面板保存的清空事件完整函数源码。 */
        onClear: string | null;
    };
}

/**
 * @description 滑块节点数据，支持单值、范围、刻度、输入框和文本格式化脚本。
 */
export interface WidgetSliderData extends WidgetBaseData {
    /** 传递给 ElFormItem 或 ElForm 的运行态表单属性。 */
    readonly formAttributes: Partial<Mutable<FormItemProps>>;
    /** 直接传递给渲染组件的运行态属性。 */
    readonly componentAttributes: Partial<Mutable<SliderProps>>;
    /** 由设置态完整脚本转换得到的运行时函数体集合。 */
    readonly componentFunctions: {
        /** 自定义字段校验脚本的可执行函数体；null 表示未配置。 */
        validate: string | null;
        /** 组件值确认变更事件的可执行函数体；null 表示未配置。 */
        change: string | null;
        /** 组件输入过程事件的可执行函数体；null 表示未配置。 */
        input: string | null;
        /** 滑块提示文本格式化脚本；运行态保存函数体，设置态保存完整源码。 */
        formatTooltip: string | null;
        /** 滑块值文本格式化脚本；运行态保存函数体，设置态保存完整源码。 */
        formatValueText: string | null;
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
        /** 设置面板组合控制项，用于派生禁用、只读和显示状态。 */
        control: ("disabled" | "isShow")[];
        /** 组件允许的最小数值或最少选中数量。 */
        min: number | null;
        /** 组件允许的最大数值、最大选中数量或最大评分。 */
        max: number | null;
        /** 数字增减或固定时间选项之间使用的步长。 */
        step: number | null;
        /** 滑块是否同时展示可直接输入数值的输入框。 */
        showInput: boolean | null;
        /** 滑块配套输入框是否展示增减控制按钮。 */
        showInputControls: boolean | null;
        /** 滑块是否在每个步长位置展示间断点。 */
        showStops: boolean | null;
        /** 滑块拖动或悬停时是否展示数值提示。 */
        showTooltip: boolean | null;
        /** 滑块提示文本格式化脚本；运行态保存函数体，设置态保存完整源码。 */
        formatTooltip: string | null;
        /** 滑块是否使用起止值数组的范围模式。 */
        range: boolean | null;
        /** 滑块是否使用垂直方向展示。 */
        vertical: boolean | null;
        /** 垂直滑块的组件高度。 */
        height: string | null;
        /** 滑块范围开始端的无障碍标签。 */
        rangeStartLabel: string | null;
        /** 滑块范围结束端的无障碍标签。 */
        rangeEndLabel: string | null;
        /** 滑块值文本格式化脚本；运行态保存函数体，设置态保存完整源码。 */
        formatValueText: string | null;
        /** 滑块提示层相对于滑块的位置。 */
        placement: "top" | "top-start" | "top-end" | "bottom" | "bottom-start" | "bottom-end" | "left" | "left-start" | "left-end" | "right" | "right-start" | "right-end" | null;
        /** 滑块指定刻度位置及对应展示内容的映射。 */
        marks: object | null;
        /** 滑块提示层隐藏后是否继续保留在 DOM 中。 */
        persistent: boolean | null;
        /** 设置面板保存的自定义校验完整函数源码。 */
        onValidate: string | null;
        /** 设置面板保存的值变更事件完整函数源码。 */
        onChange: string | null;
        /** 设置面板保存的输入过程事件完整函数源码。 */
        onInput: string | null;
    };
}

/**
 * @description 文件上传节点数据，描述上传请求属性、文件列表展示和完整钩子脚本集合。
 */
export interface WidgetUploadData extends WidgetBaseData {
    /** 传递给 ElFormItem 或 ElForm 的运行态表单属性。 */
    readonly formAttributes: Partial<Mutable<FormItemProps>>;
    /** 直接传递给渲染组件的运行态属性。 */
    readonly componentAttributes: Partial<Mutable<UploadProps>>;
    /** 由设置态完整脚本转换得到的运行时函数体集合。 */
    readonly componentFunctions: {
        /** 自定义字段校验脚本的可执行函数体；null 表示未配置。 */
        validate: string | null;
        /** 上传附加数据脚本；运行态保存函数体，设置态保存完整源码。 */
        data: string | null;
        /** 设置面板保存的文件预览事件完整函数源码或对应运行时函数体。 */
        onPreview: string | null;
        /** 设置面板保存的文件移除事件完整函数源码或对应运行时函数体。 */
        onRemove: string | null;
        /** 设置面板保存的上传成功事件完整函数源码或对应运行时函数体。 */
        onSuccess: string | null;
        /** 设置面板保存的上传失败事件完整函数源码或对应运行时函数体。 */
        onError: string | null;
        /** 设置面板保存的上传进度事件完整函数源码或对应运行时函数体。 */
        onProgress: string | null;
        /** 设置面板保存的值变更事件完整函数源码。 */
        onChange: string | null;
        /** 设置面板保存的文件数量超限事件完整函数源码或对应运行时函数体。 */
        onExceed: string | null;
        /** 文件上传前拦截脚本；运行态保存函数体，设置态保存完整源码。 */
        beforeUpload: string | null;
        /** 文件移除前拦截脚本；运行态保存函数体，设置态保存完整源码。 */
        beforeRemove: string | null;
        /** 自定义上传请求脚本；运行态保存函数体，设置态保存完整源码。 */
        httpRequest: string | null;
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
        /** 设置面板组合控制项，用于派生禁用、只读和显示状态。 */
        control: ("disabled" | "isShow")[];
        /** 上传请求目标地址。 */
        action: string | null;
        /** 上传请求携带的 HTTP 请求头。 */
        headers: Record<string, string> | null;
        /** 组件展示名称、行容器名称或上传文件字段名。 */
        name: string | null;
        /** 上传请求使用的 HTTP 方法。 */
        method: string | null;
        /** 是否允许一次选择多个选项或多个文件。 */
        multiple: boolean | null;
        /** 上传组件是否展示当前文件列表。 */
        showFileList: boolean | null;
        /** 上传组件是否使用拖拽选择文件模式。 */
        drag: boolean | null;
        /** 允许选择的文件类型或扩展名过滤规则。 */
        accept: string | null;
        /** 选择文件后是否立即自动上传。 */
        autoUpload: boolean | null;
        /** 上传文件列表的展示形态。 */
        listType: "text" | "picture" | "picture-card" | null;
        /** 上传文件列表允许的最大文件数量；null 表示不额外限制。 */
        limit: number | null;
        /** 上传附加数据脚本；运行态保存函数体，设置态保存完整源码。 */
        data: string | null;
        /** 设置面板保存的文件预览事件完整函数源码或对应运行时函数体。 */
        onPreview: string | null;
        /** 设置面板保存的文件移除事件完整函数源码或对应运行时函数体。 */
        onRemove: string | null;
        /** 设置面板保存的上传成功事件完整函数源码或对应运行时函数体。 */
        onSuccess: string | null;
        /** 设置面板保存的上传失败事件完整函数源码或对应运行时函数体。 */
        onError: string | null;
        /** 设置面板保存的上传进度事件完整函数源码或对应运行时函数体。 */
        onProgress: string | null;
        /** 设置面板保存的值变更事件完整函数源码。 */
        onChange: string | null;
        /** 设置面板保存的文件数量超限事件完整函数源码或对应运行时函数体。 */
        onExceed: string | null;
        /** 文件上传前拦截脚本；运行态保存函数体，设置态保存完整源码。 */
        beforeUpload: string | null;
        /** 文件移除前拦截脚本；运行态保存函数体，设置态保存完整源码。 */
        beforeRemove: string | null;
        /** 自定义上传请求脚本；运行态保存函数体，设置态保存完整源码。 */
        httpRequest: string | null;
        /** 设置面板保存的自定义校验完整函数源码。 */
        onValidate: string | null;
    };
}

/**
 * @description 原始 HTML 展示节点数据，defaultValue 由渲染层作为 HTML 内容输出。
 */
export interface WidgetHTMLData extends WidgetBaseData {
    /** 设置面板直接编辑和回显的数据集合。 */
    readonly settingData: {
        /** 提交数据使用的业务字段名或嵌套路径；null 表示不进入提交对象。 */
        propName: string | null;
        /** 字段首次进入渲染数据时使用的默认值；null 通常表示未设置。 */
        defaultValue: string | null;
        /** 设置面板组合控制项，用于派生禁用、只读和显示状态。 */
        control: "isShow"[];
    };
}

/**
 * @description 提示信息展示节点数据，不参与普通表单取值和校验。
 */
export interface WidgetAlertData extends WidgetBaseData {
    /** 直接传递给渲染组件的运行态属性。 */
    readonly componentAttributes: Partial<Mutable<AlertProps>>;
    /** 设置面板直接编辑和回显的数据集合。 */
    readonly settingData: {
        /** 提交数据使用的业务字段名或嵌套路径；null 表示不进入提交对象。 */
        propName: string | null;
        /** 设置面板组合控制项，用于派生禁用、只读和显示状态。 */
        control: "isShow"[];
        /** 提示信息展示的主标题。 */
        title: string | null;
        /** 组件用途的简短描述。 */
        description: string | null;
        /** 组件具体展示模式或数据选择类型。 */
        type: "success" | "info" | "warning" | "error" | null;
        /** 提示信息是否展示状态图标。 */
        showIcon: boolean | null;
        /** 提示信息是否允许关闭。 */
        closable: boolean | null;
        /** 提示内容是否居中展示。 */
        center: boolean | null;
        /** 提示信息关闭按钮的自定义文案。 */
        closeText: string | null;
        /** 提示信息使用浅色或深色主题。 */
        effect: "dark" | "light" | null;
    };
}

/**
 * @description 分隔线展示节点数据，defaultValue 表示分隔线文案而不是提交字段值。
 */
export interface WidgetDividerData extends WidgetBaseData {
    /** 直接传递给渲染组件的运行态属性。 */
    readonly componentAttributes: Partial<Mutable<DividerProps>>;
    /** 设置面板直接编辑和回显的数据集合。 */
    readonly settingData: {
        /** 提交数据使用的业务字段名或嵌套路径；null 表示不进入提交对象。 */
        propName: string | null;
        /** 设置面板组合控制项，用于派生禁用、只读和显示状态。 */
        control: "isShow"[];
        /** 字段首次进入渲染数据时使用的默认值；null 通常表示未设置。 */
        defaultValue: string | null;
        /** 分隔线的水平或垂直方向。 */
        direction: "horizontal" | "vertical" | null;
        /** 分隔线边框线型。 */
        borderStyle: BorderStyle | null;
        /** 分隔线文案在横向分隔线中的位置。 */
        contentPosition: "left" | "right" | "center" | null;
    };
}
