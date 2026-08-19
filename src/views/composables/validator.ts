/**
 * @fileoverview 表单字段业务属性名校验模块，验证 JavaScript 标识符格式和当前表单内唯一性，并在通过后同步字段设置。
 * @remarks 校验器通过 Vue inject 获取当前表单、选中字段和设置入口；依赖缺失时可完成格式检查，但可选调用不会写回 propName。
 */
import { inject, ref, type Reactive, type Ref } from "vue";
import { type WidgetFormData, type WidgetBaseData } from "@/views/composables/types";

/**
 * @description 创建适用于 Element Plus 表单项的业务属性名校验器。
 * @param useSettingDataValueChangeFun 当前组件专属的设置同步函数。
 * @returns Element Plus 异步校验回调；校验通过时同步当前字段 propName。
 * @remarks 唯一性当前只检查表单顶层 widgets，不会遍历行容器子字段；这是现有实现边界。
 */
export function usePropNameValidator(
    useSettingDataValueChangeFun: /**
     * @description 同步当前组件设置字段。
     * @param data 当前组件数据。
     * @param fileName 待更新的设置字段。
     * @param value 新值。
     * @returns 无返回值。
     */ (data: any, fileName: keyof WidgetBaseData["settingData"], value: any) => void
) {
    // 获取当前表单设计数据，供唯一性检查使用。
    const widgetFormData = inject<Reactive<WidgetFormData>>("widgetFormData");

    // 获取当前选中组件 ID；未提供时使用空选择状态。
    const selectedWigetId = inject<Ref<string | null>>("selectedWigetId", ref<string | null>(null));

    // 获取表单设置的统一写入入口。
    const changeFormSettingData = inject<
        /**
         * @description 将指定设置值交给组件同步适配器处理。
         * @param useSettingDataValueChangeFun 当前组件设置同步函数。
         * @param fileName 待更新的设置字段名。
         * @param value 新值。
         * @returns 无返回值。
         */ (
            useSettingDataValueChangeFun: /**
             * @description 同步当前组件设置字段。
             * @param data 当前组件数据。
             * @param fileName 待更新的设置字段。
             * @param value 新值。
             * @returns 无返回值。
             */ (data: any, fileName: keyof WidgetBaseData["settingData"], value: any) => void,
            fileName: string,
            value: any
        ) => void
    >("changeFormSettingData");

    /**
     * @description 校验属性名必填、标识符格式和表单内唯一性。
     * @param rule Element Plus 当前校验规则；现有逻辑不读取该参数。
     * @param value 待校验的业务属性名。
     * @param callback 校验完成回调，传入 Error 表示失败。
     * @returns 无返回值。
     * @remarks 校验通过会立即调用设置入口写入 propName，因此该校验器同时具有数据同步副作用。
     */
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
