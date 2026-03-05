import { reactive, watch } from "vue";
import { type FormItemRule } from "element-plus";
import { randomId, setObjectProperty } from "@yujinjin/utils";
import { type WidgetFormData } from "../types";

export const WIDGET_FORM_CODE = "form";

export function useCreateDefaultData(): WidgetFormData {
    return {
        id: WIDGET_FORM_CODE + "_" + randomId(),
        code: WIDGET_FORM_CODE,
        formAttributes: {
            inline: false,
            labelPosition: "left",
            labelWidth: 120,
            disabled: false
        },
        componentFunctions: {
            init: null
        },
        settingData: {
            inline: false,
            labelPosition: "left",
            labelWidth: 120,
            onInit: `function onInit(widgetFormData, formData) {
    // 请在这里编写函数体逻辑，可直接使用 widgetFormData/formData 参数
}`
        },
        widgets: []
    };
}

export function useSettingDataValueChange(data: WidgetFormData, fileName: keyof WidgetFormData["settingData"], value: any) {
    switch (fileName) {
        case "inline":
        case "labelPosition":
        case "labelWidth":
            data.formAttributes[fileName] = value;
            break;
        case "onInit": {
            data.componentFunctions.init = value ? value.split("\n").slice(1, -1).join("\n") : null;
        }
    }
    (data.settingData as any)[fileName] = value;
}

// 生成渲染的表单数据
export function useFormRenderData(data: WidgetFormData) {
    const formData = reactive<Record<string, any>>({});
    data.widgets.forEach(item => {
        formData[item.id] = item.defaultValue || null;
    });
    watch(
        () => data.widgets.length,
        () => {
            data.widgets.forEach(item => {
                formData[item.id] = formData[item.id] || item.defaultValue || null;
            });
        }
    );
    return formData;
}

// 生成提交的表单数据
export function useSubmitFormData(data: WidgetFormData, formData: Record<string, any>) {
    const submitData: Record<string, any> = {};
    data.widgets.forEach(item => {
        setObjectProperty(submitData, item.propName as string, formData[item.id]);
    });
    return submitData;
}

export function useFormItemRules(
    {
        required,
        requiredMessage,
        regExp,
        regExpMessage,
        validate
    }: { required: boolean; requiredMessage?: string | null; regExp?: string | null; regExpMessage?: string | null; validate?: string | null },
    formData: Record<string, any>,
    widgetFormData: WidgetFormData
) {
    const rules: Array<FormItemRule> = [];
    if (required) {
        rules.push({ required: true, message: requiredMessage || "请输入" });
    }
    if (regExp) {
        rules.push({ pattern: new RegExp(regExp), message: regExpMessage || "格式错误" });
    }
    if (validate) {
        rules.push({
            validator: (rule: any, value: any, callback: (error?: string) => void) => {
                return new Function("value", "callback", "formData", "widgetFormData", validate)(value, callback, formData, widgetFormData);
            }
        });
    }
    return rules;
}
