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
/**
 * @fileoverview 表单整体设置面板，管理布局、校验展示与初始化脚本。
 * @remarks 表单数据由页面注入并保持原所有权；修改统一交给 changeFormSettingData，使设置态、表单属性及初始化脚本保持一致。
 */
import { ref, inject } from "vue";
import { Edit } from "@element-plus/icons-vue";
import jsCodeEditorDialog from "@/views/components/settings/shared/js-code-editor-dialog.vue";
import { type WidgetFormData } from "@/views/types";

/**
 * @description 页面提供的当前表单整体配置，用于设置控件回显。
 * @remarks 不新建副本或本地可编辑根对象，字段值由页面与管理器持续维护。
 */
const widgetFormData = inject<WidgetFormData>("widgetFormData");

/**
 * @description 页面提供的表单设置写入入口。
 * @remarks 修改整体表单属性和初始化脚本必须经此入口；面板不自行更新运行函数或 componentAttributes。
 */
const changeFormSettingData = inject<(fileName: keyof WidgetFormData["settingData"], value: any) => void>("changeFormSettingData");

// 显示/隐藏 JavaScript 代码编辑器对话框
const isShowJsCodeEditorDialog = ref(false);

/**
 * @description 应用完整的表单初始化脚本并关闭编辑弹窗。
 * @param code 包含函数声明及闭合行的编辑器源码。
 * @returns 无返回值；由表单设置入口同步源码和运行函数体。
 * @remarks 此处只配置 onInit，不执行初始化逻辑；实际执行由预览或表单运行阶段负责。
 */
const saveOnInitCode = function (code: string) {
    changeFormSettingData?.("onInit", code);
    isShowJsCodeEditorDialog.value = false;
};
</script>
