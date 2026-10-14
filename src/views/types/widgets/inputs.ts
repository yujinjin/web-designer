/**
 * @fileoverview 输入与数值类组件的数据契约，包括文本、数字、开关、评分、颜色、滑块和文件上传。
 * @remarks settingData 保存设置态值和完整源码；componentAttributes 是可缺省、不可持久化的运行缓存。
 */
// 全类型导入必须整体擦除，避免 verbatimModuleSyntax 将内联 type 编译为空运行导入。
/* eslint import-x/consistent-type-specifier-style: ["error", "prefer-top-level"] */
import type { FormItemProps, InputProps, InputNumberProps, SwitchProps, RateProps, ColorPickerProps, SliderProps, UploadProps, UploadUserFile } from "element-plus";
import type { WidgetBaseData } from "../base";
import type { Mutable } from "/#/global.d";

/**
 * @description 文本框或多行文本框节点数据。
 */
export interface WidgetTextData extends WidgetBaseData {
    /** 传递给 ElFormItem 或 ElForm 的运行态表单属性。 */
    readonly formAttributes: Partial<Mutable<FormItemProps>>;
    /** 直接传递给渲染组件的运行态属性。 */
    readonly componentAttributes?: Partial<Mutable<InputProps>>;
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
        /** 设置面板组合控制项，用于派生禁用、只读和隐藏状态；空数组表示正常显示。 */
        control: ("disabled" | "isHidden" | "readonly")[];
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
    readonly componentAttributes?: Partial<Mutable<InputNumberProps>>;
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
        /** 设置面板组合控制项，用于派生禁用、只读和隐藏状态；空数组表示正常显示。 */
        control: ("disabled" | "isHidden" | "readonly")[];
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
 * @description 开关节点数据，包含状态文案和切换前异步拦截脚本。
 */
export interface WidgetSwitchData extends WidgetBaseData {
    /** 传递给 ElFormItem 或 ElForm 的运行态表单属性。 */
    readonly formAttributes: Partial<Mutable<FormItemProps>>;
    /** 直接传递给渲染组件的运行态属性。 */
    readonly componentAttributes?: Partial<Mutable<SwitchProps>>;
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
        /** 设置面板组合控制项，用于派生禁用、只读和隐藏状态；空数组表示正常显示。 */
        control: ("disabled" | "isHidden")[];
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
    readonly componentAttributes?: Partial<Mutable<RateProps>>;
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
        /** 设置面板组合控制项，用于派生禁用、只读和隐藏状态；空数组表示正常显示。 */
        control: ("disabled" | "isHidden")[];
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
    readonly componentAttributes?: Partial<Mutable<ColorPickerProps>>;
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
        /** 设置面板组合控制项，用于派生禁用、只读和隐藏状态；空数组表示正常显示。 */
        control: ("disabled" | "isHidden")[];
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
    readonly componentAttributes?: Partial<Mutable<SliderProps>>;
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
        /** 设置面板组合控制项，用于派生禁用、只读和隐藏状态；空数组表示正常显示。 */
        control: ("disabled" | "isHidden")[];
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
    readonly componentAttributes?: Partial<Mutable<UploadProps>>;
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
        /** 字段首次进入渲染数据时使用的文件列表；空数组表示没有文件。 */
        defaultValue: UploadUserFile[];
        /** 字段是否参与必填校验。 */
        required: boolean;
        /** 字段必填校验失败时展示的错误信息。 */
        requiredMessage: string | null;
        /** 设置面板组合控制项，用于派生禁用、只读和隐藏状态；空数组表示正常显示。 */
        control: ("disabled" | "isHidden")[];
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
