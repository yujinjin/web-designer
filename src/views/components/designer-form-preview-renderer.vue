<template>
    <div class="preview-form-renderer">
        <div v-if="initializing" class="preview-form-state">正在初始化表单...</div>
        <div v-else-if="initError" class="preview-form-state preview-form-state--error" role="alert">表单初始化失败：{{ initError }}</div>
        <el-empty v-else-if="previewWidgetFormData.widgets.length === 0" description="暂无表单组件" :image-size="88" />
        <el-form v-else :model="formData" v-bind="previewWidgetFormData.formAttributes" class="preview-form">
            <template v-for="item in previewWidgetFormData.widgets" :key="item.id">
                <designer-form-preview-error-boundary v-show="item.isShow" :widget-id="item.id" :widget-code="item.code" class="preview-form__item">
                    <designer-form-preview-row
                        v-if="item.code === widgetList.WIDGET_ROW_CONTAINER.code"
                        :widget-data="asRowContainer(item)"
                        :form-data="formData"
                        :widget-form-data="previewWidgetFormData"
                        @field-value-change="handleFieldValueChange"
                    />
                    <widget-renderer v-else v-model="formData[item.id]" :widget-data="asNormalWidget(item)" :form-data="formData" :widget-form-data="previewWidgetFormData" />
                </designer-form-preview-error-boundary>
            </template>
        </el-form>
    </div>
</template>

<script setup lang="ts">
/**
 * @fileoverview 承载独立响应式快照、字段运行值和 onInit 生命周期的纯表单预览层。
 */
import { onBeforeUnmount, onMounted, reactive, ref, type PropType } from "vue";
import widgetRenderer from "./widget-renderer.vue";
import designerFormPreviewRow from "./designer-form-preview-row.vue";
import designerFormPreviewErrorBoundary from "./designer-form-preview-error-boundary.vue";
import { type WidgetFormData, type WidgetNormalData, type WidgetRowContainerData } from "@/views/composables/types";
import { useFormRenderData } from "@/views/composables/widgets/form";
import { getWidgetList } from "@/views/composables/widget-registry";
import { runDesignerFormPreviewInit } from "@/views/composables/designer-form-preview";

const props = defineProps({
    widgetFormData: { type: Object as PropType<WidgetFormData>, required: true }
});

/**
 * @description 预览快照的可变深层响应式代理。
 * @remarks 此处不会再次复制数据；父级传入值已经是独立快照，reactive 只负责让 onInit 和组件事件对嵌套状态的修改驱动预览更新。
 */
const previewWidgetFormData = reactive(props.widgetFormData) as WidgetFormData;
/** 预览专属字段值，关闭组件后随作用域一起销毁。 */
const formData = useFormRenderData(previewWidgetFormData);
// 表单初始化完成前隐藏实际内容。
const initializing = ref(true);
// onInit 失败时展示的安全错误摘要。
const initError = ref("");

const widgetList = getWidgetList();

/**
 * @description 将联合类型节点断言为行容器数据，供模板分支安全传递给行容器预览组件。
 * @param item 表单顶层组件联合类型节点。
 * @returns 同一引用，类型收窄为行容器数据。
 */
const asRowContainer = function (item: WidgetFormData["widgets"][number]): WidgetRowContainerData {
    return item as WidgetRowContainerData;
};

/**
 * @description 将联合类型节点断言为普通组件数据，供模板分支安全传递给通用渲染组件。
 * @param item 表单顶层组件联合类型节点。
 * @returns 同一引用，类型收窄为普通组件数据。
 */
const asNormalWidget = function (item: WidgetFormData["widgets"][number]): WidgetNormalData {
    return item as WidgetNormalData;
};

/**
 * @description 更新预览行容器中的字段运行值。
 * @param id 子组件实例标识。
 * @param value 子组件最新值。
 * @returns 无返回值；只修改当前预览 formData。
 */
const handleFieldValueChange = function (id: string, value: any): void {
    formData[id] = value;
};

// 避免 Dialog 关闭后异步初始化继续写入已卸载组件状态。
let active = true;

/**
 * @description 在独立预览上下文中执行并等待表单初始化。
 * @returns 初始化完成后无返回值。
 */
const initializePreview = async function (): Promise<void> {
    try {
        await runDesignerFormPreviewInit(previewWidgetFormData, formData);
    } catch (error) {
        if (active) initError.value = error instanceof Error ? error.message : "未知错误";
    } finally {
        if (active) initializing.value = false;
    }
};

onMounted(() => void initializePreview());
onBeforeUnmount(() => {
    active = false;
});
</script>

<style scoped lang="scss">
.preview-form-renderer {
    min-height: 240px;
}

.preview-form__item {
    display: block;

    + .preview-form__item {
        margin-top: 16px;
    }
}

.preview-form-state {
    min-height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--el-text-color-secondary);
}

.preview-form-state--error {
    color: var(--el-color-danger);
}
</style>
