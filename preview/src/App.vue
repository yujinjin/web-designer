<!--
 * @创建者: yujinjin9@126.com
 * @创建时间: 2022-07-21 21:47:28
 * @最后修改作者: yujinjin9@126.com
 * @最后修改时间: 2022-10-20 11:40:08
 * @项目的路径: \web-designer\preview\src\App.vue
 * @描述: 头部注释配置模板
-->
<template>
    <div class="widgets-preview-container" ref="widgetsPreviewContainerRef">
        <div v-for="(widgetItem, index) in widgetList" :key="widgetItem.id" :data-id="widgetItem.id" class="widget-item widget-preview-wrapper" :class="{ selected: selectedWidgetIndex === index }" @click="onChangeSelectedIndexHandle(index)">
            {{ widgetItem.name }} - {{ widgetItem.id }}
            <icon name="delete" @click="onDeleteHandle(index)" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { App } from "/#/app";
import { onMounted, onUnmounted, ref, nextTick, Ref, defineProps, PropType } from "vue";
import { Icon } from "vant";

const props = defineProps({
    qiankun: {
        type: Object as PropType<App.QiankunInput>,
        required: true
    }
});

const widgetsPreviewContainerRef: Ref<HTMLDivElement | null> = ref(null);

// 组件列表
const widgetList: Ref<Array<Record<string, any>>> = ref([]);

// 当前选中的组件索引
const selectedWidgetIndex = ref(0);

// 初始化组件列表数据
const initWidgetList = async function (dataList: Record<string, any>[]) {
    logs.debug(config.appName, "initWidgetList", dataList);
    widgetList.value = JSON.parse(JSON.stringify(dataList));
    await nextTick();
};

// 插入一个组件
const insertWidget = async function (index: number, componentData: Record<string, any>) {
    logs.debug(config.appName, "insertWidget", componentData);
    widgetList.value.splice(index, 0, JSON.parse(JSON.stringify(componentData)));
};

// 更换组件
const sortWidget = async function (oldIndex: number, newIndex: number) {
    const targetComponentData = widgetList.value[oldIndex];
    widgetList.value.splice(oldIndex, 1);
    widgetList.value.splice(newIndex, 0, targetComponentData);
    logs.debug(config.appName, "sortWidget", oldIndex, newIndex, widgetList.value);
};

// 修改当前选中组件的属性数据
const updateWidgetData = async function (key: string, value: any) {
    logs.debug(config.appName, "updateWidgetData", key, value);
    // TODO: 待考虑
    widgetList.value[selectedWidgetIndex.value][key] = value;
};

// 切换选中的组件数据
const onChangeSelectedIndexHandle = async function (index: number) {
    if (selectedWidgetIndex.value === index) {
        return;
    }
    await props.qiankun.events.onChangeSelectedIndex(index);
    selectedWidgetIndex.value = index;
};

const onDeleteHandle = function (index) {
    widgetList.value.splice(index, 1);
    let selectedIndex = selectedWidgetIndex.value;
    if (widgetList.value.length === 0) {
        selectedIndex = -1;
    } else if (index < selectedWidgetIndex.value) {
        selectedIndex = selectedWidgetIndex.value - 1;
    } else if (index === selectedWidgetIndex.value && index > 0) {
        selectedIndex = index - 1;
    }
    props.qiankun.events.onDelete(index, selectedIndex);
};

onMounted(() => {
    props.qiankun.setGlobalState({
        methods: {
            init: initWidgetList,
            insert: insertWidget,
            drag: sortWidget,
            updateComponentProperty: updateWidgetData
        },
        events: props.qiankun.events
    });
    props.qiankun.events.onInit(widgetsPreviewContainerRef.value!);
    console.info("App onMounted", props.qiankun);
});

onUnmounted(() => {
    console.info("App onUnmounted");
});
</script>
<style lang="less">
.widgets-preview-container {
    height: 675px;
    border: 1px solid #409eff;
    border-radius: 4px;

    .widget-template.sortable-ghost {
        background: #fff;
        border: 1px dashed #409eff;
        border-radius: 4px;
        position: relative;
        height: 40px;
        line-height: 40px;
        overflow: hidden;

        &::after {
            content: "放到这里";
            display: block;
            background: #fff;
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            text-align: center;
            font-size: 16px;
            color: #999;
            z-index: 10;
        }
    }
}
</style>
