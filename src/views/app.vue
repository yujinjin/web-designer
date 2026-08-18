<!--
 * @创建者: yujinjin9@126.com
 * @描述: 欢迎页面
-->
<template>
    <div class="main-container">
        <left-widget-panel></left-widget-panel>
        <center-render-panel @clear-widgets="clearWidgets"></center-render-panel>
        <right-setting-panel></right-setting-panel>
    </div>
</template>
<script setup lang="ts">
import { provide, readonly, ref, reactive, type Reactive } from "vue";
import { type WidgetFormData } from "@/views/composables/types";
import useWidgetManage from "@/views/composables/widget-manage";
import { useCreateDefaultData } from "@/views/composables/widgets/form";
import leftWidgetPanel from "@/views/components/left-widget-panel.vue";
import centerRenderPanel from "@/views/components/center-render-panel.vue";
import rightSettingPanel from "@/views/components/right-setting-panel.vue";

// 表单数据，必须是响应式，否则组件管理无法更新
const widgetFormData: Reactive<WidgetFormData> = reactive(useCreateDefaultData());

// 选中的组件id
const selectedWigetId = ref<string | null>(null);

// 组件管理
// @ts-expect-error TS2589: Vue 深层解包 WidgetFormData 时类型实例化过深
const { changeSelectedWidgetId, changeSelectedWidgetSettingData, changeFormSettingData, insertWidgetDefaultData, updateWidgetOrder, copyWidgetData, deleteWidget, clearWidgets } = useWidgetManage(
    widgetFormData,
    selectedWigetId
);

// 提供表单数据、改变表单数据、改变选中的组件的设置数据、选中的组件id、改变选中的组件id
provide("widgetFormData", readonly(widgetFormData));
provide("changeFormSettingData", changeFormSettingData);
provide("changeSelectedWidgetSettingData", changeSelectedWidgetSettingData);
provide("insertWidgetDefaultData", insertWidgetDefaultData);
provide("updateWidgetOrder", updateWidgetOrder);
provide("copyWidgetData", copyWidgetData);
provide("deleteWidget", deleteWidget);
provide("selectedWigetId", readonly(selectedWigetId));
provide("changeSelectedWidgetId", changeSelectedWidgetId);
</script>
<style lang="scss" scoped>
.main-container {
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: row;
    position: relative;
}
</style>
