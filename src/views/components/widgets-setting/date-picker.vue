<template>
    <div class="widget-setting-date-picker">
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
                        <el-date-picker :model-value="settingData.defaultValue" :type="settingData.type" :value-format="settingData.valueFormat || 'YYYY-MM-DD'" placeholder="选择日期默认值" />
                    </el-form-item>
                    <el-form-item label="日期类型" prop="type">
                        <el-select :model-value="settingData.type" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'type', value)">
                            <el-option label="年份" value="year" />
                            <el-option label="年份(多选)" value="years" />
                            <el-option label="年份范围" value="yearrange" />
                            <el-option label="月份" value="month" />
                            <el-option label="月份(多选)" value="months" />
                            <el-option label="月份范围" value="monthrange" />
                            <el-option label="周" value="week" />
                            <el-option label="日期" value="date" />
                            <el-option label="日期(多选)" value="dates" />
                            <el-option label="日期范围" value="daterange" />
                            <el-option label="日期时间" value="datetime" />
                            <el-option label="日期时间范围" value="datetimerange" />
                        </el-select>
                    </el-form-item>
                    <el-form-item v-if="['year', 'years', 'month', 'months', 'week', 'date', 'dates', 'datetime'].includes(settingData.type)" label="占位符" prop="placeholder">
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
                    <el-form-item label="数值格式" prop="valueFormat">
                        <el-select :model-value="settingData.valueFormat" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'valueFormat', value)">
                            <el-option label="YYYY-MM-DD" value="YYYY-MM-DD" />
                            <el-option label="YYYY.MM.DD" value="YYYY.MM.DD" />
                            <el-option label="YYYY-MM-DD HH:mm:ss" value="YYYY-MM-DD HH:mm:ss" />
                            <el-option label="YYYY.MM.DD HH:mm:ss" value="YYYY.MM.DD HH:mm:ss" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="输入框格式" prop="format">
                        <el-select :model-value="settingData.format" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'format', value)">
                            <el-option label="YYYY-MM-DD" value="YYYY-MM-DD" />
                            <el-option label="YYYY.MM.DD" value="YYYY.MM.DD" />
                            <el-option label="YYYY-MM-DD HH:mm:ss" value="YYYY-MM-DD HH:mm:ss" />
                            <el-option label="YYYY.MM.DD HH:mm:ss" value="YYYY.MM.DD HH:mm:ss" />
                        </el-select>
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
                    <el-form-item label="禁用日期" prop="disabledDate">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('disabledDate')">编写代码</el-button>
                        <div class="tips-text">禁用日期的方法，用于根据日期判断是否禁用。</div>
                    </el-form-item>
                    <template v-if="['datetime', 'datetimerange'].includes(settingData.type)">
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
                    </template>
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
import { type WidgetDatePickerData, type ChangeSelectedWidgetSettingDataFun } from "@/views/composables/types";
import { usePropNameValidator } from "@/views/composables/validator";
import { useSettingDataValueChange } from "@/views/composables/widgets/date-picker";
import useJsCodeEditor from "@/views/composables/js-code-editor";

const props = defineProps({
    settingData: {
        type: Object as PropType<WidgetDatePickerData["settingData"]>,
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
