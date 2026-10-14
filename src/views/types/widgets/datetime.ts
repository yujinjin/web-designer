/**
 * @fileoverview 日期、时间和固定时间选择组件的数据契约，保留各组件脚本参数与属性边界。
 * @remarks 设置态完整源码与运行函数体分离，默认值仅用于字段首次初始化。
 */
// 全类型导入必须整体擦除，避免 verbatimModuleSyntax 将内联 type 编译为空运行导入。
/* eslint import-x/consistent-type-specifier-style: ["error", "prefer-top-level"] */
import type { FormItemProps, DatePickerProps, TimePickerDefaultProps, TimeSelectProps } from "element-plus";
import type { WidgetBaseData } from "../base";
import type { Mutable } from "/#/global.d";

/**
 * @description 日期选择器节点数据，统一描述单值、范围和日期时间模式。
 */
export interface WidgetDatePickerData extends WidgetBaseData {
    /** 传递给 ElFormItem 或 ElForm 的运行态表单属性。 */
    readonly formAttributes: Partial<Mutable<FormItemProps>>;
    /** 直接传递给渲染组件的运行态属性。 */
    readonly componentAttributes?: Partial<Mutable<DatePickerProps>>;
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
        /** 设置面板组合控制项，用于派生禁用、只读和隐藏状态；空数组表示正常显示。 */
        control: ("disabled" | "isHidden" | "readonly")[];
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
    readonly componentAttributes?: Partial<Mutable<TimePickerDefaultProps>>;
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
        /** 设置面板组合控制项，用于派生禁用、只读和隐藏状态；空数组表示正常显示。 */
        control: ("disabled" | "isHidden" | "readonly")[];
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
    readonly componentAttributes?: Partial<Mutable<TimeSelectProps>>;
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
        /** 设置面板组合控制项，用于派生禁用、只读和隐藏状态；空数组表示正常显示。 */
        control: ("disabled" | "isHidden")[];
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
