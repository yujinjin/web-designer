<template>
    <div class="widgets-setting-input-number">
        <el-form :model="settingData" label-width="100px" label-position="left">
            <el-collapse :model-value="['1', '2', '3']">
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
                    <el-form-item label="标签文案" prop="label">
                        <el-input
                            :model-value="settingData.label"
                            placeholder="请输入标签文案"
                            maxlength="30"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'label', value)"
                        />
                    </el-form-item>
                    <el-form-item label="标签位置" prop="labelPosition">
                        <el-radio-group :model-value="settingData.labelPosition" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'labelPosition', value)">
                            <el-radio-button value="left">左</el-radio-button>
                            <el-radio-button value="right">右</el-radio-button>
                            <el-radio-button value="top">上</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="控制属性" prop="control">
                        <el-checkbox-group :model-value="settingData.control" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'control', value)">
                            <el-checkbox value="disabled">禁用</el-checkbox>
                            <el-checkbox value="isShow">显示</el-checkbox>
                            <el-checkbox value="readonly">只读</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="默认值" prop="defaultValue">
                        <el-input-number
                            :model-value="settingData.defaultValue"
                            placeholder="请输入默认值"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'defaultValue', value)"
                        />
                    </el-form-item>
                    <el-form-item label="最小值" prop="min">
                        <el-input-number
                            :model-value="settingData.min"
                            placeholder="请输入最小值"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'min', value)"
                        />
                    </el-form-item>
                    <el-form-item label="最大值" prop="max">
                        <el-input-number
                            :model-value="settingData.max"
                            placeholder="请输入最大值"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'max', value)"
                        />
                    </el-form-item>
                    <el-form-item label="步长" prop="step">
                        <el-input-number
                            :model-value="settingData.step"
                            placeholder="请输入步长"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'step', value)"
                        />
                    </el-form-item>
                    <el-form-item label="精度" prop="precision">
                        <el-input-number
                            :model-value="settingData.precision"
                            placeholder="请输入精度"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'precision', value)"
                        />
                    </el-form-item>
                    <el-form-item label="严格步长" prop="stepStrictly">
                        <el-checkbox :model-value="!!settingData.stepStrictly" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'stepStrictly', value)">
                            开启
                        </el-checkbox>
                    </el-form-item>
                    <el-form-item label="使用控制按钮" prop="controls">
                        <el-checkbox :model-value="!!settingData.controls" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'controls', value)">
                            开启
                        </el-checkbox>
                    </el-form-item>
                    <el-form-item label="文本对齐" prop="align">
                        <el-radio-group :model-value="settingData.align" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'align', value)">
                            <el-radio-button value="left">左</el-radio-button>
                            <el-radio-button value="center">中</el-radio-button>
                            <el-radio-button value="right">右</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                </el-collapse-item>
                <el-collapse-item title="验证属性" name="2">
                    <el-form-item label="是否必填" prop="required">
                        <el-switch
                            :model-value="!!settingData.required"
                            :active-value="true"
                            :inactive-value="false"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'required', value)"
                        />
                    </el-form-item>
                    <el-form-item v-if="settingData.required" label="必填提示" prop="requiredMessage">
                        <el-input
                            :model-value="settingData.requiredMessage"
                            placeholder="请输入必填提示"
                            maxlength="50"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'requiredMessage', value)"
                        />
                    </el-form-item>
                </el-collapse-item>
                <el-collapse-item title="事件" name="3">
                    <el-form-item label="onValidate" prop="onValidate">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('onValidate')">编写代码</el-button>
                    </el-form-item>
                </el-collapse-item>
            </el-collapse>
        </el-form>
        <js-code-editor-dialog v-if="isShowJsCodeEditorDialog" :value="eventValue" @close="closeJsCodeEditorDialog" @save="saveJsCode" />
    </div>
</template>
<script setup lang="ts">
import { ref, inject, type PropType } from "vue";
import { Edit } from "@element-plus/icons-vue";
import jsCodeEditorDialog from "../js-code-editor-dialog.vue";
import { type WidgetInputNumberData, type ChangeSelectedWidgetSettingDataFun } from "@/views/composables/types";
import { usePropNameValidator } from "@/views/composables/validator";
import { useSettingDataValueChange } from "@/views/composables/widgets/input-number";
import useJsCodeEditor from "@/views/composables/js-code-editor";

const props = defineProps({
    settingData: {
        type: Object as PropType<WidgetInputNumberData["settingData"]>,
        required: true
    }
});

const changeSelectedWidgetSettingData = inject<ChangeSelectedWidgetSettingDataFun>("changeSelectedWidgetSettingData");

const propName = ref(props.settingData.propName);

const propNameValidator = usePropNameValidator(useSettingDataValueChange);

const { isShowJsCodeEditorDialog, eventValue, showJsCodeEditorDialog, closeJsCodeEditorDialog, saveJsCode } = useJsCodeEditor(
    props.settingData,
    changeSelectedWidgetSettingData!,
    useSettingDataValueChange
);
</script>
