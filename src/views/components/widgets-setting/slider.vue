<template>
    <div class="widgets-setting-slider">
        <el-form :model="settingData" label-width="100px" label-position="left">
            <el-collapse :model-value="['1', '2', '3', '4']">
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
                    <el-form-item label="显示输入框" prop="showInput">
                        <el-switch :model-value="!!settingData.showInput" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'showInput', value)" />
                    </el-form-item>
                    <el-form-item v-if="settingData.showInput" label="输入框控制" prop="showInputControl">
                        <el-switch
                            :model-value="!!settingData.showInputControls"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'showInputControl', value)"
                        />
                    </el-form-item>
                    <el-form-item label="显示间断点" prop="showStops">
                        <el-switch :model-value="!!settingData.showStops" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'showStops', value)" />
                    </el-form-item>
                    <el-form-item label="显示提示信息" prop="showTooltip">
                        <el-switch :model-value="!!settingData.showTooltip" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'showTooltip', value)" />
                    </el-form-item>
                    <el-form-item label="开启范围选择" prop="range">
                        <el-switch :model-value="!!settingData.range" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'range', value)" />
                    </el-form-item>
                    <el-form-item label="范围开始标签" prop="rangeStartLabel">
                        <el-input
                            :model-value="settingData.rangeStartLabel"
                            placeholder="请输入范围开始标签"
                            maxlength="30"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'rangeStartLabel', value)"
                        />
                    </el-form-item>
                    <el-form-item label="范围结束标签" prop="rangeEndLabel">
                        <el-input
                            :model-value="settingData.rangeEndLabel"
                            placeholder="请输入范围结束标签"
                            maxlength="30"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'rangeEndLabel', value)"
                        />
                    </el-form-item>
                    <el-form-item label="垂直模式" prop="vertical">
                        <el-switch :model-value="!!settingData.vertical" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'vertical', value)" />
                    </el-form-item>
                    <el-form-item label="垂直高度" prop="height">
                        <el-input
                            :model-value="settingData.height"
                            placeholder="请输入垂直高度"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'height', value)"
                        />
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
                <el-collapse-item title="高级属性" name="3">
                    <el-form-item v-if="settingData.showTooltip" label="formatTooltip" prop="formatTooltip">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('formatTooltip')">编写代码</el-button>
                        <div class="tips-text">格式化提示信息</div>
                    </el-form-item>
                    <el-form-item label="格式化值" prop="formatValueText">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('formatValueText')">编写代码</el-button>
                        <div class="tips-text">显示屏幕阅读器的 aria-valuenow 属性的格式</div>
                    </el-form-item>
                </el-collapse-item>
                <el-collapse-item title="事件" name="4">
                    <el-form-item label="onValidate" prop="onValidate">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('onValidate')">编写代码</el-button>
                    </el-form-item>
                    <el-form-item label="onInput" prop="onInput">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('onInput')">编写代码</el-button>
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
<script setup lang="ts">
import { ref, inject, type PropType } from "vue";
import { Edit } from "@element-plus/icons-vue";
import jsCodeEditorDialog from "../js-code-editor-dialog.vue";
import { type WidgetSliderData, type ChangeSelectedWidgetSettingDataFun } from "@/views/composables/types";
import { usePropNameValidator } from "@/views/composables/validator";
import { useSettingDataValueChange } from "@/views/composables/widgets/slider";
import useJsCodeEditor from "@/views/composables/js-code-editor";

const props = defineProps({
    settingData: {
        type: Object as PropType<WidgetSliderData["settingData"]>,
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
<style lang="scss" scoped>
.widgets-setting-slider {
    height: 100%;

    .tips-text {
        font-size: 12px;
        color: #9ca3af;
        margin-top: 4px;
    }
}
</style>
