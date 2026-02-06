<template>
    <div class="right-setting-panel">
        <el-tabs model-value="component">
            <el-tab-pane label="组件设置" name="component">
                <component :is="widgetComponent" v-if="widgetComponent" :setting-data="selectedWidgetData!.settingData as any" />
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

// 获取注入的选中的组件id
const selectedWigetId = inject<Ref<string | null>>("selectedWigetId");

// 获取注入的组件数据
const widgetFormData = inject<WidgetFormData>("widgetFormData");

// 获取注入的组件数据
const selectedWidgetData = computed(() => {
    return widgetFormData?.widgets.find((item: any) => item.id === selectedWigetId?.value);
});

// 根据组件类型返回对应的设置组件
const widgetComponent = computed(() => {
    switch (selectedWidgetData.value?.code) {
        case "text":
            return defineAsyncComponent(() => import("./widgets-setting/text.vue"));
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
