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
                            <el-checkbox value="isHidden">隐藏</el-checkbox>
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
/**
 * @fileoverview 滑块组件的设置面板，管理区间、步长、刻度和数值输入。
 * @remarks props 提供当前选中组件的只读设置态；编辑通过注入的统一更新入口交给组件适配器，避免只写 settingData 而不同步 componentAttributes 或函数体。
 */
import { ref, inject, type PropType } from "vue";
import { Edit } from "@element-plus/icons-vue";
import jsCodeEditorDialog from "@/views/components/settings/shared/js-code-editor-dialog.vue";
import { type WidgetSliderData, type ChangeSelectedWidgetSettingDataFun } from "@/views/types";
import { usePropNameValidator } from "@/views/composables/use-prop-name-validator";
import { useSettingDataValueChange } from "@/views/domain/widgets/adapters/slider";
import useJsCodeEditor from "@/views/composables/use-js-code-editor";

/**
 * @description 当前选中组件的设置数据输入。
 * @remarks 数据由父面板持有，本面板不复制完整节点或直接写入嵌套配置；变更统一传回管理器与对应适配器。
 */
const props = defineProps({
    /** 当前组件用于设置面板回显的配置；运行属性由统一更新入口同步。 */
    settingData: {
        type: Object as PropType<WidgetSliderData["settingData"]>,
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
.widgets-setting-slider {
    height: 100%;

    .tips-text {
        font-size: 12px;
        color: #9ca3af;
        margin-top: 4px;
    }
}
</style>
