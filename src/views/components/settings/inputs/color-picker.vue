<template>
    <div class="widgets-setting-color-picker">
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
                            <el-checkbox value="readonly">只读</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="默认值" prop="defaultValue">
                        <el-color-picker
                            :model-value="settingData.defaultValue"
                            :color-format="settingData.colorFormat || 'hex'"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'defaultValue', value)"
                        />
                    </el-form-item>
                    <el-form-item label="颜色格式" prop="colorFormat">
                        <el-select
                            :model-value="settingData.colorFormat"
                            placeholder="请选择颜色格式"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'colorFormat', value)"
                        >
                            <el-option label="十六进制" value="hex" />
                            <el-option label="十六进制（3位）" value="hex3" />
                            <el-option label="十六进制（4位）" value="hex4" />
                            <el-option label="十六进制（6位）" value="hex6" />
                            <el-option label="十六进制（8位）" value="hex8" />
                            <el-option label="预定义颜色" value="prgb" />
                            <el-option label="RGB" value="rgb" />
                            <el-option label="HSL" value="hsl" />
                            <el-option label="HSV" value="hsv" />
                            <el-option label="名称" value="name" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="是否可清空" prop="clearable">
                        <el-switch
                            :model-value="!!settingData.clearable"
                            :active-value="true"
                            :inactive-value="false"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'clearable', value)"
                        />
                    </el-form-item>
                    <el-form-item label="显示alpha滑块" prop="showAlpha">
                        <el-switch
                            :model-value="!!settingData.showAlpha"
                            active-text="显示"
                            inactive-text="不显示"
                            :active-value="true"
                            :inactive-value="false"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'showAlpha', value)"
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
                    <el-form-item label="onInput" prop="onInput">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('onInput')">编写代码</el-button>
                    </el-form-item>
                    <el-form-item label="onActiveChange" prop="onActiveChange">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('onActiveChange')">编写代码</el-button>
                    </el-form-item>
                </el-collapse-item>
            </el-collapse>
        </el-form>
        <js-code-editor-dialog v-if="isShowJsCodeEditorDialog" :value="eventValue" @close="closeJsCodeEditorDialog" @save="saveJsCode" />
    </div>
</template>
<script setup lang="ts">
/**
 * @fileoverview 颜色选择器的设置面板，管理颜色格式、透明度、默认值和事件脚本。
 * @remarks props 提供当前选中组件的只读设置态；编辑通过注入的统一更新入口交给组件适配器，避免只写 settingData 而不同步 componentAttributes 或函数体。
 */
import { ref, inject, type PropType } from "vue";
import { Edit } from "@element-plus/icons-vue";
import jsCodeEditorDialog from "@/views/components/settings/shared/js-code-editor-dialog.vue";
import { type WidgetColorPickerData, type ChangeSelectedWidgetSettingDataFun } from "@/views/types";
import { usePropNameValidator } from "@/views/composables/use-prop-name-validator";
import { useSettingDataValueChange } from "@/views/domain/widgets/adapters/color-picker";
import useJsCodeEditor from "@/views/composables/use-js-code-editor";

/**
 * @description 当前选中组件的设置数据输入。
 * @remarks 数据由父面板持有，本面板不复制完整节点或直接写入嵌套配置；变更统一传回管理器与对应适配器。
 */
const props = defineProps({
    /** 当前组件用于设置面板回显的配置；运行属性由统一更新入口同步。 */
    settingData: {
        type: Object as PropType<WidgetColorPickerData["settingData"]>,
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
