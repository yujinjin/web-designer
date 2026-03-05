<template>
    <div class="widgets-setting-divider">
        <el-form :model="settingData" label-width="80px" label-position="left">
            <el-collapse :model-value="['1']">
                <el-collapse-item title="基本属性" name="1">
                    <el-form-item
                        label="唯一名称"
                        prop="propName"
                        :rules="[
                            { required: true, message: '请输入唯一名称' },
                            { validator: propNameValidator, trigger: 'blur' }
                        ]"
                    >
                        <el-input v-model.trim="propName" placeholder="请输入唯一名称" maxlength="30" />
                    </el-form-item>
                    <el-form-item label="控制属性" prop="control">
                        <el-checkbox-group :model-value="settingData.control" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'control', value)">
                            <el-checkbox value="isShow">显示</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="分割线内容" prop="defaultValue">
                        <el-input
                            :model-value="settingData.defaultValue"
                            placeholder="请输入分割线内容"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'defaultValue', value)"
                        />
                    </el-form-item>
                    <el-form-item label="内容位置" prop="contentPosition">
                        <el-radio-group
                            :model-value="settingData.contentPosition || 'left'"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'contentPosition', value)"
                        >
                            <el-radio-button label="left">左侧</el-radio-button>
                            <el-radio-button label="center">居中</el-radio-button>
                            <el-radio-button label="right">右侧</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="分隔符样式" prop="borderStyle">
                        <el-radio-group
                            :model-value="settingData.borderStyle || 'solid'"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'borderStyle', value)"
                        >
                            <el-radio-button label="solid">实线</el-radio-button>
                            <el-radio-button label="dashed">虚线</el-radio-button>
                            <el-radio-button label="dotted">点线</el-radio-button>
                            <el-radio-button label="none">无</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="方向" prop="direction">
                        <el-radio-group
                            :model-value="settingData.direction || 'horizontal'"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'direction', value)"
                        >
                            <el-radio-button label="horizontal">水平</el-radio-button>
                            <el-radio-button label="vertical">垂直</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                </el-collapse-item>
            </el-collapse>
        </el-form>
    </div>
</template>
<script setup lang="ts">
import { ref, inject, type PropType } from "vue";
import { type WidgetDividerData, type ChangeSelectedWidgetSettingDataFun } from "@/views/composables/types";
import { usePropNameValidator } from "@/views/composables/validator";
import { useSettingDataValueChange } from "@/views/composables/widgets/divider";

const props = defineProps({
    settingData: {
        type: Object as PropType<WidgetDividerData["settingData"]>,
        required: true
    }
});

const changeSelectedWidgetSettingData = inject<ChangeSelectedWidgetSettingDataFun>("changeSelectedWidgetSettingData");

const propName = ref(props.settingData.propName);

const propNameValidator = usePropNameValidator(useSettingDataValueChange);
</script>
