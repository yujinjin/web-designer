<template>
    <div class="widgets-setting-html">
        <el-form :model="settingData" label-width="100px" label-position="left">
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
                    <el-form-item label="HTML" class="html-form-item" :error="htmlError">
                        <el-input :model-value="htmlDraft" placeholder="请输入HTML代码" type="textarea" :rows="10" @update:model-value="updateHtmlContent" />
                    </el-form-item>
                </el-collapse-item>
            </el-collapse>
        </el-form>
    </div>
</template>
<script setup lang="ts">
/**
 * @fileoverview HTML 展示组件的设置面板，区分编辑草稿、安全校验结果和画布的已接受内容。
 * @remarks props 提供当前选中组件的只读设置态；编辑通过注入的统一更新入口交给组件适配器，避免只写 settingData 而不同步 componentAttributes 或函数体。
 */
import { ref, inject, type PropType } from "vue";
import { type WidgetHTMLData, type ChangeSelectedWidgetSettingDataFun } from "@/views/types";
import { usePropNameValidator } from "@/views/composables/use-prop-name-validator";
import { updateHtmlDefaultValue, useSettingDataValueChange } from "@/views/domain/widgets/adapters/html";

/**
 * @description 当前选中组件的设置数据输入。
 * @remarks 数据由父面板持有，本面板不复制完整节点或直接写入嵌套配置；变更统一传回管理器与对应适配器。
 */
const props = defineProps({
    /** 当前组件用于设置面板回显的配置；运行属性由统一更新入口同步。 */
    settingData: {
        type: Object as PropType<WidgetHTMLData["settingData"]>,
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

// 未通过校验的 HTML 仍保留在输入框中，避免用户修正内容时丢失草稿。
const htmlDraft = ref(props.settingData.defaultValue ?? "");

// 显示最近一次 HTML 内容检查发现的危险标签或属性。
const htmlError = ref("");

/**
 * @description 对唯一名称执行设计器范围校验，并通过当前组件适配器提交合法值。
 * @remarks 校验规则和通过后的写入请求由专用验证器管理；本面板不单独维护唯一性检查或修改字段运行值键。
 */
const propNameValidator = usePropNameValidator(useSettingDataValueChange);

/**
 * @description 校验 HTML 输入草稿，并只在安全时同步组件设置和画布。
 * @param value 输入框最新内容。
 * @returns 无返回值；非法内容仅更新草稿及行内错误。
 * @remarks 必须先检查再写入统一入口，避免危险内容短暂进入画布；错误草稿仍留在输入框中方便修正。
 */
const updateHtmlContent = function (value: string): void {
    htmlDraft.value = value;
    // 领域适配器只向回调交付已通过安全检查的内容，失败不写入当前设计。
    const result = updateHtmlDefaultValue(value, safeValue => changeSelectedWidgetSettingData?.(useSettingDataValueChange, "defaultValue", safeValue));
    htmlError.value = result.ok ? "" : result.message;
};
</script>
<style scoped lang="scss">
.widgets-setting-html {
    .html-form-item {
        margin-bottom: 20px;

        :deep(.el-form-item__content) {
            display: block;
        }
    }
}
</style>
