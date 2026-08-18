<template>
    <div class="widgets-setting-row-container">
        <el-form :model="settingData" label-width="110px" label-position="left">
            <el-collapse :model-value="['1', '2']">
                <el-collapse-item title="基本属性" name="1">
                    <el-form-item label="容器名称" prop="name">
                        <el-input :model-value="settingData.name" placeholder="请输入容器名称" maxlength="30" @update:model-value="value => handleChange('name', value)" />
                    </el-form-item>
                    <el-form-item label="栅格间隔" prop="gutter">
                        <el-input-number :model-value="settingData.gutter" :min="0" :max="60" :step="1" @update:model-value="value => handleChange('gutter', value || 0)" />
                    </el-form-item>
                    <el-form-item label="水平排列" prop="justify">
                        <el-select :model-value="settingData.justify" @update:model-value="value => handleChange('justify', value)">
                            <el-option label="左对齐" value="start" />
                            <el-option label="右对齐" value="end" />
                            <el-option label="居中" value="center" />
                            <el-option label="两端间隔" value="space-between" />
                            <el-option label="环绕间隔" value="space-around" />
                            <el-option label="均匀间隔" value="space-evenly" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="垂直对齐" prop="align">
                        <el-radio-group :model-value="settingData.align" @update:model-value="value => handleChange('align', value)">
                            <el-radio-button value="top">顶部</el-radio-button>
                            <el-radio-button value="middle">居中</el-radio-button>
                            <el-radio-button value="bottom">底部</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="手动栅格" prop="enableSpanConfig">
                        <el-switch :model-value="settingData.enableSpanConfig" :active-value="true" :inactive-value="false" @update:model-value="value => handleChange('enableSpanConfig', value)" />
                    </el-form-item>
                </el-collapse-item>
                <el-collapse-item title="栅格配置" name="2">
                    <template v-if="settingData.enableSpanConfig">
                        <el-alert class="span-tip" type="info" :closable="false" show-icon title="span 总和超过 24 时会自动换行。" />
                        <el-form-item v-for="(item, index) in widgetData.widgets" :key="item.id" :label="item.name" :prop="`spans.${index}`">
                            <el-input-number :model-value="settingData.spans[index] || 1" :min="1" :max="24" :step="1" @update:model-value="value => handleSpanChange(index, value)" />
                        </el-form-item>
                    </template>
                    <el-empty v-else description="开启手动栅格后可配置每个内部组件宽度" :image-size="80" />
                </el-collapse-item>
            </el-collapse>
        </el-form>
    </div>
</template>
<script setup lang="ts">
import { inject, type PropType } from "vue";
import { type ChangeSelectedWidgetSettingDataFun, type WidgetRowContainerData } from "@/views/composables/types";
import { calcAverageSpans, normalizeRowContainerSpan } from "@/views/composables/row-container-layout";
import { useSettingDataValueChange } from "@/views/composables/widgets/row-container";

const props = defineProps({
    settingData: {
        type: Object as PropType<WidgetRowContainerData["settingData"]>,
        required: true
    },
    widgetData: {
        type: Object as PropType<WidgetRowContainerData>,
        required: true
    }
});

const changeSelectedWidgetSettingData = inject<ChangeSelectedWidgetSettingDataFun>("changeSelectedWidgetSettingData");

const handleChange = function (fileName: keyof WidgetRowContainerData["settingData"], value: any) {
    if (fileName === "enableSpanConfig" && value === false) {
        changeSelectedWidgetSettingData?.(useSettingDataValueChange, "spans", calcAverageSpans(props.widgetData.widgets.length));
    }
    changeSelectedWidgetSettingData?.(useSettingDataValueChange, fileName, value);
};

const handleSpanChange = function (index: number, value: number | undefined) {
    const spans = props.settingData.spans.slice();
    spans[index] = normalizeRowContainerSpan(value);
    changeSelectedWidgetSettingData?.(useSettingDataValueChange, "spans", spans);
};
</script>
<style lang="scss" scoped>
.widgets-setting-row-container {
    height: 100%;

    .span-tip {
        margin-bottom: 12px;
    }
}
</style>
