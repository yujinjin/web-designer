<template>
    <div class="widgets-setting-text">
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
                    <el-form-item label="输入类型" prop="type">
                        <el-radio-group :model-value="settingData.type" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'type', value)">
                            <el-radio-button value="text">文本</el-radio-button>
                            <el-radio-button value="password">密码</el-radio-button>
                            <el-radio-button value="textarea">多行文本</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="占位符" prop="placeholder">
                        <el-input
                            :model-value="settingData.placeholder"
                            placeholder="请输入占位符"
                            maxlength="30"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'placeholder', value)"
                        />
                    </el-form-item>
                    <el-form-item label="控制属性" prop="control">
                        <el-checkbox-group :model-value="settingData.control" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'control', value)">
                            <el-checkbox value="disabled">禁用</el-checkbox>
                            <el-checkbox value="isShow">显示</el-checkbox>
                            <el-checkbox value="readonly">只读</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="默认值" prop="defaultValue">
                        <el-input
                            :model-value="settingData.defaultValue"
                            placeholder="请输入默认值"
                            maxlength="30"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'defaultValue', value)"
                        />
                    </el-form-item>
                    <el-form-item v-if="settingData.type === 'textarea'" label="行数" prop="rows">
                        <el-input-number
                            :model-value="settingData.rows"
                            placeholder="请输入行数"
                            :min="1"
                            :max="10"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'rows', value)"
                        />
                    </el-form-item>
                    <el-form-item v-if="settingData.type === 'textarea' || settingData.type === 'text'" label="显示字数统计" prop="showWordLimit">
                        <el-switch
                            :model-value="!!settingData.showWordLimit"
                            :active-value="true"
                            :inactive-value="false"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'showWordLimit', value)"
                        />
                    </el-form-item>
                    <el-form-item label="最大长度" prop="maxlength">
                        <el-input-number
                            :model-value="settingData.maxlength"
                            placeholder="字符最大长度"
                            :min="1"
                            :max="100"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'maxlength', value)"
                        />
                    </el-form-item>
                    <el-form-item label="最小长度" prop="minlength">
                        <el-input-number
                            :model-value="settingData.minlength"
                            placeholder="字符最小长度"
                            :min="1"
                            :max="100"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'minlength', value)"
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
                    <el-form-item label="正则表达式" prop="regExp">
                        <el-input
                            :model-value="settingData.regExp"
                            placeholder="请输入正则表达式"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'regExp', value)"
                        />
                    </el-form-item>
                    <el-form-item v-if="settingData.regExp" label="正则表达式提示" prop="regExpMessage">
                        <el-input
                            :model-value="settingData.regExpMessage"
                            placeholder="请输入正则表达式提示"
                            maxlength="50"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'regExpMessage', value)"
                        />
                    </el-form-item>
                </el-collapse-item>
                <el-collapse-item title="事件" name="3">
                    <el-form-item label="onValidate" prop="onInit">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('onValidate')">编写代码</el-button>
                    </el-form-item>
                    <el-form-item label="onBlur" prop="onBlur">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('onBlur')">编写代码</el-button>
                    </el-form-item>
                    <el-form-item label="onFocus" prop="onFocus">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('onFocus')">编写代码</el-button>
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
import { type WidgetTextData, type ChangeSelectedWidgetSettingDataFun } from "@/views/composables/types";
import { usePropNameValidator } from "@/views/composables/validator";
import { useSettingDataValueChange } from "@/views/composables/widgets/text";
import useJsCodeEditor from "@/views/composables/js-code-editor";

const props = defineProps({
    settingData: {
        type: Object as PropType<WidgetTextData["settingData"]>,
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
.widgets-setting-text {
    height: 100%;
}
</style>
