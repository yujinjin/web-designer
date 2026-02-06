import { type Reactive, type Ref } from "vue";
import { useSettingDataValueChange } from "@/views/composables/widgets/form";
import { type WidgetFormData, type WidgetBaseData, type UseSettingDataValueChangeFun, type ChangeSelectedWidgetSettingDataFun } from "@/views/composables/types";

export default function useWidgetManage(widgetFormData: Reactive<WidgetFormData>, selectedWigetId: Ref<string | null>) {
    // 改变选中的组件id
    const changeSelectedWidgetId = function (id: string | null) {
        selectedWigetId.value = id;
    };

    // 改变选中的组件的设置数据
    const changeSelectedWidgetSettingData: ChangeSelectedWidgetSettingDataFun = function (useSettingDataValueChangeFun: UseSettingDataValueChangeFun, fileName: string, value: any) {
        if (!selectedWigetId.value || !widgetFormData.widgets.length) {
            return;
        }
        const widgetData = widgetFormData.widgets.find((item: any) => item.id === selectedWigetId.value);
        if (widgetData) {
            useSettingDataValueChangeFun(widgetData, fileName as keyof WidgetBaseData["settingData"], value);
        }
    };

    // 考虑框架上规范设计不违背provide/inject 的设计语义（数据溯源困难、逻辑耦合、状态混乱），这里封装改变表单数据
    const changeFormSettingData = function (fileName: keyof WidgetFormData["settingData"], value: any) {
        useSettingDataValueChange(widgetFormData as any, fileName, value);
    };

    // 插入组件
    const insertWidget = function (widgetData: WidgetBaseData, newIndex: number) {
        // @ts-ignore
        widgetFormData.widgets.splice(newIndex, 0, widgetData);
    };

    // 删除组件
    const deleteWidget = function (widgetId: string) {
        const findIndex = widgetFormData.widgets.findIndex((item: any) => item.id === widgetId);
        if (findIndex !== -1) {
            widgetFormData.widgets.splice(findIndex, 1);
        }
    };

    // 清空组件
    const clearWidgets = function () {
        widgetFormData.widgets.splice(0, widgetFormData.widgets.length);
    };

    return {
        changeSelectedWidgetId,
        changeSelectedWidgetSettingData,
        changeFormSettingData,
        insertWidget,
        deleteWidget,
        clearWidgets
    };
}
