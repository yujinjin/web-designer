import { ref } from "vue";
import { type ChangeSelectedWidgetSettingDataFun, type UseSettingDataValueChangeFun, type WidgetBaseData } from "@/views/composables/types";

export default function useJsCodeEditor(
    settingData: WidgetBaseData["settingData"],
    changeSelectedWidgetSettingData: ChangeSelectedWidgetSettingDataFun,
    useSettingDataValueChangeFun: UseSettingDataValueChangeFun
) {
    const isShowJsCodeEditorDialog = ref(false);

    const eventName = ref<string>();

    const eventValue = ref<string>("");

    const showJsCodeEditorDialog = (name: string) => {
        eventName.value = name;
        eventValue.value = settingData![name];
        isShowJsCodeEditorDialog.value = true;
    };

    const closeJsCodeEditorDialog = () => {
        isShowJsCodeEditorDialog.value = false;
    };

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
