<template>
    <div class="widgets-setting-cascader">
        <el-form :model="settingData" label-width="110px" label-position="left">
            <el-collapse :model-value="['basic', 'source', 'behavior', 'validation', 'events']">
                <el-collapse-item title="基本属性" name="basic">
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
                    <el-form-item label="标签文案">
                        <el-input :model-value="settingData.label" maxlength="30" @update:model-value="value => updateSetting('label', value)" />
                    </el-form-item>
                    <el-form-item label="占位符">
                        <el-input :model-value="settingData.placeholder" maxlength="30" @update:model-value="value => updateSetting('placeholder', value)" />
                    </el-form-item>
                    <el-form-item label="标签位置">
                        <el-radio-group :model-value="settingData.labelPosition" @update:model-value="value => updateSetting('labelPosition', value)">
                            <el-radio-button value="left">左</el-radio-button>
                            <el-radio-button value="right">右</el-radio-button>
                            <el-radio-button value="top">上</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="组件状态">
                        <el-checkbox-group :model-value="settingData.control" @update:model-value="value => updateSetting('control', value)">
                            <el-checkbox value="isShow">显示</el-checkbox>
                            <el-checkbox value="disabled">禁用</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                </el-collapse-item>

                <el-collapse-item title="数据源" name="source">
                    <el-form-item label="选项 JSON" class="json-form-item" :error="jsonError">
                        <el-input
                            :model-value="jsonDraft"
                            type="textarea"
                            :rows="14"
                            resize="vertical"
                            placeholder='[{ "label": "浙江省", "value": "330000", "children": [] }]'
                            @update:model-value="updateOptionsJson"
                        />
                        <div class="setting-tip">根节点必须是数组，节点支持 label、value、children、disabled、leaf。</div>
                    </el-form-item>
                    <el-form-item label="默认值">
                        <el-cascader
                            :model-value="settingData.defaultValue"
                            :options="settingData.options"
                            :props="settingData.multiple ? { multiple: true, emitPath: settingData.emitPath } : { emitPath: settingData.emitPath }"
                            clearable
                            @update:model-value="value => updateSetting('defaultValue', value)"
                        />
                    </el-form-item>
                </el-collapse-item>

                <el-collapse-item title="选择与展示" name="behavior">
                    <el-form-item label="选择行为">
                        <el-checkbox :model-value="settingData.multiple" @update:model-value="value => updateSetting('multiple', value)">多选</el-checkbox>
                        <el-checkbox :model-value="settingData.checkStrictly" @update:model-value="value => updateSetting('checkStrictly', value)">父子不关联</el-checkbox>
                        <el-checkbox :model-value="settingData.emitPath" @update:model-value="value => updateSetting('emitPath', value)">返回完整路径</el-checkbox>
                    </el-form-item>
                    <el-form-item label="展开方式">
                        <el-radio-group :model-value="settingData.expandTrigger" @update:model-value="value => updateSetting('expandTrigger', value)">
                            <el-radio-button value="click">点击</el-radio-button>
                            <el-radio-button value="hover">悬停</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="展示行为">
                        <el-checkbox :model-value="settingData.clearable" @update:model-value="value => updateSetting('clearable', value)">可清空</el-checkbox>
                        <el-checkbox :model-value="settingData.filterable" @update:model-value="value => updateSetting('filterable', value)">可筛选</el-checkbox>
                        <el-checkbox :model-value="settingData.showAllLevels" @update:model-value="value => updateSetting('showAllLevels', value)">显示完整路径</el-checkbox>
                    </el-form-item>
                    <el-form-item v-if="settingData.multiple" label="标签折叠">
                        <el-checkbox :model-value="settingData.collapseTags" @update:model-value="value => updateSetting('collapseTags', value)">折叠标签</el-checkbox>
                        <el-checkbox :model-value="settingData.collapseTagsTooltip" @update:model-value="value => updateSetting('collapseTagsTooltip', value)">悬停提示</el-checkbox>
                    </el-form-item>
                    <el-form-item v-if="settingData.multiple && settingData.collapseTags" label="展示标签数">
                        <el-input-number :model-value="settingData.maxCollapseTags" :min="1" :max="20" @update:model-value="value => updateSetting('maxCollapseTags', value)" />
                    </el-form-item>
                    <el-form-item label="路径分隔符">
                        <el-input :model-value="settingData.separator" maxlength="10" @update:model-value="value => updateSetting('separator', value)" />
                    </el-form-item>
                </el-collapse-item>

                <el-collapse-item title="验证属性" name="validation">
                    <el-form-item label="是否必填">
                        <el-switch :model-value="settingData.required" @update:model-value="value => updateSetting('required', value)" />
                    </el-form-item>
                    <el-form-item v-if="settingData.required" label="必填提示">
                        <el-input :model-value="settingData.requiredMessage" maxlength="50" @update:model-value="value => updateSetting('requiredMessage', value)" />
                    </el-form-item>
                    <el-form-item label="自定义校验">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog('onValidate')">编写代码</el-button>
                    </el-form-item>
                </el-collapse-item>

                <el-collapse-item title="事件属性" name="events">
                    <el-form-item v-for="event in eventFields" :key="event" :label="event">
                        <el-button :icon="Edit" @click="showJsCodeEditorDialog(event)">编写代码</el-button>
                    </el-form-item>
                </el-collapse-item>
            </el-collapse>
        </el-form>
        <js-code-editor-dialog v-if="isShowJsCodeEditorDialog" :value="eventValue" @close="closeJsCodeEditorDialog" @save="saveJsCode" />
    </div>
</template>

<script lang="ts" setup>
/**
 * @fileoverview 级联选择器右侧设置面板，编辑本地完整树、选择行为、校验和事件脚本。
 * @remarks 本地 JSON 草稿属于组件实例状态，只有语法与递归结构全部合法时才覆盖持久化 options，避免输入过程破坏画布中最近可用的树。
 */
import { inject, ref, type PropType } from "vue";
import { Edit } from "@element-plus/icons-vue";
import jsCodeEditorDialog from "../js-code-editor-dialog.vue";
import { type ChangeSelectedWidgetSettingDataFun, type WidgetCascaderData } from "@/views/composables/types";
import useJsCodeEditor from "@/views/composables/js-code-editor";
import { usePropNameValidator } from "@/views/composables/validator";
import { parseCascaderOptionsJson, useSettingDataValueChange } from "@/views/composables/widgets/cascader";

const props = defineProps({
    settingData: {
        type: Object as PropType<WidgetCascaderData["settingData"]>,
        required: true
    }
});

// 通过设计器统一入口更新当前组件并记录设置态数据。
const changeSelectedWidgetSettingData = inject<ChangeSelectedWidgetSettingDataFun>("changeSelectedWidgetSettingData");
// 唯一名称使用本地输入值配合现有异步校验器。
const propName = ref(props.settingData.propName);
// 保留用户正在输入的 JSON，即使其暂时不是合法完整文档。
const jsonDraft = ref(props.settingData.optionsText || JSON.stringify(props.settingData.options, null, 4));
// 当前本地 JSON 草稿的语法或结构错误。
const jsonError = ref("");

/** 支持编辑的级联组件事件脚本字段。 */
const eventFields: Array<"onChange" | "onVisibleChange" | "onExpandChange" | "onClear" | "onRemoveTag" | "onBlur" | "onFocus"> = [
    "onChange",
    "onVisibleChange",
    "onExpandChange",
    "onClear",
    "onRemoveTag",
    "onBlur",
    "onFocus"
];

const propNameValidator = usePropNameValidator(useSettingDataValueChange);

/**
 * @description 通过父级统一入口更新一个级联设置字段。
 * @param field 待更新的 settingData 字段。
 * @param value 字段的新值。
 * @returns 无返回值。
 */
const updateSetting = function (field: keyof WidgetCascaderData["settingData"], value: any): void {
    changeSelectedWidgetSettingData?.(useSettingDataValueChange, field, value);
};

/**
 * @description 校验并提交本地完整树 JSON 草稿。
 * @param value 文本域当前完整内容，可包含换行、缩进和合法空白。
 * @returns 无返回值；非法草稿只更新本地错误状态，最近合法树保持不变。
 */
const updateOptionsJson = function (value: string): void {
    jsonDraft.value = value;
    const result = parseCascaderOptionsJson(value);
    if (!result.ok) {
        jsonError.value = `${result.message}（${result.path}）`;
        return;
    }
    jsonError.value = "";
    updateSetting("options", result.data);
    updateSetting("optionsText", value);
};

const { isShowJsCodeEditorDialog, eventValue, showJsCodeEditorDialog, closeJsCodeEditorDialog, saveJsCode } = useJsCodeEditor(
    props.settingData,
    changeSelectedWidgetSettingData!,
    useSettingDataValueChange
);
</script>

<style lang="scss" scoped>
.widgets-setting-cascader {
    :deep(.el-cascader),
    :deep(.el-input-number) {
        width: 100%;
    }
}

.json-form-item :deep(.el-form-item__content) {
    display: block;
}

.setting-tip {
    margin-top: 5px;
    color: #909399;
    font-size: 12px;
    line-height: 18px;
}
</style>
