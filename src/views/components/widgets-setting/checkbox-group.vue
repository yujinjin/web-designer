<template>
    <div class="widgets-setting-checkbox-group">
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
                    <el-form-item label="选项类型" prop="type">
                        <el-radio-group :model-value="settingData.type" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'type', value)">
                            <el-radio-button value="radio">radio</el-radio-button>
                            <el-radio-button value="button">button</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="控制属性" prop="control">
                        <el-checkbox-group :model-value="settingData.control" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'control', value)">
                            <el-checkbox value="disabled">禁用</el-checkbox>
                            <el-checkbox value="isShow">显示</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <div class="option-config-row">
                        <div class="label-text">选项配置</div>
                        <option-config
                            :options="settingData.options"
                            :default-value="settingData.defaultValue!"
                            :multiple="true"
                            @update-default-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'defaultValue', value)"
                            @update-options="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'options', value)"
                        />
                    </div>
                    <el-form-item label="勾选最小数" prop="min">
                        <el-input-number
                            :model-value="settingData.min"
                            placeholder="最小数"
                            :min="1"
                            :max="100"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'min', value)"
                        />
                    </el-form-item>
                    <el-form-item label="勾选最大数" prop="max">
                        <el-input-number
                            :model-value="settingData.max"
                            placeholder="最大数"
                            :min="1"
                            :max="100"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'max', value)"
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
                <el-collapse-item title="事件" name="3">
                    <el-form-item label="onValidate" prop="onInit">
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
<script setup lang="ts">
import { type PropType, inject, ref } from "vue";
import { Edit } from "@element-plus/icons-vue";
import { type WidgetCheckboxGroupData, type ChangeSelectedWidgetSettingDataFun } from "@/views/composables/types";
import { usePropNameValidator } from "@/views/composables/validator";
import { useSettingDataValueChange } from "@/views/composables/widgets/checkbox-group";
import jsCodeEditorDialog from "@/views/components/js-code-editor-dialog.vue";
import useJsCodeEditor from "@/views/composables/js-code-editor";
import optionConfig from "@/views/components/option-config.vue";

const props = defineProps({
    settingData: {
        type: Object as PropType<WidgetCheckboxGroupData["settingData"]>,
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
<style scoped lang="scss">
.widgets-setting-radio-group {
    width: 100%;
}
.option-config-row {
    display: flex;
    flex-direction: column;

    .label-text {
        padding: 8px 0px;
        line-height: 24px;
    }
}
.label-text {
    width: 100px;
}
</style>
