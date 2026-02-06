import { type FormItemProps, type InputProps, type FormProps } from "element-plus";
import { type NotReadonly } from "/#/global.d";

export type UseSettingDataValueChangeFun = (data: any, fileName: keyof WidgetBaseData["settingData"], value: any) => void;

export type ChangeSelectedWidgetSettingDataFun = (useSettingDataValueChangeFun: UseSettingDataValueChangeFun, fileName: string, value: any) => void;

export interface WidgetFormData {
    readonly id: string;
    readonly code: string;
    readonly formAttributes: Partial<FormProps>;
    readonly componentEvents: {
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
    defaultValue: string | null;
    propName: string | null;
    readonly formAttributes?: Record<string, any>;
    readonly componentAttributes?: Record<string, any>;
    readonly componentEvents?: Record<string, any>;
    readonly settingData?: Record<string, any>;
}

// 先声明 WidgetTextData 接口
export interface WidgetTextData extends WidgetBaseData {
    readonly formAttributes: Partial<NotReadonly<FormItemProps>>;
    readonly componentAttributes: Partial<NotReadonly<InputProps>>;
    readonly componentEvents: {
        validate: string | null;
        blur: string | null;
        focus: string | null;
        input: string | null;
        change: string | null;
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
        maxlength: number | null;
        minlength: number | null;
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
