<!--
 * @创建者: yujinjin9@126.com
 * @创建时间: 2022-09-21 11:37:12
 * @最后修改作者: yujinjin9@126.com
 * @最后修改时间: 2022-10-17 17:36:22
 * @项目的路径: \web-designer\edit\src\components\template-edit.vue
 * @描述: 组件内容编辑
-->
<template>
    <div class="template-edit">
        <draggable :animation="100" :group="{ name: 'widget', put: true }" draggable=".widget-item" @add="dragAddHandle" @start="dragStartHandle" @end="dragEndHandle" ghostClass="ghost" item-key="id" v-model="widgetList">
            <template #item="{ element }">
                <div class="widget-item widget-wrapper">
                    {{ element.text }}
                </div>
            </template>
        </draggable>
    </div>
</template>
<script setup lang="ts">
// import { onMounted, onUnmounted, ref, reactive, watch, computed, nextTick } from "vue";
// import type { Ref, ComputedRef } from "vue";
// import { useStore } from "vuex";

// vuex
// const store = useStore();

import { onMounted, onUnmounted, ref } from "vue";
import draggable from "vuedraggable";

const widgetList = ref([{ id: "01", code: "01", text: "组件01" }]);

const dragAddHandle = function (e: any) {};

const dragEndHandle = function (e: any) {};

const dragStartHandle = function (e: any) {};

onMounted(() => {
    console.info("App onMounted");
});

onUnmounted(() => {
    console.info("App onUnmounted");
});
</script>
<style lang="less" scoped>
.template-edit {
    flex: 1;
}
</style>
