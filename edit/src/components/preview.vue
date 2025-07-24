<!--
 * @创建者: yujinjin9@126.com
 * @创建时间: 2022-09-02 09:58:20
 * @最后修改作者: yujinjin9@126.com
 * @最后修改时间: 2024-04-24 14:25:42
 * @项目的路径: \web-designer\edit\src\components\preview.vue
 * @描述: 页面预览
-->
<template>
    <div class="preview-wrapper">
        <div class="navbar-header">
            <el-button type="primary" link :icon="RefreshLeft">重置</el-button>
            <el-button type="primary" link :icon="View">预览</el-button>
            <el-button type="primary" link :icon="Finished">保存</el-button>
            <el-button type="primary" link :icon="SetUp">页面属性</el-button>
        </div>
        <div class="preview-container" ref="previewRef"></div>
    </div>
</template>
<script setup lang="ts">
import { RefreshLeft, View, Finished, SetUp } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { loadMicroApp, initGlobalState, MicroApp } from "qiankun";
import { onMounted, onUnmounted, ref, defineProps, defineEmits, inject } from "vue";
import type { Ref, PropType } from "vue";
import Sortable from "sortablejs";
import { Widget } from "/#/widget";
import { randomId } from "@/utils/generate";
// import { useStore } from "vuex";

// vuex
// const store = useStore();

const props = defineProps({
    // 选中的组件实例数据
    selectedComponent: {
        type: Object as PropType<Widget.ComponentInstance | null>,
        default: null
    },

    // 模板编辑表单字段验证
    validate: {
        type: Function,
        required: true
    }
});

const emits = defineEmits(["update:selectedComponent"]);

// 当前页面组件列表数据
const pageComponentList: Ref<Array<Widget.ComponentInstance>> = ref([]);

// 当前组件克隆的数据
const widgetCloneData: Ref<Record<string, any> | null> | undefined = inject("widgetCloneData");

// 预览
const previewRef: Ref<HTMLDivElement | null> = ref(null);

// 预览微应用
const previewMicroApp: Ref<MicroApp | null> = ref(null);

// Sortable 实例
const sortableInstance: Ref<any> = ref(null);

const validateForm = async function (actionType: "add" | "change" = "add", isShowError: Boolean = true) {
    try {
        await props.validate();
    } catch (e) {
        logs.error(e);
        const message = "当前表单未验证通过，不能" + (actionType === "add" ? "新增" : "切换");
        if (isShowError) {
            ElMessage({
                message,
                type: "warning"
            });
        }
        throw new Error(message);
    }
};

const initDrag = function (dragContainer: HTMLElement) {
    sortableInstance.value = new Sortable(dragContainer, {
        group: { name: "widget", put: true },
        animation: 300,
        draggable: ".widget-item",
        onAdd: async function (e: any) {
            await validateForm();
            if (widgetCloneData && widgetCloneData.value) {
                const selectedComponentInstanceData: Widget.ComponentInstance = {
                    id: randomId(),
                    code: widgetCloneData.value.code,
                    name: widgetCloneData.value.name,
                    previewComponentName: widgetCloneData.value.previewComponentName,
                    caseCode: widgetCloneData.value.caseData.code,
                    caseName: widgetCloneData.value.caseData.name,
                    caseDiagram: widgetCloneData.value.caseData.diagram,
                    data: widgetCloneData.value.caseData.data
                };
                e.clone.dataset.id = selectedComponentInstanceData.id;
                pageComponentList.value.splice(e.newIndex, 0, selectedComponentInstanceData);
                methods.insert(e.newIndex, selectedComponentInstanceData);
                emits("update:selectedComponent", selectedComponentInstanceData);
            }
            console.info("onAdd", e.newIndex, e.clone.dataset);
        },
        onSort: function (e: any) {
            if (!e.clone.dataset.id) {
                return;
            }
            methods.drag(e.oldIndex, e.newIndex);
            console.info("onSort", e.clone.dataset.id, e.oldIndex, e.newIndex, sortableInstance.value!.toArray());
        }
        // onStart: function (e: Event) {
        //     console.info("onStart", e);
        // },
        // onEnd: function (e: Event) {
        //     console.info("onEnd", e);
        // }
    });
};

const events = {
    /** 初始化组件，让其可以拖拽（主应用实现，子应用调用-1） */
    async onInit(dragContainer: HTMLElement) {
        await methods.init(pageComponentList.value);
        initDrag(dragContainer);
    },

    /** 当前选中的组件索引变化（主应用实现，子应用调用） */
    async onChangeSelectedIndex(index: number) {
        console.info("onChangeSelectedIndex", index, pageComponentList.value[index]);
        await validateForm();
        emits("update:selectedComponent", pageComponentList.value[index]);
    },

    /** 删除（主应用实现，子应用调用） */
    onDelete(index: number, selectedIndex: number) {
        console.info("onDelete", index);
        pageComponentList.value.splice(index, 1);
        if (selectedIndex === -1) {
            emits("update:selectedComponent", null);
        } else {
            emits("update:selectedComponent", pageComponentList.value[selectedIndex]);
        }
    }
};

const methods = {
    /** 初始化页面数据（子应用实现，主应用调用-0） */
    async init(dataList: Record<string, any>[]): Promise<void> {
        // TODO: 子应用实现
        logs.debug(config.appName, dataList);
    },

    /** 新增操作（子应用实现，主应用调用） */
    async insert(index: number, componentData: Record<string, any>): Promise<void> {
        // TODO: 子应用实现
        logs.debug(index, componentData);
    },

    /** 拖拽排序（子应用实现，主应用调用） */
    async drag(oldIndex: number, newIndex: number): Promise<void> {
        console.info("-----------------", oldIndex, newIndex);
    },

    /** 修改组件属性值（子应用实现，主应用调用） */
    async updateComponentProperty(key: string, value: any): Promise<void> {
        // TODO: 子应用实现
        logs.debug(key, value);
    }
};

onMounted(() => {
    previewMicroApp.value = loadMicroApp({
        name: "preview",
        entry: "http://localhost:8082/index.html",
        container: previewRef.value!,
        props: { events, methods }
    });

    const { onGlobalStateChange } = initGlobalState({ events, methods });
    onGlobalStateChange(state => {
        Object.assign(methods, state.methods);
    });
});

onUnmounted(() => {
    previewMicroApp.value!.unmount();
});
</script>
<style lang="less" scoped>
.preview-wrapper {
    min-width: 400px;
    width: 650px;
    padding-top: 80px;
    position: relative;
    border-left: 1px solid #e0e0e0;
    border-right: 1px solid #e0e0e0;

    .navbar-header {
        position: absolute;
        left: 0px;
        right: 0px;
        top: 0px;
        height: 50px;
        text-align: right;
        padding: 15px;
        border-bottom: 1px solid #e0e0e0;

        .el-button {
            margin-left: 10px;
        }
    }

    .preview-container {
        width: 400px;
        margin: 0 auto;
    }
}
</style>
