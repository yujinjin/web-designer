<!--
 * @创建者: yujinjin9@126.com
 * @创建时间: 2022-09-05 15:57:46
 * @最后修改作者: yujinjin9@126.com
 * @最后修改时间: 2022-10-20 09:47:39
 * @项目的路径: \web-designer\edit\src\components\widget-list.vue
 * @描述: 组件模板列表
-->
<template>
    <div class="widget-list">
        <div class="template-list">
            <div v-for="(widgetItem, index) in widgetList" :key="widgetItem.code" class="widget-box" :class="{ selected: selectedWidgetTempateIndex === index }">
                <i class="iconfont" :class="widgetItem.icon" />
                <span>{{ widgetItem.name }}</span>
            </div>
        </div>
        <draggable :clone="cloneData" draggable=".widget-item" :group="{ name: 'widget', pull: 'clone', put: false }" :sort="false" @end="dragEndHandle" ghostClass="ghost" item-key="code" v-model="widgetList[selectedWidgetTempateIndex].caseList">
            <template #item="{ element }">
                <div class="widget-item widget-template">
                    <span>{{ element.name }}</span>
                    <img :src="element.diagram" />
                </div>
            </template>
        </draggable>
    </div>
</template>
<script setup lang="ts">
import { ref, reactive } from "vue";
import draggable from "vuedraggable";
import widgetListData from "@/services/widget-list-data";
// import type { Ref, ComputedRef } from "vue";
// import { useStore } from "vuex";

// vuex
// const store = useStore();

const emits = defineEmits(["clone"]);

// 当前选中的组件模板索引
const selectedWidgetTempateIndex = ref(0);

const widgetList = reactive(JSON.parse(JSON.stringify(widgetListData)));

const cloneData = function (caseData) {
    const { code, name, previewComponentName } = widgetList[selectedWidgetTempateIndex.value];
    emits("clone", { code, name, previewComponentName, caseData });
};

const dragEndHandle = function (e: CustomEvent) {
    console.info(config.appName, e);
};
</script>
<style lang="less" scoped>
.widget-list {
    flex: 1;
}
</style>
