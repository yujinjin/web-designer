<!--
 * @创建者: yujinjin9@126.com
 * @创建时间: 2022-09-01 14:18:28
 * @最后修改作者: yujinjin9@126.com
 * @最后修改时间: 2022-10-19 17:45:52
 * @项目的路径: \web-designer\edit\src\App.vue
 * @描述: 头部注释配置模板
-->
<template>
    <div class="web-designer">
        <widget-list @clone="cloneHandle" />
        <preview v-model:selectedComponent="selectedComponentInstanceData" :validate="formValidate" />
        <template-edit v-model:selectedComponent="selectedComponentInstanceData" v-model:validate="formValidate" />
    </div>
</template>
<script setup lang="ts">
import preview from "./components/preview.vue";
import widgetList from "./components/widget-list.vue";
import templateEdit from "./components/template-edit.vue";
import { provide, ref, Ref } from "vue";
import { Widget } from "/#/widget";

// 当前选中组件实例数据
const selectedComponentInstanceData: Ref<Widget.ComponentInstance | null> = ref(null);

// 组件克隆数据
const widgetCloneData: Ref<Record<string, any> | null> = ref(null);
provide("widgetCloneData", widgetCloneData);

// 模板编辑表单字段验证函数
const formValidate = async function () {
    return true;
};

// 克隆操作
const cloneHandle = function (data) {
    widgetCloneData.value = data;
};

// TODO: 切换预览的组件，验证编辑组件的数据内容是否通过

// 更换选择的组件实例操作
// const changeSelectedComponentHandle = function (componentInstanceData: Widget.ComponentInstance) {
//     selectedComponentInstanceData.value = componentInstanceData;
// };
</script>
<style>
.web-designer {
    display: flex;
    height: 100%;
}
</style>
