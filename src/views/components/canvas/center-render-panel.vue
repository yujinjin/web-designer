<template>
    <div class="center-render-panel">
        <div class="tool-bar">
            <div class="tool-group">
                <el-button :icon="DocumentChecked" text @click="emit('saveLocalDraft')">保存到本地</el-button>
                <el-button :icon="View" text @click="emit('preview')">预览</el-button>
                <el-button :icon="Upload" text @click="handleSelectImportFile">导入JSON</el-button>
                <el-button :icon="Download" text @click="emit('exportJson')">导出JSON</el-button>
                <input ref="jsonFileInputRef" class="json-file-input" type="file" accept=".json,application/json" @change="handleImportFileChange" />
            </div>
            <div class="tool-group tool-group--danger">
                <el-button :icon="Delete" type="danger" text @click="handleClearWidgets">清空</el-button>
            </div>
        </div>
        <div class="render-panel">
            <el-form :model="formData" v-bind="widgetFormData!.formAttributes">
                <div class="drop-surface">
                    <el-row ref="dropContainerRef" class="drop-container">
                        <el-col
                            v-for="(item, index) in widgetFormData!.widgets"
                            :key="item.id"
                            :span="24"
                            class="drag-item"
                            :class="{
                                'selected': item.id === selectedWigetId,
                                'operation-active': item.id === activeOperationWidgetId,
                                'row-container-item': item.code === widgetList.WIDGET_ROW_CONTAINER.code
                            }"
                            tabindex="0"
                            role="group"
                            :aria-label="item.name"
                            @click.stop="changeSelectedWidgetId?.(item.id)"
                            @mouseenter="setHoveredWidgetId(item.id)"
                            @mouseleave="clearHoveredWidgetId(item.id)"
                            @focusin="setFocusedWidgetId(item.id)"
                            @focusout="setFocusedWidgetId(null)"
                        >
                            <div class="widget-operation-bar">
                                <div class="widget-identity">
                                    <el-tooltip content="拖动排序" placement="top">
                                        <el-button class="widget-operation-button widget-drag-handle" text aria-label="拖动排序">
                                            <el-icon><Rank /></el-icon>
                                        </el-button>
                                    </el-tooltip>
                                    <el-tooltip :content="item.isShow ? '显示状态' : '隐藏状态'" placement="top">
                                        <span class="widget-status" role="status" :aria-label="item.isShow ? '显示状态' : '隐藏状态'">
                                            <el-icon v-if="item.isShow"><View /></el-icon>
                                            <el-icon v-else><Hide /></el-icon>
                                        </span>
                                    </el-tooltip>
                                    <span class="widget-operation-name">{{ item.name }}</span>
                                </div>
                                <div class="widget-actions">
                                    <el-tooltip content="复制组件" placement="top">
                                        <el-button class="widget-operation-button" text aria-label="复制组件" @click.stop="copyWidgetData?.(index + 1, index)">
                                            <el-icon><CopyDocument /></el-icon>
                                        </el-button>
                                    </el-tooltip>
                                    <el-tooltip v-if="index > 0" content="上移" placement="top">
                                        <el-button class="widget-operation-button" text aria-label="上移" @click.stop="updateWidgetOrder?.(index, index - 1)">
                                            <el-icon><Top /></el-icon>
                                        </el-button>
                                    </el-tooltip>
                                    <el-tooltip v-if="index < widgetFormData!.widgets.length - 1" content="下移" placement="top">
                                        <el-button class="widget-operation-button" text aria-label="下移" @click.stop="updateWidgetOrder?.(index, index + 1)">
                                            <el-icon><Bottom /></el-icon>
                                        </el-button>
                                    </el-tooltip>
                                    <el-tooltip content="删除组件" placement="top">
                                        <el-button class="widget-operation-button" type="danger" text aria-label="删除组件" @click.stop="deleteWidget?.(item.id)">
                                            <el-icon><Delete /></el-icon>
                                        </el-button>
                                    </el-tooltip>
                                </div>
                            </div>
                            <row-container-renderer
                                v-if="item.code === widgetList.WIDGET_ROW_CONTAINER.code"
                                :widget-data="item as WidgetRowContainerData"
                                :form-data="formData"
                                :widget-form-data="widgetFormData!"
                                :active-operation-widget-id="activeOperationWidgetId"
                                @field-value-change="handleFieldValueChange"
                                @operation-pointer-change="setHoveredWidgetId"
                                @operation-focus-change="setFocusedWidgetId"
                            />
                            <div v-else class="widget-preview-content">
                                <widget-renderer v-model="formData[item.id]" :widget-data="item as WidgetNormalData" :form-data="formData" :widget-form-data="widgetFormData!" />
                            </div>
                        </el-col>
                    </el-row>
                    <div v-if="widgetFormData!.widgets.length === 0" class="empty-tip">
                        <el-icon class="empty-tip__icon"><Plus /></el-icon>
                        <span class="empty-tip__title">暂无表单组件</span>
                        <span class="empty-tip__description">从左侧组件库或模板库拖入内容</span>
                    </div>
                </div>
            </el-form>
        </div>
    </div>
</template>
<script setup lang="ts">
/**
 * @fileoverview 组织设计画布、顶层组件工具条与 JSON/预览操作入口。
 * @remarks 配置树与组件操作由根页面注入；本层拥有字段运行值和 Sortable 实例，文件业务通过事件交给根页面编排。
 */
import { type Ref, inject, onMounted, shallowRef, onUnmounted, ref } from "vue";
import { View, Upload, Download, Delete, Rank, Top, Bottom, Hide, CopyDocument, Plus, DocumentChecked } from "@element-plus/icons-vue";
import { ElMessage, type RowInstance } from "element-plus";
import Sortable from "sortablejs";
import rowContainerRenderer from "@/views/components/canvas/row-container-renderer.vue";
import widgetRenderer from "@/views/components/rendering/widget-renderer.vue";
import { type WidgetFormData, type WidgetNormalData, type WidgetRowContainerData } from "@/views/types";
import { useFormRenderData } from "@/views/composables/use-form-render-data";
import { getWidgetList } from "@/views/domain/widgets/registry";
import { useWidgetOperationTarget } from "@/views/composables/use-widget-operation-target";
import { createDesignerRootTargetGroup, DESIGNER_ROOT_DRAGGABLE_SELECTOR } from "@/views/utils/drag-drop-config";
import { type FormTemplateResult } from "@/views/domain/templates/types";

/**
 * @description 向根页面请求文档与预览操作，画布自身不校验或保存 JSON。
 */
const emit = defineEmits<{
    /** 请求清空当前设计，确认提示由根页面负责。 */
    clearWidgets: [];
    /** 请求将当前配置保存为本地草稿。 */
    saveLocalDraft: [];
    /** 请求创建独立快照并打开预览。 */
    preview: [];
    /** 传递用户选择的文件，由文档操作层校验并确认导入。 */
    importJson: [file: File];
    /** 请求序列化当前配置并下载 JSON。 */
    exportJson: [];
}>();

// 隐藏的 JSON 单文件选择器；每次处理后会重置 value，使同一文件可再次选择。
const jsonFileInputRef = ref<HTMLInputElement>();

// 根页面拥有的响应式配置树；画布不替换该对象。
const widgetFormData = inject<WidgetFormData>("widgetFormData");

// 获取注入的选中的组件id
const selectedWigetId = inject<Ref<string | null>>("selectedWigetId");

// 获取注入的改变选中的组件id的函数
const changeSelectedWidgetId = inject<(id: string | null) => void>("changeSelectedWidgetId");

// 获取注入的插入组件的函数
const insertWidgetDefaultData = inject<(code: string, newIndex: number, parentWidgetId?: string) => void>("insertWidgetDefaultData");

// 获取注入的模板区块原子插入函数。
const insertWidgetTemplate = inject<(templateId: string, newIndex: number) => FormTemplateResult>("insertWidgetTemplate");

// 获取注入的更新组件的顺序的函数
const updateWidgetOrder = inject<(oldIndex: number, newIndex: number, parentWidgetId?: string) => void>("updateWidgetOrder");

// 获取注入的复制组件的函数
const copyWidgetData = inject<(newIndex: number, copyIndex: number) => void>("copyWidgetData");

// 获取注入的删除组件的函数
const deleteWidget = inject<(id: string) => void>("deleteWidget");

/**
 * @description 与当前配置树同步的字段运行值，按组件 ID 索引。
 * @remarks 与 defaultValue 分离，控件输入不直接改写默认配置；行容器子项与顶层字段共用这一个值对象。
 */
const formData = useFormRenderData(widgetFormData!);

// ElRow 挂载后提供 Sortable 所需的真实 DOM 容器。
const dropContainerRef = ref<RowInstance>();

// 外部插件实例仅追踪引用，避免深层代理第三方内部状态。
const sortableInstance = shallowRef<Sortable | null>(null);

// 用稳定注册标识区分行容器与普通组件。
const widgetList = getWidgetList();

// 画布同一时刻只展示一个节点的工具条，嵌套子字段激活时会覆盖父行容器。
const { activeOperationWidgetId, setHoveredWidgetId, clearHoveredWidgetId, setFocusedWidgetId } = useWidgetOperationTarget(selectedWigetId);

/**
 * @description 请求根页面执行清空确认及配置清理。
 * @returns 无返回值；通过事件通知调用方。
 */
const handleClearWidgets = function () {
    emit("clearWidgets");
};

/**
 * @description 打开 JSON 文件选择器。
 * @returns 无返回值。
 */
const handleSelectImportFile = function (): void {
    jsonFileInputRef.value?.click();
};

/**
 * @description 把用户选择的单个 JSON 文件交给根页面编排导入。
 * @param event 原生文件输入 change 事件。
 * @returns 无返回值；没有选择文件时静默返回。
 * @remarks 发出事件后立即清空 input value，允许用户连续选择同一文件重新导入。
 */
const handleImportFileChange = function (event: Event): void {
    // 只接收第一个文件，批量导入不属于当前入口的协议。
    const input = event.target as HTMLInputElement;
    // 用户取消选择时不发出导入请求。
    const file = input.files?.[0];
    if (file) emit("importJson", file);
    input.value = "";
};

/**
 * @description 将行容器子字段的双向绑定更新写入画布统一运行值。
 * @param id 子组件实例 ID，而非业务 propName。
 * @param value 控件原生值，允许数组等非标量类型。
 * @returns 无返回值；原地更新当前 formData。
 */
const handleFieldValueChange = function (id: string, value: any) {
    formData[id] = value;
};

/**
 * @description 在顶层 ElRow DOM 就绪后挂载拖拽与排序监听。
 * @remarks 空状态提示位于拖拽容器之外，不参与 Sortable 索引；仅拖动专属手柄，避免编辑表单控件时误触排序。
 */
onMounted(() => {
    if (dropContainerRef.value) {
        sortableInstance.value = new Sortable(dropContainerRef.value.$el, {
            animation: 150,
            group: createDesignerRootTargetGroup(),
            sort: true,
            draggable: DESIGNER_ROOT_DRAGGABLE_SELECTOR,
            dragoverBubble: false,
            ghostClass: "designer-drop-indicator",
            handle: ".widget-drag-handle",
            /**
             * @description 接收组件或模板来源的克隆，并转为 Vue 配置节点。
             * @param evt Sortable 添加事件，索引可能因取消拖放而缺失。
             * @returns 无返回值；模板插入失败时展示错误提示。
             * @remarks 必须先移除第三方插入的临时 DOM，再让管理器更新数组，避免 Vue 与克隆节点重复展示。
             */
            onAdd: (evt: Sortable.SortableEvent) => {
                // 两种来源通过不同 data 属性识别，模板具有完整区块插入语义。
                const templateId = evt.item?.getAttribute("data-template-id");
                const widgetType = evt.item?.getAttribute("data-widget-type");
                evt.item?.remove();
                if (evt.newIndex === undefined) {
                    return;
                }
                if (templateId) {
                    // 工厂和校验由注入管理器完成，失败时不部分插入模板。
                    const result = insertWidgetTemplate?.(templateId, evt.newIndex);
                    if (result && !result.ok) ElMessage.error(result.message);
                    return;
                }
                if (!widgetType) return;
                insertWidgetDefaultData?.(widgetType, evt.newIndex);
            },
            /**
             * @description 将当前顶层容器内部的 DOM 排序写回配置数组。
             * @param evt Sortable 结束事件，包含来源、目标及变更前后索引。
             * @returns 无返回值；跨容器来源添加由 onAdd 处理。
             */
            onEnd: (evt: Sortable.SortableEvent) => {
                if (evt.from !== evt.to || evt.oldIndex === undefined || evt.newIndex === undefined) {
                    return;
                }
                updateWidgetOrder?.(evt.oldIndex, evt.newIndex);
            }
        });
    }
});

/**
 * @description 销毁顶层拖拽实例并释放它绑定的 DOM 监听。
 * @remarks 画布卸载后不得保留插件引用或继续操作旧容器。
 */
onUnmounted(() => {
    sortableInstance.value?.destroy();
});
</script>
<style lang="scss" scoped>
.center-render-panel {
    height: 100%;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    flex: 1;

    .tool-bar {
        height: calc(var(--el-tabs-header-height, 40px) + 1px);
        flex: 0 0 calc(var(--el-tabs-header-height, 40px) + 1px);
        position: relative;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding: 0 12px;
        background-color: var(--el-bg-color);
        border-bottom: 1px solid var(--el-border-color-lighter);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

        .tool-group {
            display: flex;
            align-items: center;
            gap: 4px;

            .el-button {
                margin-left: 0;
            }
        }

        .tool-group--danger {
            margin-left: 8px;
            padding-left: 0;
            border-left: 0;
        }
    }

    .json-file-input {
        display: none;
    }

    .render-panel {
        flex: 1;
        min-height: 0;
        overflow: auto;
        padding: 16px;

        :deep(.el-form) {
            height: 100%;

            .drop-surface {
                height: 100%;
                min-height: 100%;
                position: relative;
                border-radius: 2px;
                transition:
                    background-color var(--el-transition-duration-fast),
                    box-shadow var(--el-transition-duration-fast);
            }

            .drop-container {
                min-height: 100%;
                align-content: flex-start;
                padding-top: 16px;
            }
        }

        .empty-tip {
            min-height: 240px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            position: absolute;
            inset: 0;
            border: 1px dashed var(--el-border-color-light);
            border-radius: 2px;
            background-color: var(--el-fill-color-extra-light);
            color: var(--el-text-color-secondary);
            pointer-events: none;

            .empty-tip__icon {
                width: 36px;
                height: 36px;
                border: 1px solid var(--el-border-color);
                border-radius: 50%;
                background-color: var(--el-bg-color);
                color: var(--el-color-primary);
                font-size: 18px;
            }

            .empty-tip__title {
                color: var(--el-text-color-regular);
                font-size: 14px;
                font-weight: 500;
            }

            .empty-tip__description {
                font-size: 12px;
            }
        }
    }
}
</style>
<style lang="scss" scoped>
.center-render-panel .render-panel .drop-container {
    .drag-item {
        position: relative;
        width: 100%;
        border: 1px solid transparent;
        border-radius: 2px;
        transition:
            border-color var(--el-transition-duration-fast),
            background-color var(--el-transition-duration-fast),
            box-shadow var(--el-transition-duration-fast);

        + .drag-item {
            margin-top: 16px;
        }

        .widget-preview-content {
            min-width: 0;
            padding: 8px 12px;

            :deep(.el-form-item) {
                margin-bottom: 8px;
            }
        }

        > .widget-operation-bar {
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            position: absolute;
            top: 0;
            right: 12px;
            left: auto;
            z-index: 5;
            max-width: calc(100% - 24px);
            padding: 0 4px;
            transform: translateY(-50%);
            border: 1px solid var(--el-border-color-light);
            border-radius: 2px;
            background-color: var(--el-bg-color);
            box-shadow: var(--el-box-shadow-lighter);
            color: var(--el-text-color-regular);
            visibility: hidden;
            opacity: 0;
            pointer-events: none;
            transition: opacity var(--el-transition-duration-fast);

            .widget-identity,
            .widget-actions {
                min-width: 0;
                display: flex;
                align-items: center;
            }

            .widget-identity {
                flex: 1;
            }

            .widget-actions {
                flex: none;
                gap: 2px;
            }

            .widget-operation-button,
            .widget-status {
                width: 28px;
                height: 28px;
                flex: 0 0 28px;
                margin: 0;
                padding: 0;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                pointer-events: auto;
            }

            .widget-status {
                color: var(--el-text-color-secondary);
            }

            .widget-drag-handle {
                cursor: grab;

                &:active {
                    cursor: grabbing;
                }
            }

            .widget-operation-name {
                min-width: 0;
                padding: 0 6px;
                overflow: hidden;
                color: var(--el-text-color-regular);
                font-size: 12px;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        &.operation-active {
            border-color: var(--el-border-color-lighter);
            background-color: var(--el-fill-color-extra-light);

            > .widget-operation-bar {
                visibility: visible;
                opacity: 1;
            }
        }

        &.selected {
            border-color: var(--el-color-primary-light-8);
            background-color: var(--el-color-primary-light-9);
            box-shadow: inset 3px 0 0 var(--el-color-primary);
        }

        &:focus-visible {
            outline: 2px solid var(--el-color-primary);
            outline-offset: -2px;
        }
    }

    .drag-item.operation-active,
    .drag-item:has(.row-container-child.operation-active) {
        z-index: 4;
    }
}
</style>
<style lang="scss">
.center-render-panel {
    .drop-surface:has(> .drop-container > .designer-drop-indicator) {
        background-color: var(--el-color-primary-light-9);
        box-shadow: inset 0 0 0 1px var(--el-color-primary-light-7);
    }

    .row-container-drop-area:has(> .row-container-grid > .designer-drop-indicator) {
        border-color: var(--el-color-primary-light-5);
        border-style: solid;
        background-color: var(--el-color-primary-light-9);
        box-shadow: inset 0 0 0 1px var(--el-color-primary-light-8);
    }

    .drop-container > .designer-drop-indicator,
    .row-container-grid > .designer-drop-indicator {
        position: relative;
        overflow: visible;
        border-color: transparent !important;
        background-color: var(--el-color-primary-light-9) !important;
        box-shadow: none !important;

        > * {
            opacity: 0.16;
        }

        &::before {
            content: "";
            position: absolute;
            top: -2px;
            right: 4px;
            left: 4px;
            z-index: 6;
            height: 3px;
            border-radius: 2px;
            background-color: var(--el-color-primary);
        }

        &::after {
            content: "";
            position: absolute;
            top: -5px;
            right: 0;
            left: 0;
            z-index: 7;
            height: 9px;
            background:
                radial-gradient(circle at 4px 50%, var(--el-bg-color) 0 2px, var(--el-color-primary) 2px 4px, transparent 4px),
                radial-gradient(circle at calc(100% - 4px) 50%, var(--el-bg-color) 0 2px, var(--el-color-primary) 2px 4px, transparent 4px);
            pointer-events: none;
        }
    }

    .drop-container > .widget-item.designer-drop-indicator,
    .drop-container > .template-item.designer-drop-indicator,
    .row-container-grid > .widget-item.designer-drop-indicator {
        width: 100%;
        max-width: 100%;
        flex: 0 0 100%;
    }
}
</style>
