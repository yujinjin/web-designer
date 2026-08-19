/**
 * @fileoverview JavaScript 代码编辑弹窗状态模块，维护当前编辑字段、源码副本和显示状态，并通过组件设置适配器保存结果。
 * @remarks 编辑器不直接修改 settingData，保存时复用组件专属同步函数，确保完整源码和运行态函数体保持一致。
 */
import { ref } from "vue";
import { type ChangeSelectedWidgetSettingDataFun, type UseSettingDataValueChangeFun, type WidgetBaseData } from "@/views/composables/types";

/**
 * @description 创建组件动态脚本编辑器的响应式状态和操作方法。
 * @param settingData 当前组件设置态数据，打开弹窗时从指定字段读取完整源码。
 * @param changeSelectedWidgetSettingData 设置面板统一写入入口。
 * @param useSettingDataValueChangeFun 当前组件专属的设置同步适配器。
 * @returns 弹窗显示状态、编辑值及打开、关闭、保存方法。
 */
export default function useJsCodeEditor(
    settingData: WidgetBaseData["settingData"],
    changeSelectedWidgetSettingData: ChangeSelectedWidgetSettingDataFun,
    useSettingDataValueChangeFun: UseSettingDataValueChangeFun
) {
    // 控制代码编辑弹窗的显示状态。
    const isShowJsCodeEditorDialog = ref(false);

    // 记录当前正在编辑的 settingData 脚本字段名。
    const eventName = ref<string>();

    // 保存代码编辑器当前展示和修改的完整函数源码。
    const eventValue = ref<string>("");

    /**
     * @description 打开代码编辑器并载入指定设置字段的源码。
     * @param name 动态脚本在 settingData 中的字段名。
     * @returns 无返回值。
     * @remarks 调用方必须传入实际存在的脚本字段；当前实现不为未知字段提供默认文本。
     */
    const showJsCodeEditorDialog = (name: string) => {
        eventName.value = name;
        eventValue.value = settingData![name];
        isShowJsCodeEditorDialog.value = true;
    };

    /**
     * @description 关闭代码编辑器弹窗。
     * @returns 无返回值；当前字段名和编辑值会保留到下次打开时被覆盖。
     */
    const closeJsCodeEditorDialog = () => {
        isShowJsCodeEditorDialog.value = false;
    };

    /**
     * @description 保存当前源码并关闭编辑器。
     * @param code 编辑器提交的完整函数源码。
     * @returns 无返回值。
     * @remarks 只有已经记录事件字段名时才执行设置同步；适配器异常会直接传播。
     */
    const saveJsCode = (code: string) => {
        if (eventName.value) {
            changeSelectedWidgetSettingData?.(useSettingDataValueChangeFun, eventName.value, code);
        }
        closeJsCodeEditorDialog();
    };

    return {
        isShowJsCodeEditorDialog,
        eventValue,
        showJsCodeEditorDialog,
        closeJsCodeEditorDialog,
        saveJsCode
    };
}
