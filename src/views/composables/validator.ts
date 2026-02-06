import { inject, ref, type Reactive, type Ref } from "vue";
import { type WidgetFormData, type WidgetBaseData } from "@/views/composables/types";

// 属性名校验器
export function usePropNameValidator(useSettingDataValueChangeFun: (data: any, fileName: keyof WidgetBaseData["settingData"], value: any) => void) {
    const widgetFormData = inject<Reactive<WidgetFormData>>("widgetFormData");

    const selectedWigetId = inject<Ref<string | null>>("selectedWigetId", ref<string | null>(null));

    const changeFormSettingData =
        inject<(useSettingDataValueChangeFun: (data: any, fileName: keyof WidgetBaseData["settingData"], value: any) => void, fileName: string, value: any) => void>("changeFormSettingData");

    return function (rule: any, value: string, callback: any) {
        if (!value) {
            callback(new Error("请输入唯一名称"));
        } else if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(value)) {
            callback(new Error("属性名必须以字母、下划线或美元符号开头，后续可以是字母、数字、下划线或美元符号"));
        } else if (widgetFormData?.widgets.some((item: any) => item.propName === value && item.id !== selectedWigetId.value)) {
            callback(new Error("属性名已存在"));
        } else {
            // 验证通过直接修改表单数据中的propName
            changeFormSettingData?.(useSettingDataValueChangeFun, "propName", value);
            callback();
        }
    };
}
