<template>
    <div class="right-setting-panel">
        <el-tabs model-value="component">
            <el-tab-pane label="组件设置" name="component">
                <component :is="widgetComponent" v-if="widgetComponent && selectedWidgetData" :setting-data="selectedWidgetData.settingData as any" :widget-data="selectedWidgetData as any" />
                <el-empty v-else description="请选择组件" :image-size="100" />
            </el-tab-pane>
            <el-tab-pane label="表单设置" name="form">
                <form-setting />
            </el-tab-pane>
        </el-tabs>
    </div>
</template>
<script setup lang="ts">
import { inject, defineAsyncComponent, computed, type Ref } from "vue";
import formSetting from "./widgets-setting/form.vue";
import { type WidgetFormData } from "@/views/composables/types";
import { getWidgetList } from "@/views/composables/widget-registry";
import { findWidgetData } from "@/views/composables/widget-tree";

// 获取注入的选中的组件id
const selectedWigetId = inject<Ref<string | null>>("selectedWigetId");

// 获取注入的组件数据
const widgetFormData = inject<WidgetFormData>("widgetFormData");

// 获取注入的组件数据
const selectedWidgetData = computed(() => {
    return findWidgetData(widgetFormData?.widgets || [], selectedWigetId?.value || null)?.widgetData;
});

// 获取组件的列表数据
const widgetList = getWidgetList();

// 根据组件类型返回对应的设置组件
const widgetComponent = computed(() => {
    switch (selectedWidgetData.value?.code) {
        case widgetList.WIDGET_TEXT.code:
            return defineAsyncComponent(() => import("./widgets-setting/text.vue"));
        case widgetList.WIDGET_INPUT_NUMBER.code:
            return defineAsyncComponent(() => import("./widgets-setting/input-number.vue"));
        case widgetList.WIDGET_RADIO_GROUP.code:
            return defineAsyncComponent(() => import("./widgets-setting/radio-group.vue"));
        case widgetList.WIDGET_CHECKBOX_GROUP.code:
            return defineAsyncComponent(() => import("./widgets-setting/checkbox-group.vue"));
        case widgetList.WIDGET_SELECT.code:
            return defineAsyncComponent(() => import("./widgets-setting/select.vue"));
        case widgetList.WIDGET_DATE_PICKER.code:
            return defineAsyncComponent(() => import("./widgets-setting/date-picker.vue"));
        case widgetList.WIDGET_TIME_PICKER.code:
            return defineAsyncComponent(() => import("./widgets-setting/time-picker.vue"));
        case widgetList.WIDGET_TIME_SELECT.code:
            return defineAsyncComponent(() => import("./widgets-setting/time-select.vue"));
        case widgetList.WIDGET_SWITCH.code:
            return defineAsyncComponent(() => import("./widgets-setting/switch.vue"));
        case widgetList.WIDGET_RATE.code:
            return defineAsyncComponent(() => import("./widgets-setting/rate.vue"));
        case widgetList.WIDGET_COLOR_PICKER.code:
            return defineAsyncComponent(() => import("./widgets-setting/color-picker.vue"));
        case widgetList.WIDGET_SLIDER.code:
            return defineAsyncComponent(() => import("./widgets-setting/slider.vue"));
        case widgetList.WIDGET_UPLOAD.code:
            return defineAsyncComponent(() => import("./widgets-setting/upload.vue"));
        case widgetList.WIDGET_HTML.code:
            return defineAsyncComponent(() => import("./widgets-setting/html.vue"));
        case widgetList.WIDGET_ALERT.code:
            return defineAsyncComponent(() => import("./widgets-setting/alert.vue"));
        case widgetList.WIDGET_DIVIDER.code:
            return defineAsyncComponent(() => import("./widgets-setting/divider.vue"));
        case widgetList.WIDGET_ROW_CONTAINER.code:
            return defineAsyncComponent(() => import("./widgets-setting/row-container.vue"));
        default:
            return null;
    }
});
</script>
<style lang="scss" scoped>
.right-setting-panel {
    height: 100%;
    width: 350px;
    overflow-x: hidden;
    border-left: 1px solid #e5e5e5;

    :deep(.el-tabs) {
        .el-tabs__header {
            margin: 0;
            background-color: #ffffff;
            border-bottom: 1px solid #e9ecef;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            position: sticky;
            top: 0;
            z-index: 10;

            .el-tabs__nav {
                display: flex;
                width: 100%;

                .el-tabs__item {
                    flex: 1;
                }
            }
        }

        .el-tabs__content {
            padding: 0px 12px;
        }
    }
}
</style>
