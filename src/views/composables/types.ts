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
import { type NotReadonly } from "/#/global.d";

export type UseSettingDataValueChangeFun = (data: any, fileName: keyof WidgetBaseData["settingData"], value: any) => void;

export type ChangeSelectedWidgetSettingDataFun = (useSettingDataValueChangeFun: UseSettingDataValueChangeFun, fileName: string, value: any) => void;

export interface WidgetFormData {
    readonly id: string;
    readonly code: string;
    readonly formAttributes: Partial<NotReadonly<FormProps>>;
    readonly componentFunctions: {
        init: string | null;
    };
    readonly settingData: {
        inline: boolean;
        labelPosition: "left" | "top" | "right";
        labelWidth: string | number | null;
        onInit: string;
    };
    readonly widgets: Array<WidgetBaseData>;
}

export interface WidgetBaseData {
    readonly id: string;
    readonly code: string;
    readonly name: string;
    isShow: boolean;
    defaultValue: any;
    propName: string | null;
    readonly formAttributes?: Record<string, any>;
    readonly componentAttributes?: Record<string, any>;
    readonly componentFunctions?: Record<string, any>;
    readonly settingData?: Record<string, any>;
}

// 先声明 WidgetTextData 接口
export interface WidgetTextData extends WidgetBaseData {
    readonly formAttributes: Partial<NotReadonly<FormItemProps>>;
    readonly componentAttributes: Partial<NotReadonly<InputProps>>;
    readonly componentFunctions: {
        validate: string | null;
        blur: string | null;
        focus: string | null;
        input: string | null;
        change: string | null;
        formatter: string | null;
        parser: string | null;
    };
    readonly settingData: {
        propName: string | null;
        label: string | null;
        labelPosition: "left" | "top" | "right";
        type: "text" | "password" | "textarea";
        placeholder: string | null;
        defaultValue: string | null;
        rows?: number | null;
        showWordLimit: boolean | null;
        control: ("disabled" | "isShow" | "readonly")[];
        clearable: boolean | null;
        maxlength: number | null;
        minlength: number | null;
        formatter: string | null;
        parser: string | null;
        required: boolean;
        requiredMessage: string | null;
        regExp: string | null;
        regExpMessage: string | null;
        onValidate: string | null;
        onBlur: string | null;
        onFocus: string | null;
        onInput: string | null;
        onChange: string | null;
    };
}

// 声明 WidgetInputNumberData 接口
export interface WidgetInputNumberData extends WidgetBaseData {
    readonly formAttributes: Partial<NotReadonly<FormItemProps>>;
    readonly componentAttributes: Partial<NotReadonly<InputNumberProps>>;
    readonly componentFunctions: {
        validate: string | null;
        change: string | null;
        blur: string | null;
        focus: string | null;
    };
    readonly settingData: {
        propName: string | null;
        label: string | null;
        labelPosition: "left" | "top" | "right";
        placeholder: string | null;
        defaultValue: string | null;
        required: boolean;
        requiredMessage: string | null;
        control: ("disabled" | "isShow" | "readonly")[];
        min: number | null;
        max: number | null;
        step: number | null;
        stepStrictly: boolean | null;
        precision: number | null;
        controls: boolean | null;
        controlsPosition: "right" | "" | null;
        align: "center" | "left" | "right";
        onValidate: string | null;
        onBlur: string | null;
        onFocus: string | null;
        onChange: string | null;
    };
}

// 声明 WidgetRadioGroupData 接口
export interface WidgetRadioGroupData extends WidgetBaseData {
    readonly formAttributes: Partial<NotReadonly<FormItemProps>>;
    readonly componentAttributes: Partial<NotReadonly<RadioGroupProps>>;
    readonly componentFunctions: {
        validate: string | null;
        change: string | null;
    };
    readonly settingData: {
        propName: string | null;
        label: string | null;
        labelPosition: "left" | "top" | "right";
        defaultValue: string | number | boolean | null;
        required: boolean;
        requiredMessage: string | null;
        control: ("disabled" | "isShow")[];
        textColor: string | null;
        fill: string | null;
        options: Array<{ label: string; value: string; disabled?: boolean }>;
        type: "radio" | "button";
        onValidate: string | null;
        onChange: string | null;
    };
}

// 声明 WidgetCheckboxGroupData 接口
export interface WidgetCheckboxGroupData extends WidgetBaseData {
    readonly formAttributes: Partial<NotReadonly<FormItemProps>>;
    readonly componentAttributes: Partial<NotReadonly<CheckboxGroupProps>>;
    readonly componentFunctions: {
        validate: string | null;
        change: string | null;
    };
    readonly settingData: {
        propName: string | null;
        label: string | null;
        labelPosition: "left" | "top" | "right";
        defaultValue: string[] | number[] | boolean[] | null;
        required: boolean;
        requiredMessage: string | null;
        control: ("disabled" | "isShow")[];
        min: number | null;
        max: number | null;
        textColor: string | null;
        fill: string | null;
        options: Array<{ label: string; value: string; disabled?: boolean }>;
        type: "checkbox" | "button";
        onValidate: string | null;
        onChange: string | null;
    };
}

// 声明 WidgetSelectData 接口
export interface WidgetSelectData extends WidgetBaseData {
    readonly formAttributes: Partial<NotReadonly<FormItemProps>>;
    readonly componentAttributes: Partial<NotReadonly<SelectProps>>;
    readonly componentFunctions: {
        validate: string | null;
        change: string | null;
        blur: string | null;
        focus: string | null;
        clear: string | null;
        removeTag: string | null;
        visibleChange: string | null;
        filterMethod: string | null;
        remoteMethod: string | null;
    };
    readonly settingData: {
        propName: string | null;
        label: string | null;
        labelPosition: "left" | "top" | "right";
        defaultValue: string | null;
        required: boolean;
        requiredMessage: string | null;
        control: ("disabled" | "isShow")[];
        multiple: boolean | null;
        options: Array<{ label: string; value: string; disabled?: boolean }>;
        clearable: boolean | null;
        collapseTags: boolean | null;
        maxCollapseTags: number | null;
        collapseTagsTooltip: boolean | null;
        multipleLimit: number | null;
        placeholder: string | null;
        filterable: boolean | null;
        allowCreate: boolean | null;
        remote: boolean | null;
        remoteMethod: string | null;
        filterMethod: string | null;
        onValidate: string | null;
        onChange: string | null;
        onBlur: string | null;
        onFocus: string | null;
        onClear: string | null;
        onRemoveTag: string | null;
        onVisibleChange: string | null;
    };
}

// 声明 WidgetDatePickerData 接口
export interface WidgetDatePickerData extends WidgetBaseData {
    readonly formAttributes: Partial<NotReadonly<FormItemProps>>;
    readonly componentAttributes: Partial<NotReadonly<DatePickerProps>>;
    readonly componentFunctions: {
        validate: string | null;
        change: string | null;
        blur: string | null;
        focus: string | null;
        clear: string | null;
        visibleChange: string | null;
        disabledDate: string | null;
        disabledHours: string | null;
        disabledMinutes: string | null;
        disabledSeconds: string | null;
    };
    readonly settingData: {
        propName: string | null;
        label: string | null;
        labelPosition: "left" | "top" | "right";
        defaultValue: any;
        required: boolean;
        requiredMessage: string | null;
        control: ("disabled" | "isShow" | "readonly")[];
        type: "year" | "years" | "month" | "months" | "date" | "dates" | "datetime" | "week" | "datetimerange" | "daterange" | "monthrange" | "yearrange";
        clearable: boolean | null;
        placeholder: string | null;
        startPlaceholder: string | null;
        endPlaceholder: string | null;
        valueFormat: string | null;
        format: string | null;
        dateFormat: string | null;
        timeFormat: string | null;
        editable: boolean | null;
        rangeSeparator: string | null;
        defaultTime: string | null;
        disabledDate: string | null;
        disabledHours: string | null;
        disabledMinutes: string | null;
        disabledSeconds: string | null;
        onValidate: string | null;
        onChange: string | null;
        onBlur: string | null;
        onFocus: string | null;
        onClear: string | null;
        onVisibleChange: string | null;
    };
}

export interface WidgetTimePickerData extends WidgetBaseData {
    readonly formAttributes: Partial<NotReadonly<FormItemProps>>;
    readonly componentAttributes: Partial<NotReadonly<TimePickerDefaultProps>>;
    readonly componentFunctions: {
        validate: string | null;
        change: string | null;
        blur: string | null;
        focus: string | null;
        clear: string | null;
        visibleChange: string | null;
        disabledHours: string | null;
        disabledMinutes: string | null;
        disabledSeconds: string | null;
    };
    readonly settingData: {
        propName: string | null;
        label: string | null;
        labelPosition: "left" | "top" | "right";
        defaultValue: Date | Array<Date> | null;
        required: boolean;
        requiredMessage: string | null;
        control: ("disabled" | "isShow" | "readonly")[];
        clearable: boolean | null;
        placeholder: string | null;
        startPlaceholder: string | null;
        endPlaceholder: string | null;
        isRange: boolean | null;
        valueFormat: string | null;
        format: string | null;
        editable: boolean | null;
        rangeSeparator: string | null;
        disabledHours: string | null;
        disabledMinutes: string | null;
        disabledSeconds: string | null;
        onValidate: string | null;
        onChange: string | null;
        onBlur: string | null;
        onFocus: string | null;
        onClear: string | null;
        onVisibleChange: string | null;
    };
}

// 声明 WidgetTimeSelectData 接口
export interface WidgetTimeSelectData extends WidgetBaseData {
    readonly formAttributes: Partial<NotReadonly<FormItemProps>>;
    readonly componentAttributes: Partial<NotReadonly<TimeSelectProps>>;
    readonly componentFunctions: {
        validate: string | null;
        change: string | null;
        blur: string | null;
        focus: string | null;
        clear: string | null;
    };
    readonly settingData: {
        propName: string | null;
        label: string | null;
        labelPosition: "left" | "top" | "right";
        defaultValue: string | null;
        required: boolean;
        requiredMessage: string | null;
        control: ("disabled" | "isShow")[];
        clearable: boolean | null;
        placeholder: string | null;
        format: string | null;
        editable: boolean | null;
        start: string | null;
        end: string | null;
        step: string | null;
        minTime: string | null;
        maxTime: string | null;
        includeEndTime: boolean | null;
        onValidate: string | null;
        onChange: string | null;
        onBlur: string | null;
        onFocus: string | null;
        onClear: string | null;
    };
}

// 声明 WidgetSwitchData 接口
export interface WidgetSwitchData extends WidgetBaseData {
    readonly formAttributes: Partial<NotReadonly<FormItemProps>>;
    readonly componentAttributes: Partial<NotReadonly<SwitchProps>>;
    readonly componentFunctions: {
        validate: string | null;
        change: string | null;
        beforeChange: string | null;
    };
    readonly settingData: {
        propName: string | null;
        label: string | null;
        labelPosition: "left" | "top" | "right";
        defaultValue: boolean | null;
        required: boolean;
        requiredMessage: string | null;
        control: ("disabled" | "isShow")[];
        inlinePrompt: boolean | null;
        activeText: string | null;
        inactiveText: string | null;
        beforeChange: string | null;
        onValidate: string | null;
        onChange: string | null;
    };
}

export interface WidgetRateData extends WidgetBaseData {
    readonly formAttributes: Partial<NotReadonly<FormItemProps>>;
    readonly componentAttributes: Partial<NotReadonly<RateProps>>;
    readonly componentFunctions: {
        validate: string | null;
        change: string | null;
    };
    readonly settingData: {
        propName: string | null;
        label: string | null;
        labelPosition: "left" | "top" | "right";
        defaultValue: string | null;
        required: boolean;
        requiredMessage: string | null;
        control: ("disabled" | "isShow")[];
        max: number | null;
        allowHalf: boolean | null;
        lowThreshold: number | null;
        highThreshold: number | null;
        showText: boolean | null;
        showScore: boolean | null;
        textColor: string | null;
        clearable: boolean | null;
        onValidate: string | null;
        onChange: string | null;
    };
}

// 声明 WidgetColorPickerData 接口
export interface WidgetColorPickerData extends WidgetBaseData {
    readonly formAttributes: Partial<NotReadonly<FormItemProps>>;
    readonly componentAttributes: Partial<NotReadonly<ColorPickerProps>>;
    readonly componentFunctions: {
        validate: string | null;
        change: string | null;
        activeChange: string | null;
        focus: string | null;
        blur: string | null;
        clear: string | null;
    };
    readonly settingData: {
        propName: string | null;
        label: string | null;
        labelPosition: "left" | "top" | "right";
        defaultValue: string | null;
        required: boolean;
        requiredMessage: string | null;
        control: ("disabled" | "isShow")[];
        clearable: boolean | null;
        showAlpha: boolean | null;
        colorFormat: string | null;
        onValidate: string | null;
        onChange: string | null;
        onActiveChange: string | null;
        onFocus: string | null;
        onBlur: string | null;
        onClear: string | null;
    };
}

// 声明 WidgetSliderData 接口
export interface WidgetSliderData extends WidgetBaseData {
    readonly formAttributes: Partial<NotReadonly<FormItemProps>>;
    readonly componentAttributes: Partial<NotReadonly<SliderProps>>;
    readonly componentFunctions: {
        validate: string | null;
        change: string | null;
        input: string | null;
        formatTooltip: string | null;
        formatValueText: string | null;
    };
    readonly settingData: {
        propName: string | null;
        label: string | null;
        labelPosition: "left" | "top" | "right";
        defaultValue: string | null;
        required: boolean;
        requiredMessage: string | null;
        control: ("disabled" | "isShow")[];
        min: number | null;
        max: number | null;
        step: number | null;
        showInput: boolean | null;
        showInputControls: boolean | null;
        showStops: boolean | null;
        showTooltip: boolean | null;
        formatTooltip: string | null;
        range: boolean | null;
        vertical: boolean | null;
        height: string | null;
        rangeStartLabel: string | null;
        rangeEndLabel: string | null;
        formatValueText: string | null;
        placement: "top" | "top-start" | "top-end" | "bottom" | "bottom-start" | "bottom-end" | "left" | "left-start" | "left-end" | "right" | "right-start" | "right-end" | null;
        marks: object | null;
        persistent: boolean | null;
        onValidate: string | null;
        onChange: string | null;
        onInput: string | null;
    };
}

// 声明 WidgetUploadData 接口
export interface WidgetUploadData extends WidgetBaseData {
    readonly formAttributes: Partial<NotReadonly<FormItemProps>>;
    readonly componentAttributes: Partial<NotReadonly<UploadProps>>;
    readonly componentFunctions: {
        validate: string | null;
        data: string | null;
        onPreview: string | null;
        onRemove: string | null;
        onSuccess: string | null;
        onError: string | null;
        onProgress: string | null;
        onChange: string | null;
        onExceed: string | null;
        beforeUpload: string | null;
        beforeRemove: string | null;
        httpRequest: string | null;
    };
    readonly settingData: {
        propName: string | null;
        label: string | null;
        labelPosition: "left" | "top" | "right";
        defaultValue: string | null;
        required: boolean;
        requiredMessage: string | null;
        control: ("disabled" | "isShow")[];
        action: string | null;
        headers: Record<string, string> | null;
        name: string | null;
        method: string | null;
        multiple: boolean | null;
        showFileList: boolean | null;
        drag: boolean | null;
        accept: string | null;
        autoUpload: boolean | null;
        listType: "text" | "picture" | "picture-card" | null;
        limit: number | null;
        data: string | null;
        onPreview: string | null;
        onRemove: string | null;
        onSuccess: string | null;
        onError: string | null;
        onProgress: string | null;
        onChange: string | null;
        onExceed: string | null;
        beforeUpload: string | null;
        beforeRemove: string | null;
        httpRequest: string | null;
        onValidate: string | null;
    };
}

export interface WidgetHTMLData extends WidgetBaseData {
    readonly settingData: {
        propName: string | null;
        defaultValue: string | null;
        control: "isShow"[];
    };
}

// 声明 WidgetAlertData 接口
export interface WidgetAlertData extends WidgetBaseData {
    readonly componentAttributes: Partial<NotReadonly<AlertProps>>;
    readonly settingData: {
        propName: string | null;
        control: "isShow"[];
        title: string | null;
        description: string | null;
        type: "success" | "info" | "warning" | "error" | null;
        showIcon: boolean | null;
        closable: boolean | null;
        center: boolean | null;
        closeText: string | null;
        effect: "dark" | "light" | null;
    };
}

// 声明 WidgetDividerData 接口
export interface WidgetDividerData extends WidgetBaseData {
    readonly componentAttributes: Partial<NotReadonly<DividerProps>>;
    readonly settingData: {
        propName: string | null;
        control: "isShow"[];
        defaultValue: string | null;
        direction: "horizontal" | "vertical" | null;
        borderStyle: BorderStyle | null;
        contentPosition: "left" | "right" | "center" | null;
    };
}
