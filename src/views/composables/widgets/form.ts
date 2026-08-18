import { reactive, watch } from "vue";
import { type FormItemRule } from "element-plus";
import { randomId, setObjectProperty } from "@yujinjin/utils";
import { type WidgetData, type WidgetFormData, type WidgetNormalData } from "../types";

export const WIDGET_FORM_CODE = "form";

export function useCreateDefaultData(): WidgetFormData {
    return {
        id: WIDGET_FORM_CODE.replace(/-/g, "_") + "_" + randomId(),
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

// 生成表单字段组件的扁平化列表
export function useFlatWidgetList(widgets: Array<WidgetData>): WidgetNormalData[] {
    return widgets.reduce<WidgetNormalData[]>((list, item) => {
        if ("widgets" in item && Array.isArray(item.widgets)) {
            list.push(...item.widgets);
        } else {
            list.push(item as WidgetNormalData);
        }
        return list;
    }, []);
}

// 生成渲染的表单数据
export function useFormRenderData(data: WidgetFormData) {
    const formData = reactive<Record<string, any>>({});
    const syncFormData = function () {
        const widgets = useFlatWidgetList(data.widgets);
        const widgetIds = new Set(widgets.map(item => item.id));
        Object.keys(formData).forEach(id => {
            if (!widgetIds.has(id)) {
                delete formData[id];
            }
        });
        widgets.forEach(item => {
            if (!Object.prototype.hasOwnProperty.call(formData, item.id)) {
                formData[item.id] = item.defaultValue ?? null;
            }
        });
    };
    syncFormData();
    watch(
        () =>
            useFlatWidgetList(data.widgets)
                .map(item => item.id)
                .join(","),
        () => {
            syncFormData();
        }
    );
    return formData;
}

// 生成提交的表单数据
export function useSubmitFormData(data: WidgetFormData, formData: Record<string, any>) {
    const submitData: Record<string, any> = {};
    useFlatWidgetList(data.widgets).forEach(item => {
        if (item.propName) {
            setObjectProperty(submitData, item.propName, formData[item.id]);
        }
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
