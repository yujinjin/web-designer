<template>
    <div class="widgets-setting-alert">
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
                    <el-form-item label="标题" prop="title">
                        <el-input
                            type="text"
                            :model-value="settingData.title"
                            placeholder="请输入标题"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'title', value)"
                        />
                    </el-form-item>
                    <el-form-item label="描述" prop="description">
                        <el-input
                            type="text"
                            :model-value="settingData.description"
                            placeholder="请输入描述"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'description', value)"
                        />
                    </el-form-item>
                    <el-form-item label="类型" prop="type">
                        <el-radio-group :model-value="settingData.type || 'info'" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'type', value)">
                            <el-radio-button value="info">信息</el-radio-button>
                            <el-radio-button value="success">成功</el-radio-button>
                            <el-radio-button value="warning">警告</el-radio-button>
                            <el-radio-button value="error">错误</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="显示图标" prop="showIcon">
                        <el-switch
                            :model-value="!!settingData.showIcon"
                            :active-value="true"
                            :inactive-value="false"
                            active-text="显示"
                            inactive-text="不显示"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'showIcon', value)"
                        />
                    </el-form-item>
                    <el-form-item label="可关闭" prop="closable">
                        <el-switch
                            :model-value="!!settingData.closable"
                            :active-value="true"
                            :inactive-value="false"
                            active-text="可关闭"
                            inactive-text="不可关闭"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'closable', value)"
                        />
                    </el-form-item>
                    <el-form-item label="关闭文案" prop="closeText">
                        <el-input
                            :model-value="settingData.closeText"
                            type="text"
                            placeholder="请输入关闭文案"
                            maxlength="30"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'closeText', value)"
                        />
                    </el-form-item>
                    <el-form-item label="居中显示" prop="center">
                        <el-switch
                            :model-value="!!settingData.center"
                            :active-value="true"
                            :inactive-value="false"
                            active-text="居中显示"
                            inactive-text="不居中显示"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'center', value)"
                        />
                    </el-form-item>
                    <el-form-item label="效果" prop="effect">
                        <el-radio-group :model-value="settingData.effect || 'light'" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'effect', value)">
                            <el-radio-button value="dark">暗黑模式</el-radio-button>
                            <el-radio-button value="light">浅色模式</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                </el-collapse-item>
            </el-collapse>
        </el-form>
    </div>
</template>
<script setup lang="ts">
import { ref, inject, type PropType } from "vue";
import { type WidgetAlertData, type ChangeSelectedWidgetSettingDataFun } from "@/views/composables/types";
import { usePropNameValidator } from "@/views/composables/validator";
import { useSettingDataValueChange } from "@/views/composables/widgets/alert";

const props = defineProps({
    settingData: {
        type: Object as PropType<WidgetAlertData["settingData"]>,
        required: true
    }
});

const changeSelectedWidgetSettingData = inject<ChangeSelectedWidgetSettingDataFun>("changeSelectedWidgetSettingData");

const propName = ref(props.settingData.propName);

const propNameValidator = usePropNameValidator(useSettingDataValueChange);
</script>
