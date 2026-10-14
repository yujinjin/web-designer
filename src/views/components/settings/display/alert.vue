<template>
    <div class="widgets-setting-alert">
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
                    <el-form-item>
                        <el-button @click="changeSelectedWidgetSettingData?.(showAlert, 'control', null)">显示提示信息</el-button>
                    </el-form-item>
                    <el-form-item label="标题" prop="title">
                        <el-input
                            type="text"
                            :model-value="settingData.title"
                            placeholder="请输入标题"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'title', value)"
                        />
                    </el-form-item>
                    <el-form-item label="描述" prop="description">
                        <el-input
                            type="text"
                            :model-value="settingData.description"
                            placeholder="请输入描述"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'description', value)"
                        />
                    </el-form-item>
                    <el-form-item label="类型" prop="type">
                        <el-radio-group :model-value="settingData.type || 'info'" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'type', value)">
                            <el-radio-button value="info">信息</el-radio-button>
                            <el-radio-button value="success">成功</el-radio-button>
                            <el-radio-button value="warning">警告</el-radio-button>
                            <el-radio-button value="error">错误</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="显示图标" prop="showIcon">
                        <el-switch
                            :model-value="!!settingData.showIcon"
                            :active-value="true"
                            :inactive-value="false"
                            active-text="显示"
                            inactive-text="不显示"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'showIcon', value)"
                        />
                    </el-form-item>
                    <el-form-item label="可关闭" prop="closable">
                        <el-switch
                            :model-value="!!settingData.closable"
                            :active-value="true"
                            :inactive-value="false"
                            active-text="可关闭"
                            inactive-text="不可关闭"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'closable', value)"
                        />
                    </el-form-item>
                    <el-form-item label="关闭文案" prop="closeText">
                        <el-input
                            :model-value="settingData.closeText"
                            type="text"
                            placeholder="请输入关闭文案"
                            maxlength="30"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'closeText', value)"
                        />
                    </el-form-item>
                    <el-form-item label="居中显示" prop="center">
                        <el-switch
                            :model-value="!!settingData.center"
                            :active-value="true"
                            :inactive-value="false"
                            active-text="居中显示"
                            inactive-text="不居中显示"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'center', value)"
                        />
                    </el-form-item>
                    <el-form-item label="效果" prop="effect">
                        <el-radio-group :model-value="settingData.effect || 'light'" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'effect', value)">
                            <el-radio-button value="dark">暗黑模式</el-radio-button>
                            <el-radio-button value="light">浅色模式</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                </el-collapse-item>
            </el-collapse>
        </el-form>
    </div>
</template>
<script setup lang="ts">
/**
 * @fileoverview 提示信息组件的设置面板，管理内容、主题、关闭行为及当前提示的再次显示。
 * @remarks props 提供当前选中组件的只读设置态，属性编辑统一交给适配器；再次显示操作委托临时渲染状态模块，既恢复显隐也重置 ElAlert 内部关闭状态，不把临时 key 写入 JSON。
 */
import { ref, inject, type PropType } from "vue";
import { type WidgetAlertData, type ChangeSelectedWidgetSettingDataFun } from "@/views/types";
import { usePropNameValidator } from "@/views/composables/use-prop-name-validator";
import { useSettingDataValueChange } from "@/views/domain/widgets/adapters/alert";
import { showAlert } from "@/views/composables/use-alert-render-state";

/**
 * @description 当前选中组件的设置数据输入。
 * @remarks 数据由父面板持有，本面板不复制完整节点或直接写入嵌套配置；变更统一传回管理器与对应适配器。
 */
const props = defineProps({
    /** 当前组件用于设置面板回显的配置；运行属性由统一更新入口同步。 */
    settingData: {
        type: Object as PropType<WidgetAlertData["settingData"]>,
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
