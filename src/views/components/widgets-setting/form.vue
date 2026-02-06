<template>
    <div class="widgets-setting-form">
        <el-form :model="widgetFormData!.settingData" label-width="100px" label-position="left">
            <el-collapse :model-value="['1', '2']">
                <el-collapse-item title="基本属性" name="1">
                    <el-form-item label="标签位置" prop="labelPosition">
                        <el-radio-group :model-value="widgetFormData!.settingData.labelPosition" @update:model-value="value => changeFormSettingData?.('labelPosition', value)">
                            <el-radio-button value="left">左</el-radio-button>
                            <el-radio-button value="right">右</el-radio-button>
                            <el-radio-button value="top">上</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="标签宽度" prop="labelWidth">
                        <el-input-number :model-value="widgetFormData!.settingData.labelWidth" :min="80" :max="200" @update:model-value="value => changeFormSettingData?.('labelWidth', value)">
                            <template #suffix>
                                <span>px</span>
                            </template>
                        </el-input-number>
                    </el-form-item>
                </el-collapse-item>
                <el-collapse-item title="事件" name="2">
                    <el-form-item label="onInit" prop="onInit">
                        <el-button :icon="Edit" @click="isShowJsCodeEditorDialog = true">编写代码</el-button>
                    </el-form-item>
                </el-collapse-item>
            </el-collapse>
        </el-form>
        <js-code-editor-dialog v-if="isShowJsCodeEditorDialog" :value="widgetFormData!.settingData.onInit" @close="isShowJsCodeEditorDialog = false" @save="saveOnInitCode" />
    </div>
</template>
<script setup lang="ts">
import { ref, inject } from "vue";
import { Edit } from "@element-plus/icons-vue";
import jsCodeEditorDialog from "../js-code-editor-dialog.vue";
import { type WidgetFormData } from "@/views/composables/types";

// 获取注入的表单数据
const widgetFormData = inject<WidgetFormData>("widgetFormData");

// 获取注入的改变表单数据的函数
const changeFormSettingData = inject<(fileName: keyof WidgetFormData["settingData"], value: any) => void>("changeFormSettingData");

// 显示/隐藏 JavaScript 代码编辑器对话框
const isShowJsCodeEditorDialog = ref(false);

// 保存 onInit 代码
const saveOnInitCode = function (code: string) {
    changeFormSettingData?.("onInit", code);
    isShowJsCodeEditorDialog.value = false;
};
</script>
