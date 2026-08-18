<template>
    <div class="widgets-setting-switch">
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
                        <el-radio-group :model-value="!!settingData.defaultValue" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'defaultValue', value)">
                            <el-radio-button :value="true">开启</el-radio-button>
                            <el-radio-button :value="false">关闭</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="开启文案" prop="activeText">
                        <el-input
                            :model-value="settingData.activeText"
                            placeholder="请输入开启文案"
                            maxlength="30"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'activeText', value)"
                        />
                    </el-form-item>
                    <el-form-item label="关闭文案" prop="inactiveText">
                        <el-input
                            :model-value="settingData.inactiveText"
                            placeholder="请输入关闭文案"
                            maxlength="30"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'inactiveText', value)"
                        />
                    </el-form-item>
                    <el-form-item label="内联提示" prop="inlinePrompt">
                        <el-switch
                            :model-value="!!settingData.inlinePrompt"
                            active-text="开启"
                            inactive-text="关闭"
                            :active-value="true"
                            :inactive-value="false"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'inlinePrompt', value)"
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
                    <el-form-item label="beforeChange" prop="beforeChange">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('beforeChange')">编写代码</el-button>
                        <div class="tips-text">switch 状态改变前的钩子， 返回 false 或者返回 Promise 且被 reject 则停止切换</div>
                    </el-form-item>
                </el-collapse-item>
                <el-collapse-item title="事件属性" name="4">
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
import { type WidgetSwitchData, type ChangeSelectedWidgetSettingDataFun } from "@/views/composables/types";
import { usePropNameValidator } from "@/views/composables/validator";
import { useSettingDataValueChange } from "@/views/composables/widgets/switch";
import useJsCodeEditor from "@/views/composables/js-code-editor";

const props = defineProps({
    settingData: {
        type: Object as PropType<WidgetSwitchData["settingData"]>,
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
.tips-text {
    font-size: 12px;
    color: #9ca3af;
    margin-top: 4px;
}
</style>
