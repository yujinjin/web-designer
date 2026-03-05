<template>
    <div class="widgets-setting-rate">
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
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="默认值" prop="defaultValue">
                        <el-input-number
                            :model-value="settingData.defaultValue"
                            placeholder="请输入默认值"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'defaultValue', value)"
                        />
                    </el-form-item>
                    <el-form-item label="最大分值" prop="max">
                        <el-input-number
                            :model-value="settingData.max"
                            placeholder="请输入最大分值"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'max', value)"
                        />
                    </el-form-item>
                    <el-form-item label="是否允许半分" prop="allowHalf">
                        <el-checkbox :model-value="!!settingData.allowHalf" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'allowHalf', value)">
                            允许半分
                        </el-checkbox>
                    </el-form-item>
                    <el-form-item label="中低分阀值" prop="lowThreshold">
                        <el-input-number
                            :model-value="settingData.lowThreshold"
                            placeholder="请输入中低分阀值"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'lowThreshold', value)"
                        />
                    </el-form-item>
                    <el-form-item label="高分阀值" prop="highThreshold">
                        <el-input-number
                            :model-value="settingData.highThreshold"
                            placeholder="请输入高分阀值"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'highThreshold', value)"
                        />
                    </el-form-item>
                    <el-form-item label="是否显示文案" prop="showText">
                        <el-checkbox :model-value="!!settingData.showText" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'showText', value)">
                            显示文案
                        </el-checkbox>
                    </el-form-item>
                    <el-form-item label="显示分数" prop="showScore">
                        <el-checkbox :model-value="!!settingData.showScore" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'showScore', value)">
                            显示分数
                        </el-checkbox>
                    </el-form-item>
                    <el-form-item label="文案颜色" prop="textColor">
                        <el-color-picker :model-value="settingData.textColor" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'textColor', value)" />
                    </el-form-item>
                    <el-form-item label="是否可清空" prop="clearable">
                        <el-checkbox :model-value="!!settingData.clearable" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'clearable', value)" />
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
                <el-collapse-item title="事件属性" name="3">
                    <el-form-item label="onValidate" prop="onValidate">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('onValidate')">编写代码</el-button>
                    </el-form-item>
                    <el-form-item label="onChange" prop="onChange">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('onChange')">编写代码</el-button>
                    </el-form-item>
                </el-collapse-item>
            </el-collapse>
        </el-form>
        <js-code-editor-dialog v-if="isShowJsCodeEditorDialog" :value="eventValue" @close="closeJsCodeEditorDialog" @save="saveJsCode" />
    </div>
</template>
<script lang="ts" setup>
import { ref, inject, type PropType } from "vue";
import { Edit } from "@element-plus/icons-vue";
import jsCodeEditorDialog from "../js-code-editor-dialog.vue";
import { type WidgetRateData, type ChangeSelectedWidgetSettingDataFun } from "@/views/composables/types";
import { usePropNameValidator } from "@/views/composables/validator";
import { useSettingDataValueChange } from "@/views/composables/widgets/rate";
import useJsCodeEditor from "@/views/composables/js-code-editor";

const props = defineProps({
    settingData: {
        type: Object as PropType<WidgetRateData["settingData"]>,
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
