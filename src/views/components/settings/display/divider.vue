<template>
    <div class="widgets-setting-divider">
        <el-form :model="settingData" label-width="80px" label-position="left">
            <el-collapse :model-value="['1']">
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
                    <el-form-item label="控制属性" prop="control">
                        <el-checkbox-group :model-value="settingData.control" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'control', value)">
                            <el-checkbox value="isHidden">隐藏</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="分割线内容" prop="defaultValue">
                        <el-input
                            :model-value="settingData.defaultValue"
                            placeholder="请输入分割线内容"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'defaultValue', value)"
                        />
                    </el-form-item>
                    <el-form-item label="内容位置" prop="contentPosition">
                        <el-radio-group
                            :model-value="settingData.contentPosition || 'left'"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'contentPosition', value)"
                        >
                            <el-radio-button label="left">左侧</el-radio-button>
                            <el-radio-button label="center">居中</el-radio-button>
                            <el-radio-button label="right">右侧</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="分隔符样式" prop="borderStyle">
                        <el-radio-group
                            :model-value="settingData.borderStyle || 'solid'"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'borderStyle', value)"
                        >
                            <el-radio-button label="solid">实线</el-radio-button>
                            <el-radio-button label="dashed">虚线</el-radio-button>
                            <el-radio-button label="dotted">点线</el-radio-button>
                            <el-radio-button label="none">无</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="方向" prop="direction">
                        <el-radio-group
                            :model-value="settingData.direction || 'horizontal'"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'direction', value)"
                        >
                            <el-radio-button label="horizontal">水平</el-radio-button>
                            <el-radio-button label="vertical">垂直</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                </el-collapse-item>
            </el-collapse>
        </el-form>
    </div>
</template>
<script setup lang="ts">
/**
 * @fileoverview 分割线组件的设置面板，管理文案、方向、对齐和边框形态。
 * @remarks props 提供当前选中组件的只读设置态；编辑通过注入的统一更新入口交给组件适配器，避免只写 settingData 而不同步 componentAttributes 或函数体。
 */
import { ref, inject, type PropType } from "vue";
import { type WidgetDividerData, type ChangeSelectedWidgetSettingDataFun } from "@/views/types";
import { usePropNameValidator } from "@/views/composables/use-prop-name-validator";
import { useSettingDataValueChange } from "@/views/domain/widgets/adapters/divider";

/**
 * @description 当前选中组件的设置数据输入。
 * @remarks 数据由父面板持有，本面板不复制完整节点或直接写入嵌套配置；变更统一传回管理器与对应适配器。
 */
const props = defineProps({
    /** 当前组件用于设置面板回显的配置；运行属性由统一更新入口同步。 */
    settingData: {
        type: Object as PropType<WidgetDividerData["settingData"]>,
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
</script>
