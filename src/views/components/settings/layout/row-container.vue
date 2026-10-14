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
/**
 * @fileoverview 行容器的设置面板，管理子项栅格、间距、排列和垂直对齐。
 * @remarks props 提供当前选中组件的只读设置态；编辑通过注入的统一更新入口交给组件适配器，避免只写 settingData 而不同步 componentAttributes 或函数体。
 */
import { inject, type PropType } from "vue";
import { type ChangeSelectedWidgetSettingDataFun, type WidgetRowContainerData } from "@/views/types";
import { calcAverageSpans, normalizeRowContainerSpan } from "@/views/domain/widgets/layout/row-container-layout";
import { useSettingDataValueChange } from "@/views/domain/widgets/adapters/row-container";

/**
 * @description 当前选中组件的设置数据输入。
 * @remarks 数据由父面板持有，本面板不复制完整节点或直接写入嵌套配置；变更统一传回管理器与对应适配器。
 */
const props = defineProps({
    /** 当前组件用于设置面板回显的配置；运行属性由统一更新入口同步。 */
    settingData: {
        type: Object as PropType<WidgetRowContainerData["settingData"]>,
        required: true
    },
    /** 当前行容器及其子项，用于索引对应栅格宽度，不建立第二份组件树。 */
    widgetData: {
        type: Object as PropType<WidgetRowContainerData>,
        required: true
    }
});

/**
 * @description 当前组件的统一设置更新入口，缺失注入时由可选调用跳过更新。
 * @remarks 把设置字段和对应适配器一起交回管理器；显隐、表单项属性及动态函数不能在面板内各自单独维护。
 */
const changeSelectedWidgetSettingData = inject<ChangeSelectedWidgetSettingDataFun>("changeSelectedWidgetSettingData");

/**
 * @description 将容器排列与手动栅格设置提交到行容器适配器。
 * @param fileName 当前行容器设置字段名。
 * @param value 该字段目标值。
 * @returns 无返回值；通过统一入口更新当前容器设置。
 * @remarks 关闭手动栅格时先按当前子项数恢复平均 spans，再关闭开关，防止沿用旧手动宽度产生与面板状态不一致的布局。
 */
const handleChange = function (fileName: keyof WidgetRowContainerData["settingData"], value: any) {
    if (fileName === "enableSpanConfig" && value === false) {
        changeSelectedWidgetSettingData?.(useSettingDataValueChange, "spans", calcAverageSpans(props.widgetData.widgets.length));
    }
    changeSelectedWidgetSettingData?.(useSettingDataValueChange, fileName, value);
};

/**
 * @description 更新一个子组件对应的栅格宽度。
 * @param index 子项在 widgetData.widgets 与 spans 中共享的索引。
 * @param value 输入框目标 span；清空时由布局规则标准化为合法值。
 * @returns 无返回值；提交包含其他子项原宽度的新数组。
 * @remarks 先复制只读输入数组再更新目标位置，不直接修改 props；24 栅格单位与换行规则由领域布局模块统一定义。
 */
const handleSpanChange = function (index: number, value: number | undefined) {
    // 保留其余子项配置，只替换本次编辑的对应位置。
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
