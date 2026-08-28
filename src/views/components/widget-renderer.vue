<template>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-if="widgetData.code === widgetList.WIDGET_HTML.code" class="html-contents" v-html="htmlDefaultValue"></div>
    <div v-else-if="widgetData.code === widgetList.WIDGET_ALERT.code" class="alert-box">
        <el-alert v-bind="getWidgetComponentAttributes(widgetData, renderValue)" />
    </div>
    <div v-else-if="widgetData.code === widgetList.WIDGET_DIVIDER.code" class="divider-box">
        <el-divider v-bind="getWidgetComponentAttributes(widgetData, renderValue)">
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
            v-bind="getWidgetComponentAttributes(widgetData, renderValue)"
            v-on="getWidgetComponentEvents(widgetData, formData, widgetFormData)"
        />
        <el-input-number
            v-else-if="widgetData.code === widgetList.WIDGET_INPUT_NUMBER.code"
            v-model="renderValue"
            v-bind="getWidgetComponentAttributes(widgetData, renderValue)"
            v-on="getWidgetComponentEvents(widgetData, formData, widgetFormData)"
        />
        <el-radio-group
            v-else-if="widgetData.code === widgetList.WIDGET_RADIO_GROUP.code"
            v-model="renderValue"
            v-bind="getWidgetComponentAttributes(widgetData, renderValue)"
            v-on="getWidgetComponentEvents(widgetData, formData, widgetFormData)"
        />
        <el-checkbox-group
            v-else-if="widgetData.code === widgetList.WIDGET_CHECKBOX_GROUP.code"
            v-model="renderValue"
            v-bind="getWidgetComponentAttributes(widgetData, renderValue)"
            v-on="getWidgetComponentEvents(widgetData, formData, widgetFormData)"
        />
        <el-select
            v-else-if="widgetData.code === widgetList.WIDGET_SELECT.code"
            v-model="renderValue"
            v-bind="getWidgetComponentAttributes(widgetData, renderValue)"
            v-on="getWidgetComponentEvents(widgetData, formData, widgetFormData)"
        />
        <el-cascader
            v-else-if="widgetData.code === widgetList.WIDGET_CASCADER.code"
            v-model="renderValue"
            v-bind="getWidgetComponentAttributes(widgetData, renderValue)"
            v-on="getWidgetComponentEvents(widgetData, formData, widgetFormData)"
        />
        <el-date-picker
            v-else-if="widgetData.code === widgetList.WIDGET_DATE_PICKER.code"
            v-model="renderValue"
            v-bind="getWidgetComponentAttributes(widgetData, renderValue)"
            v-on="getWidgetComponentEvents(widgetData, formData, widgetFormData)"
        />
        <el-time-picker v-else-if="widgetData.code === widgetList.WIDGET_TIME_PICKER.code" v-model="renderValue" v-bind="getWidgetComponentAttributes(widgetData, renderValue)" />
        <el-time-select
            v-else-if="widgetData.code === widgetList.WIDGET_TIME_SELECT.code"
            v-model="renderValue"
            v-bind="getWidgetComponentAttributes(widgetData, renderValue)"
            v-on="getWidgetComponentEvents(widgetData, formData, widgetFormData)"
        />
        <el-switch
            v-else-if="widgetData.code === widgetList.WIDGET_SWITCH.code"
            v-model="renderValue"
            v-bind="getWidgetComponentAttributes(widgetData, renderValue)"
            v-on="getWidgetComponentEvents(widgetData, formData, widgetFormData)"
        />
        <el-rate
            v-else-if="widgetData.code === widgetList.WIDGET_RATE.code"
            v-model="renderValue"
            v-bind="getWidgetComponentAttributes(widgetData, renderValue)"
            v-on="getWidgetComponentEvents(widgetData, formData, widgetFormData)"
        />
        <el-color-picker
            v-else-if="widgetData.code === widgetList.WIDGET_COLOR_PICKER.code"
            v-model="renderValue"
            v-bind="getWidgetComponentAttributes(widgetData, renderValue)"
            v-on="getWidgetComponentEvents(widgetData, formData, widgetFormData)"
        />
        <el-slider
            v-else-if="widgetData.code === widgetList.WIDGET_SLIDER.code"
            v-model="renderValue"
            v-bind="getWidgetComponentAttributes(widgetData, renderValue)"
            v-on="getWidgetComponentEvents(widgetData, formData, widgetFormData)"
        />
        <el-upload
            v-else-if="widgetData.code === widgetList.WIDGET_UPLOAD.code"
            v-model:file-list="renderValue"
            v-bind="getWidgetComponentAttributes(widgetData, renderValue)"
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
import { getWidgetComponentAttributes, getWidgetComponentEvents, getWidgetList } from "@/views/composables/widget-registry";

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
const htmlDefaultValue = computed(() => {
    const settingData = (props.widgetData.settingData || {}) as Record<string, unknown>;
    return typeof settingData.defaultValue === "string" ? settingData.defaultValue : "";
});
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
