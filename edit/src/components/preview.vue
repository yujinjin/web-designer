<template>
    <div class="preview-container" ref="previewRef"></div>
</template>
<script setup lang="ts">
import { loadMicroApp, initGlobalState, MicroApp } from "qiankun";
import { onMounted, onUnmounted, ref, watch, defineProps } from "vue";
import type { Ref } from "vue";
// import { useStore } from "vuex";

// vuex
// const store = useStore();

const props = defineProps({
    // 页面数据
    pageData: {
        type: Object
    }
});

// 预览
const previewRef: Ref<HTMLDivElement | null> = ref(null);

// 预览微应用
const previewMicroApp: Ref<MicroApp | null> = ref(null);

const events = {
    /** 当前选中的组件索引变化（主应用实现） */
    onChangeSelectedIndex(index: number) {
        console.info("-----------------", index);
    },
    /** 拖拽排序（主应用实现） */
    onDrag(oldIndex: number, newIndex: number) {
        console.info("-----------------", oldIndex, newIndex);
    },
    /** 新增之后（主应用实现） */
    onInsertAfter(index: number, componentData: Record<string, any>) {
        console.info("-----------------", index, componentData);
    },
    /** 删除（主应用实现） */
    onDelete(index: number) {
        console.info("-----------------", index);
    }
};

const methods = {
    /** 初始化页面数据（子应用实现） */
    init(dataList: Record<string, any>[]) {
        // TODO: 子应用实现
        logs.debug(dataList);
    },

    /** 新增之前（子应用实现） */
    insert(componentData: Record<string, any>) {
        // TODO: 子应用实现
        logs.debug(componentData);
    },

    /** 修改组件属性值（子应用实现） */
    updateComponentProperty(key: string, value: any) {
        // TODO: 子应用实现
        logs.debug(key, value);
    }
};

onMounted(() => {
    previewMicroApp.value = loadMicroApp({
        name: "preview",
        entry: "http://10.96.140.234:8082/index.html",
        container: previewRef.value!,
        props: { events, methods }
    });

    const { onGlobalStateChange } = initGlobalState({ events, methods });
    onGlobalStateChange(state => {
        console.info("..............onGlobalStateChange");
        Object.assign(methods, state.methods);
    });
});

watch(
    () => props.pageData,
    () => {}
);

onUnmounted(() => {
    previewMicroApp.value!.unmount();
});
</script>
<style lang="less" scoped>
.preview-container {
}
</style>
