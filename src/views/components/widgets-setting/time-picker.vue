<template>
    <div class="widget-setting-time-picker">
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
                            <el-checkbox value="readonly">只读</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="默认值" prop="defaultValue">
                        <el-time-picker
                            :model-value="settingData.defaultValue"
                            :is-range="!!settingData.isRange"
                            :value-format="settingData.valueFormat || 'HH:mm:ss'"
                            placeholder="选择时间默认值"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'defaultValue', value)"
                        />
                    </el-form-item>
                    <el-form-item label="是否范围选择" prop="isRange">
                        <el-checkbox :model-value="!!settingData.isRange" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'isRange', value)">
                            是否范围选择
                        </el-checkbox>
                    </el-form-item>
                    <el-form-item v-if="!settingData.isRange" label="占位符" prop="placeholder">
                        <el-input
                            :model-value="settingData.placeholder"
                            placeholder="请输入占位符"
                            maxlength="30"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'placeholder', value)"
                        />
                    </el-form-item>
                    <template v-else>
                        <el-form-item label="开始占位符" prop="startPlaceholder">
                            <el-input
                                :model-value="settingData.startPlaceholder"
                                placeholder="请输入开始占位符"
                                maxlength="30"
                                @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'startPlaceholder', value)"
                            />
                        </el-form-item>
                        <el-form-item label="结束占位符" prop="endPlaceholder">
                            <el-input
                                :model-value="settingData.endPlaceholder"
                                placeholder="请输入结束占位符"
                                maxlength="30"
                                @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'endPlaceholder', value)"
                            />
                        </el-form-item>
                        <el-form-item label="范围分隔符" prop="rangeSeparator">
                            <el-input
                                :model-value="settingData.rangeSeparator"
                                placeholder="请输入范围分隔符"
                                maxlength="1"
                                @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'rangeSeparator', value)"
                            />
                        </el-form-item>
                    </template>
                    <el-form-item label="时间格式" prop="valueFormat">
                        <el-input
                            :model-value="settingData.valueFormat"
                            placeholder="请输入时间格式"
                            maxlength="30"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'valueFormat', value)"
                        />
                    </el-form-item>
                    <el-form-item label="输入框格式" prop="format">
                        <el-input
                            :model-value="settingData.format"
                            placeholder="请输入显示输入框格式"
                            maxlength="30"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'format', value)"
                        />
                    </el-form-item>
                    <el-form-item label="是否可编辑" prop="editable">
                        <el-switch
                            :model-value="!!settingData.editable"
                            :active-value="true"
                            :inactive-value="false"
                            active-text="是"
                            inactive-text="否"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'editable', value)"
                        />
                    </el-form-item>
                    <el-form-item label="是否可清空" prop="clearable">
                        <el-switch
                            :model-value="!!settingData.clearable"
                            :active-value="true"
                            :inactive-value="false"
                            active-text="是"
                            inactive-text="否"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'clearable', value)"
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
                    <el-form-item label="禁用时间" prop="disabledHours">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('disabledHours')">编写代码</el-button>
                        <div class="tips-text">禁止选择部分小时选项，用于根据时间判断是否禁用。</div>
                    </el-form-item>
                    <el-form-item label="禁用分钟" prop="disabledMinutes">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('disabledMinutes')">编写代码</el-button>
                        <div class="tips-text">禁止选择部分分钟选项，用于根据时间判断是否禁用。</div>
                    </el-form-item>
                    <el-form-item label="禁用秒" prop="disabledSeconds">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('disabledSeconds')">编写代码</el-button>
                        <div class="tips-text">禁止选择部分秒选项，用于根据时间判断是否禁用。</div>
                    </el-form-item>
                </el-collapse-item>
                <el-collapse-item title="事件属性" name="4">
                    <el-form-item label="onValidate" prop="onValidate">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('onValidate')">编写代码</el-button>
                    </el-form-item>
                    <el-form-item label="onChange" prop="onChange">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('onChange')">编写代码</el-button>
                    </el-form-item>
                    <el-form-item label="onBlur" prop="onBlur">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('onBlur')">编写代码</el-button>
                    </el-form-item>
                    <el-form-item label="onFocus" prop="onFocus">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('onFocus')">编写代码</el-button>
                    </el-form-item>
                    <el-form-item label="onClear" prop="onClear">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('onClear')">编写代码</el-button>
                    </el-form-item>
                    <el-form-item label="onVisibleChange" prop="onVisibleChange">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('onVisibleChange')">编写代码</el-button>
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
import { type WidgetTimePickerData, type ChangeSelectedWidgetSettingDataFun } from "@/views/composables/types";
import { usePropNameValidator } from "@/views/composables/validator";
import { useSettingDataValueChange } from "@/views/composables/widgets/time-picker";
import useJsCodeEditor from "@/views/composables/js-code-editor";

const props = defineProps({
    settingData: {
        type: Object as PropType<WidgetTimePickerData["settingData"]>,
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
