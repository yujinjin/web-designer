<template>
    <div class="preview-widget-boundary">
        <div v-if="errorMessage" class="preview-widget-error" role="alert">组件预览失败（{{ widgetCode }}）</div>
        <slot v-else />
    </div>
</template>

<script setup lang="ts">
/**
 * @fileoverview 隔离单个预览 Widget 的同步渲染和交互异常，避免错误扩散到设计器主体。
 * @remarks 每个节点拥有独立边界，异常后该子树改为占位；关闭预览会销毁错误状态，下次打开重新运行。异步未被组件捕获的拒绝不在此钩子的保证范围内。
 */
import { onErrorCaptured, ref } from "vue";

// 只接收定位信息，不持有表单值或动态脚本，限制错误日志的数据范围。
const props = defineProps<{
    /** 当前 Widget 实例标识，仅用于安全日志定位。 */
    widgetId: string;
    /** 当前 Widget 类型标识，用于错误占位和安全日志。 */
    widgetCode: string;
}>();

// 当前子树捕获到的错误类型；不保存脚本正文或字段值。
const errorMessage = ref("");

/**
 * @description 捕获后代组件同步异常并阻止其继续传播到设计器根页面。
 * @remarks 日志只包含 Widget 身份和错误类型，避免输出动态脚本或表单值。
 */
onErrorCaptured(error => {
    errorMessage.value = error instanceof Error ? error.name : "UnknownError";
    console.error("表单预览组件运行失败", { widgetId: props.widgetId, widgetCode: props.widgetCode, errorType: errorMessage.value });
    return false;
});
</script>

<style scoped lang="scss">
.preview-widget-boundary {
    min-width: 0;
}

.preview-widget-error {
    min-height: 48px;
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border: 1px solid var(--el-color-danger-light-7);
    border-radius: 2px;
    background-color: var(--el-color-danger-light-9);
    color: var(--el-color-danger);
    font-size: 13px;
}
</style>
