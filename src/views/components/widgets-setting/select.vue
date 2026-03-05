<template>
    <div class="widgets-setting-select">
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
                    <el-form-item label="占位符" prop="placeholder">
                        <el-input
                            :model-value="settingData.placeholder"
                            placeholder="请输入占位符"
                            maxlength="30"
                            @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'placeholder', value)"
                        />
                    </el-form-item>
                    <el-form-item label="标签位置" prop="labelPosition">
                        <el-radio-group :model-value="settingData.labelPosition" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'labelPosition', value)">
                            <el-radio-button value="left">左</el-radio-button>
                            <el-radio-button value="right">右</el-radio-button>
                            <el-radio-button value="top">上</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <div class="option-config-row">
                        <div class="label-text">选项配置</div>
                        <option-config
                            :options="settingData.options"
                            :default-value="settingData.defaultValue!"
                            @update-default-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'defaultValue', value)"
                            @update-options="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'options', value)"
                        />
                    </div>
                    <el-form-item label="是否可清空" prop="clearable">
                        <el-checkbox :model-value="!!settingData.clearable" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'clearable', value)" />
                    </el-form-item>
                    <el-form-item label="是否可筛选" prop="filterable">
                        <el-checkbox :model-value="!!settingData.filterable" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'filterable', value)" />
                    </el-form-item>
                    <el-form-item label="是否允许创建" prop="allowCreate">
                        <el-checkbox :model-value="!!settingData.allowCreate" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'allowCreate', value)" />
                    </el-form-item>
                    <el-form-item label="是否可多选" prop="multiple">
                        <el-checkbox :model-value="!!settingData.multiple" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'multiple', value)" />
                    </el-form-item>
                    <template v-if="settingData.multiple">
                        <el-form-item label="最大选择数量" prop="multipleLimit">
                            <el-input-number
                                :model-value="settingData.multipleLimit"
                                placeholder="请输入最大选择数量"
                                clearable
                                :min="2"
                                :max="100"
                                @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'multipleLimit', value)"
                            />
                        </el-form-item>
                        <el-form-item label="是否可折叠" prop="collapseTags">
                            <el-checkbox :model-value="!!settingData.collapseTags" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'collapseTags', value)" />
                        </el-form-item>
                        <el-form-item v-if="settingData.collapseTags" label="最大折叠标签数量" prop="maxCollapseTags">
                            <el-input-number
                                :model-value="settingData.maxCollapseTags"
                                placeholder="请输入最大折叠标签数量"
                                clearable
                                :min="2"
                                :max="100"
                                @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'maxCollapseTags', value)"
                            />
                        </el-form-item>
                        <el-form-item label="是否可折叠提示" prop="collapseTagsTooltip">
                            <el-checkbox
                                :model-value="!!settingData.collapseTagsTooltip"
                                @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'collapseTagsTooltip', value)"
                            />
                        </el-form-item>
                    </template>
                    <el-form-item label="是否远程加载" prop="remote">
                        <el-checkbox :model-value="!!settingData.remote" @update:model-value="value => changeSelectedWidgetSettingData?.(useSettingDataValueChange, 'remote', value)" />
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
                <el-collapse-item v-if="settingData.remote || settingData.filterMethod" title="高级属性" name="3">
                    <el-form-item v-if="settingData.remote" label="remoteMethod" prop="remoteMethod">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('remoteMethod')">编写代码</el-button>
                        <div class="tips-text">远程加载时调用的方法，用于获取远程数据。</div>
                    </el-form-item>
                    <el-form-item v-if="settingData.filterMethod" label="filterMethod" prop="filterMethod">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('filterMethod')">编写代码</el-button>
                        <div class="tips-text">自定义筛选方法,只有当 filterable 设置为 true 时才会生效。</div>
                    </el-form-item>
                </el-collapse-item>
                <el-collapse-item title="事件属性" name="4">
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
                    <el-form-item label="onClear" prop="onClear">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('onClear')">编写代码</el-button>
                    </el-form-item>
                    <el-form-item label="onRemoveTag" prop="onRemoveTag">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('onRemoveTag')">编写代码</el-button>
                    </el-form-item>
                    <el-form-item label="onVisibleChange" prop="onVisibleChange">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('onVisibleChange')">编写代码</el-button>
                    </el-form-item>
                </el-collapse-item>
            </el-collapse>
        </el-form>
        <js-code-editor-dialog v-if="isShowJsCodeEditorDialog" :value="eventValue" @close="closeJsCodeEditorDialog" @save="saveJsCode" />
    </div>
</template>
<script lang="ts" setup>
import { ref, inject, type PropType } from "vue";
import { Edit } from "@element-plus/icons-vue";
import jsCodeEditorDialog from "../js-code-editor-dialog.vue";
import { type WidgetSelectData, type ChangeSelectedWidgetSettingDataFun } from "@/views/composables/types";
import { usePropNameValidator } from "@/views/composables/validator";
import { useSettingDataValueChange } from "@/views/composables/widgets/select";
import useJsCodeEditor from "@/views/composables/js-code-editor";
import optionConfig from "@/views/components/option-config.vue";

const props = defineProps({
    settingData: {
        type: Object as PropType<WidgetSelectData["settingData"]>,
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
.option-config-row {
    display: flex;
    flex-direction: column;

    .label-text {
        padding: 8px 0px;
        line-height: 24px;
    }
}
.label-text {
    width: 100px;
}
.tips-text {
    font-size: 12px;
    color: #9ca3af;
    margin-top: 4px;
}
</style>
