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
                            <el-checkbox value="isShow">显示</el-checkbox>
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
import { ref, inject, type PropType } from "vue";
import { type WidgetHTMLData, type ChangeSelectedWidgetSettingDataFun } from "@/views/composables/types";
import { usePropNameValidator } from "@/views/composables/validator";
import { updateHtmlDefaultValue, useSettingDataValueChange } from "@/views/composables/widgets/html";

const props = defineProps({
    settingData: {
        type: Object as PropType<WidgetHTMLData["settingData"]>,
        required: true
    }
});

const changeSelectedWidgetSettingData = inject<ChangeSelectedWidgetSettingDataFun>("changeSelectedWidgetSettingData");

const propName = ref(props.settingData.propName);

// 未通过校验的 HTML 仍保留在输入框中，避免用户修正内容时丢失草稿。
const htmlDraft = ref(props.settingData.defaultValue ?? "");

// 显示最近一次 HTML 内容检查发现的危险标签或属性。
const htmlError = ref("");

const propNameValidator = usePropNameValidator(useSettingDataValueChange);

/**
 * @description 校验 HTML 输入草稿，并只在安全时同步组件设置和画布。
 * @param value 输入框最新内容。
 * @returns 无返回值；非法内容仅更新草稿及行内错误。
 */
const updateHtmlContent = function (value: string): void {
    htmlDraft.value = value;
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
