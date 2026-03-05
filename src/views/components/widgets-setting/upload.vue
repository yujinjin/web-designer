<template>
    <div class="widgets-setting-upload">
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
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="请求URL" prop="action">
                        <el-input
                            :model-value="settingData.action"
                            placeholder="请输入请求 URL"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'action', value)"
                        />
                    </el-form-item>
                    <el-form-item label="请求方法" prop="method">
                        <el-radio-group :model-value="settingData.method || 'post'" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'method', value)">
                            <el-radio-button value="post">POST</el-radio-button>
                            <el-radio-button value="get">GET</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="是否多选" prop="multiple">
                        <el-switch :model-value="!!settingData.multiple" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'multiple', value)" />
                    </el-form-item>
                    <el-form-item label="文件类型" prop="accept">
                        <el-select
                            :model-value="settingData.accept"
                            placeholder="请选择文件类型"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'accept', value)"
                        >
                            <el-option label="所有文件" value="" />
                            <el-option label="图片文件" value="image/*" />
                            <el-option label="视频文件" value="video/*" />
                            <el-option label="文档文件" value="application/*" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="文件列表类型" prop="listType">
                        <el-radio-group :model-value="settingData.listType || 'text'" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'listType', value)">
                            <el-radio-button value="picture-card">图片卡片</el-radio-button>
                            <el-radio-button value="picture">图片</el-radio-button>
                            <el-radio-button value="text">文件</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="文件字段名" prop="name">
                        <el-input
                            :model-value="settingData.name"
                            placeholder="请输入文件字段名"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'name', value)"
                        />
                    </el-form-item>
                    <el-form-item label="显示文件列表" prop="showFileList">
                        <el-switch :model-value="!!settingData.showFileList" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'showFileList', value)" />
                    </el-form-item>
                    <el-form-item label="启用拖拽" prop="drag">
                        <el-switch :model-value="!!settingData.drag" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'drag', value)" />
                    </el-form-item>
                    <el-form-item label="自动上传" prop="autoUpload">
                        <el-switch :model-value="!!settingData.autoUpload" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'autoUpload', value)" />
                    </el-form-item>
                    <el-form-item label="上传最大数量" prop="limit">
                        <el-input-number
                            :model-value="settingData.limit"
                            placeholder="请输入上传最大数量"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'limit', value)"
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
                    <el-form-item label="httpRequest" prop="httpRequest">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('httpRequest')">编写代码</el-button>
                        <div class="tips-text">自定义请求请求函数体逻辑，可直接使用 uploadFile 参数</div>
                    </el-form-item>
                    <el-form-item label="data" prop="data">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('data')">编写代码</el-button>
                        <div class="tips-text">上传时附带的额外参数，支持 Awaitable 数据</div>
                    </el-form-item>
                    <el-form-item label="onPreview" prop="onPreview">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('onPreview')">编写代码</el-button>
                        <div class="tips-text">预览文件函数体逻辑，可直接使用 uploadFile 参数</div>
                    </el-form-item>
                    <el-form-item label="onRemove" prop="onRemove">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('onRemove')">编写代码</el-button>
                        <div class="tips-text">删除文件函数体逻辑，可直接使用 uploadFile, uploadFiles 参数</div>
                    </el-form-item>
                    <el-form-item label="onSuccess" prop="onSuccess">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('onSuccess')">编写代码</el-button>
                        <div class="tips-text">上传成功函数体逻辑，可直接使用 response, uploadFile, uploadFiles 参数</div>
                    </el-form-item>
                    <el-form-item label="onError" prop="onError">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('onError')">编写代码</el-button>
                        <div class="tips-text">上传错误函数体逻辑，可直接使用 response, uploadFile, uploadFiles 参数</div>
                    </el-form-item>
                    <el-form-item label="onProgress" prop="onProgress">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('onProgress')">编写代码</el-button>
                        <div class="tips-text">上传进度函数体逻辑，可直接使用 uploadFile 参数</div>
                    </el-form-item>
                    <el-form-item label="onChange" prop="onChange">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('onChange')">编写代码</el-button>
                        <div class="tips-text">文件选择函数体逻辑，可直接使用 uploadFile, uploadFiles 参数</div>
                    </el-form-item>
                    <el-form-item label="onExceed" prop="onExceed">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('onExceed')">编写代码</el-button>
                        <div class="tips-text">上传文件数量超过限制时的回调函数，可直接使用 uploadFiles 参数</div>
                    </el-form-item>
                    <el-form-item label="beforeUpload" prop="beforeUpload">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('beforeUpload')">编写代码</el-button>
                        <div class="tips-text">上传前的函数体逻辑，可直接使用 uploadFile 参数</div>
                    </el-form-item>
                    <el-form-item label="beforeRemove" prop="beforeRemove">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('beforeRemove')">编写代码</el-button>
                        <div class="tips-text">删除前的函数体逻辑，可直接使用 uploadFile 参数</div>
                    </el-form-item>
                </el-collapse-item>
                <el-collapse-item title="事件" name="4">
                    <el-form-item label="onValidate" prop="onValidate">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('onValidate')">编写代码</el-button>
                    </el-form-item>
                </el-collapse-item>
            </el-collapse>
        </el-form>
        <js-code-editor-dialog v-if="isShowJsCodeEditorDialog" :value="eventValue" @close="closeJsCodeEditorDialog" @save="saveJsCode" />
    </div>
</template>
<script setup lang="ts">
import { ref, inject, type PropType } from "vue";
import { Edit } from "@element-plus/icons-vue";
import jsCodeEditorDialog from "../js-code-editor-dialog.vue";
import { type WidgetUploadData, type ChangeSelectedWidgetSettingDataFun } from "@/views/composables/types";
import { usePropNameValidator } from "@/views/composables/validator";
import { useSettingDataValueChange } from "@/views/composables/widgets/upload";
import useJsCodeEditor from "@/views/composables/js-code-editor";

const props = defineProps({
    settingData: {
        type: Object as PropType<WidgetUploadData["settingData"]>,
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
.widgets-setting-upload {
    height: 100%;

    .tips-text {
        font-size: 12px;
        color: #9ca3af;
        margin-top: 4px;
    }
}
</style>
