<template>
    <div class="widget-setting-time-select">
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
                            <el-checkbox value="isHidden">隐藏</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="占位符" prop="placeholder">
                        <el-input
                            :model-value="settingData.placeholder"
                            placeholder="请输入占位符"
                            maxlength="30"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'placeholder', value)"
                        />
                    </el-form-item>
                    <el-form-item label="默认值" prop="defaultValue">
                        <el-time-select
                            :model-value="settingData.defaultValue"
                            :step="settingData.step || '00:30'"
                            :format="settingData.format || 'HH:mm'"
                            placeholder="选择时间默认值"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'defaultValue', value)"
                        />
                    </el-form-item>
                    <el-form-item label="时间格式" prop="format">
                        <el-input
                            :model-value="settingData.format"
                            placeholder="请输入时间格式"
                            maxlength="8"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'format', value)"
                        />
                    </el-form-item>
                    <el-form-item label="开始时间" prop="start">
                        <el-input
                            :model-value="settingData.start"
                            placeholder="请输入开始时间"
                            maxlength="8"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'start', value)"
                        />
                    </el-form-item>
                    <el-form-item label="结束时间" prop="end">
                        <el-input
                            :model-value="settingData.end"
                            placeholder="请输入结束时间"
                            maxlength="8"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'end', value)"
                        />
                    </el-form-item>
                    <el-form-item label="时间步长" prop="step">
                        <el-input
                            :model-value="settingData.step"
                            placeholder="请输入时间步长"
                            maxlength="8"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'step', value)"
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
                <el-collapse-item title="事件属性" name="3">
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
                </el-collapse-item>
            </el-collapse>
        </el-form>
        <js-code-editor-dialog v-if="isShowJsCodeEditorDialog" :value="eventValue" @close="closeJsCodeEditorDialog" @save="saveJsCode" />
    </div>
</template>
<script lang="ts" setup>
/**
 * @fileoverview 固定步长时间选择器的设置面板，管理起止时刻、步长和格式。
 * @remarks props 提供当前选中组件的只读设置态；编辑通过注入的统一更新入口交给组件适配器，避免只写 settingData 而不同步 componentAttributes 或函数体。
 */
import { ref, inject, type PropType } from "vue";
import { Edit } from "@element-plus/icons-vue";
import jsCodeEditorDialog from "@/views/components/settings/shared/js-code-editor-dialog.vue";
import { type WidgetTimeSelectData, type ChangeSelectedWidgetSettingDataFun } from "@/views/types";
import { usePropNameValidator } from "@/views/composables/use-prop-name-validator";
import { useSettingDataValueChange } from "@/views/domain/widgets/adapters/time-select";
import useJsCodeEditor from "@/views/composables/use-js-code-editor";

/**
 * @description 当前选中组件的设置数据输入。
 * @remarks 数据由父面板持有，本面板不复制完整节点或直接写入嵌套配置；变更统一传回管理器与对应适配器。
 */
const props = defineProps({
    /** 当前组件用于设置面板回显的配置；运行属性由统一更新入口同步。 */
    settingData: {
        type: Object as PropType<WidgetTimeSelectData["settingData"]>,
        required: true
    }
});

/**
 * @description 当前组件的统一设置更新入口，缺失注入时由可选调用跳过更新。
 * @remarks 把设置字段和对应适配器一起交回管理器；显隐、表单项属性及动态函数不能在面板内各自单独维护。
 */
const changeSelectedWidgetSettingData = inject<ChangeSelectedWidgetSettingDataFun>("changeSelectedWidgetSettingData");

// 唯一名称的本地输入草稿，校验通过后由验证器请求写入业务字段名。
const propName = ref(props.settingData.propName);

/**
 * @description 对唯一名称执行设计器范围校验，并通过当前组件适配器提交合法值。
 * @remarks 校验规则和通过后的写入请求由专用验证器管理；本面板不单独维护唯一性检查或修改字段运行值键。
 */
const propNameValidator = usePropNameValidator(useSettingDataValueChange);

/**
 * @description 脚本弹窗的显示状态、源码草稿与打开、关闭、应用操作。
 * @remarks 编辑过程不执行脚本；应用时走统一设置入口，完整源码与运行函数体由适配器同步。
 */
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
