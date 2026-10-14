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
/**
 * @fileoverview 根据选中节点动态装载组件设置面板，并提供独立的表单根设置入口。
 * @remarks 组件配置由根页面持有；本面板只定位节点和分发设置视图，实际设置更新通过注入的管理器完成。
 */
import { inject, defineAsyncComponent, computed, type Ref } from "vue";
import formSetting from "@/views/components/settings/layout/form.vue";
import { type WidgetFormData } from "@/views/types";
import { getWidgetList } from "@/views/domain/widgets/registry";
import { findWidgetData } from "@/views/domain/widgets/tree";

// 根页面共享的选中标识；选中状态由画布与管理器写入。
const selectedWigetId = inject<Ref<string | null>>("selectedWigetId");

// 根页面持有的表单树，设置视图始终读取同一对象，不创建编辑副本。
const widgetFormData = inject<WidgetFormData>("widgetFormData");

/**
 * @description 定位当前选中的顶层或行容器子组件配置。
 * @remarks 依赖选中标识与当前树结构；未选择、已删除或注入缺失时返回 undefined，避免挂载没有数据的设置面板。
 */
const selectedWidgetData = computed(() => {
    return findWidgetData(widgetFormData?.widgets || [], selectedWigetId?.value || null)?.widgetData;
});

// 注册表的稳定类型标识，用于匹配设置面板。
const widgetList = getWidgetList();

/**
 * @description 根据选中节点类型派生异步设置组件。
 * @remarks 保留显式 import 路径供打包器识别；只在对应类型被选中时加载设置代码，不支持的类型回退空选择提示。
 */
const widgetComponent = computed(() => {
    switch (selectedWidgetData.value?.code) {
        case widgetList.WIDGET_TEXT.code:
            return defineAsyncComponent(() => import("@/views/components/settings/inputs/text.vue"));
        case widgetList.WIDGET_INPUT_NUMBER.code:
            return defineAsyncComponent(() => import("@/views/components/settings/inputs/input-number.vue"));
        case widgetList.WIDGET_RADIO_GROUP.code:
            return defineAsyncComponent(() => import("@/views/components/settings/selections/radio-group.vue"));
        case widgetList.WIDGET_CHECKBOX_GROUP.code:
            return defineAsyncComponent(() => import("@/views/components/settings/selections/checkbox-group.vue"));
        case widgetList.WIDGET_SELECT.code:
            return defineAsyncComponent(() => import("@/views/components/settings/selections/select.vue"));
        case widgetList.WIDGET_CASCADER.code:
            return defineAsyncComponent(() => import("@/views/components/settings/selections/cascader.vue"));
        case widgetList.WIDGET_DATE_PICKER.code:
            return defineAsyncComponent(() => import("@/views/components/settings/datetime/date-picker.vue"));
        case widgetList.WIDGET_TIME_PICKER.code:
            return defineAsyncComponent(() => import("@/views/components/settings/datetime/time-picker.vue"));
        case widgetList.WIDGET_TIME_SELECT.code:
            return defineAsyncComponent(() => import("@/views/components/settings/datetime/time-select.vue"));
        case widgetList.WIDGET_SWITCH.code:
            return defineAsyncComponent(() => import("@/views/components/settings/inputs/switch.vue"));
        case widgetList.WIDGET_RATE.code:
            return defineAsyncComponent(() => import("@/views/components/settings/inputs/rate.vue"));
        case widgetList.WIDGET_COLOR_PICKER.code:
            return defineAsyncComponent(() => import("@/views/components/settings/inputs/color-picker.vue"));
        case widgetList.WIDGET_SLIDER.code:
            return defineAsyncComponent(() => import("@/views/components/settings/inputs/slider.vue"));
        case widgetList.WIDGET_UPLOAD.code:
            return defineAsyncComponent(() => import("@/views/components/settings/inputs/upload.vue"));
        case widgetList.WIDGET_HTML.code:
            return defineAsyncComponent(() => import("@/views/components/settings/display/html.vue"));
        case widgetList.WIDGET_ALERT.code:
            return defineAsyncComponent(() => import("@/views/components/settings/display/alert.vue"));
        case widgetList.WIDGET_DIVIDER.code:
            return defineAsyncComponent(() => import("@/views/components/settings/display/divider.vue"));
        case widgetList.WIDGET_ROW_CONTAINER.code:
            return defineAsyncComponent(() => import("@/views/components/settings/layout/row-container.vue"));
        default:
            return null;
    }
});
</script>
<style lang="scss" scoped>
.right-setting-panel {
    height: 100%;
    width: 100%;
    min-width: 0;
    overflow: hidden;

    :deep(.el-tabs) {
        height: 100%;
        display: flex;
        flex-direction: column;

        .el-tabs__header {
            flex: none;
            height: calc(var(--el-tabs-header-height, 40px) + 1px);
            margin: 0;
            background-color: #ffffff;
            border-bottom: 1px solid #e9ecef;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
            flex: 1;
            min-height: 0;
            padding: 0 16px 16px;
            overflow-x: hidden;
            overflow-y: auto;
        }
    }
}
</style>
