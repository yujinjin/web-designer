<template>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-if="widgetData.code === widgetList.WIDGET_HTML.code" class="html-contents" v-html="htmlDefaultValue"></div>
    <div v-else-if="widgetData.code === widgetList.WIDGET_ALERT.code" class="alert-box">
        <el-alert v-bind="renderComponentAttributes" />
    </div>
    <div v-else-if="widgetData.code === widgetList.WIDGET_DIVIDER.code" class="divider-box">
        <el-divider v-bind="renderComponentAttributes">
            {{ widgetData.defaultValue }}
        </el-divider>
    </div>
    <el-form-item
        v-else
        v-bind="widgetData.formAttributes"
        :rules="
            useFormItemRules(
                {
                    required: formItemRuleConfig.required,
                    requiredMessage: formItemRuleConfig.requiredMessage,
                    regExp: formItemRuleConfig.regExp,
                    regExpMessage: formItemRuleConfig.regExpMessage,
                    validate: formItemRuleConfig.validate
                },
                formData,
                widgetFormData
            )
        "
    >
        <el-input
            v-if="widgetData.code === widgetList.WIDGET_TEXT.code"
            v-model="renderValue"
            v-bind="renderComponentAttributes"
            v-on="getWidgetComponentEvents(widgetData, formData, widgetFormData)"
        />
        <el-input-number
            v-else-if="widgetData.code === widgetList.WIDGET_INPUT_NUMBER.code"
            v-model="renderValue"
            v-bind="renderComponentAttributes"
            v-on="getWidgetComponentEvents(widgetData, formData, widgetFormData)"
        />
        <el-radio-group
            v-else-if="widgetData.code === widgetList.WIDGET_RADIO_GROUP.code"
            v-model="renderValue"
            v-bind="renderComponentAttributes"
            v-on="getWidgetComponentEvents(widgetData, formData, widgetFormData)"
        />
        <el-checkbox-group
            v-else-if="widgetData.code === widgetList.WIDGET_CHECKBOX_GROUP.code"
            v-model="renderValue"
            v-bind="renderComponentAttributes"
            v-on="getWidgetComponentEvents(widgetData, formData, widgetFormData)"
        />
        <el-select
            v-else-if="widgetData.code === widgetList.WIDGET_SELECT.code"
            v-model="renderValue"
            v-bind="renderComponentAttributes"
            v-on="getWidgetComponentEvents(widgetData, formData, widgetFormData)"
        />
        <el-cascader
            v-else-if="widgetData.code === widgetList.WIDGET_CASCADER.code"
            v-model="renderValue"
            v-bind="renderComponentAttributes"
            v-on="getWidgetComponentEvents(widgetData, formData, widgetFormData)"
        />
        <el-date-picker
            v-else-if="widgetData.code === widgetList.WIDGET_DATE_PICKER.code"
            v-model="renderValue"
            v-bind="renderComponentAttributes"
            v-on="getWidgetComponentEvents(widgetData, formData, widgetFormData)"
        />
        <el-time-picker
            v-else-if="widgetData.code === widgetList.WIDGET_TIME_PICKER.code"
            v-model="renderValue"
            v-bind="renderComponentAttributes"
            v-on="getWidgetComponentEvents(widgetData, formData, widgetFormData)"
        />
        <el-time-select
            v-else-if="widgetData.code === widgetList.WIDGET_TIME_SELECT.code"
            v-model="renderValue"
            v-bind="renderComponentAttributes"
            v-on="getWidgetComponentEvents(widgetData, formData, widgetFormData)"
        />
        <el-switch
            v-else-if="widgetData.code === widgetList.WIDGET_SWITCH.code"
            v-model="renderValue"
            v-bind="renderComponentAttributes"
            v-on="getWidgetComponentEvents(widgetData, formData, widgetFormData)"
        />
        <el-rate
            v-else-if="widgetData.code === widgetList.WIDGET_RATE.code"
            v-model="renderValue"
            v-bind="renderComponentAttributes"
            v-on="getWidgetComponentEvents(widgetData, formData, widgetFormData)"
        />
        <el-color-picker
            v-else-if="widgetData.code === widgetList.WIDGET_COLOR_PICKER.code"
            v-model="renderValue"
            v-bind="renderComponentAttributes"
            v-on="getWidgetComponentEvents(widgetData, formData, widgetFormData)"
        />
        <el-slider
            v-else-if="widgetData.code === widgetList.WIDGET_SLIDER.code"
            v-model="renderValue"
            v-bind="renderComponentAttributes"
            v-on="getWidgetComponentEvents(widgetData, formData, widgetFormData)"
        />
        <el-upload
            v-else-if="widgetData.code === widgetList.WIDGET_UPLOAD.code"
            v-model:file-list="renderValue"
            v-bind="renderComponentAttributes"
            v-on="getWidgetComponentEvents(widgetData, formData, widgetFormData)"
        >
            <el-button type="primary">点击上传</el-button>
        </el-upload>
    </el-form-item>
</template>
<script setup lang="ts">
import { computed, type PropType } from "vue";
import { type WidgetFormData, type WidgetNormalData } from "@/views/composables/types";
import { useFormItemRules } from "@/views/composables/widgets/form";
import { getWidgetComponentEvents, getWidgetList } from "@/views/composables/widget-registry";
import { sanitizeHtmlForRendering } from "@/views/composables/html-safety";

const props = defineProps({
    widgetData: {
        type: Object as PropType<WidgetNormalData>,
        required: true
    },
    formData: {
        type: Object as PropType<Record<string, any>>,
        required: true
    },
    widgetFormData: {
        type: Object as PropType<WidgetFormData>,
        required: true
    }
});

const renderValue = defineModel<any>({
    required: true
});

/**
 * @description 当前 Widget 已物化的组件运行属性。
 * @remarks 统一为渲染层的宽属性视图，避免 Vue TS Plugin 将 Widget 联合类型中的不同 Props 直接传给单个 Element Plus 组件；这里仅保留原缓存引用，不负责构建或写回属性。
 */
const renderComponentAttributes = computed<Record<string, any>>(() => props.widgetData.componentAttributes ?? {});

/**
 * @description HTML Widget 的安全渲染内容。
 * @remarks 原始设置文本继续用于编辑和文档往返；安全检查失败时返回空内容，绝不回退原文。
 */
const htmlDefaultValue = computed(() => {
    const settingData = (props.widgetData.settingData || {}) as Record<string, unknown>;
    return typeof settingData.defaultValue === "string" ? sanitizeHtmlForRendering(settingData.defaultValue) : "";
});

// 表单组件验证规则配置
const formItemRuleConfig = computed(() => {
    const settingData = (props.widgetData.settingData || {}) as Record<string, unknown>;
    const componentFunctions = (props.widgetData.componentFunctions || {}) as Record<string, unknown>;
    return {
        required: Boolean(settingData.required),
        requiredMessage: typeof settingData.requiredMessage === "string" ? settingData.requiredMessage : null,
        regExp: typeof settingData.regExp === "string" ? settingData.regExp : null,
        regExpMessage: typeof settingData.regExpMessage === "string" ? settingData.regExpMessage : null,
        validate: typeof componentFunctions.validate === "string" ? componentFunctions.validate : null
    };
});

// 组件列表
const widgetList = getWidgetList();
</script>
<style lang="scss" scoped>
.html-contents,
.alert-box,
.divider-box {
    min-width: 0;
    padding: 8px 0;
}

.html-contents {
    overflow-wrap: anywhere;
    font-size: 14px;
}
</style>
