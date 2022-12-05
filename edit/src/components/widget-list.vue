<!--
 * @创建者: yujinjin9@126.com
 * @创建时间: 2022-09-05 15:57:46
 * @最后修改作者: yujinjin9@126.com
 * @最后修改时间: 2022-12-05 10:57:26
 * @项目的路径: \web-designer\edit\src\components\widget-list.vue
 * @描述: 组件模板列表
-->
<template>
    <div class="widget-list">
        <div class="template-list">
            <div v-for="(widgetItem, index) in widgetList" :key="widgetItem.code" class="widget-box" :class="{ selected: selectedWidgetTempateIndex === index }">
                <i class="iconfont" :class="widgetItem.icon"></i>
                <span>{{ widgetItem.name }}</span>
            </div>
        </div>
        <draggable :clone="cloneData" draggable=".widget-item" :group="{ name: 'widget', pull: 'clone', put: false }" :sort="false" @end="dragEndHandle" ghostClass="ghost" item-key="code" v-model="widgetList[selectedWidgetTempateIndex].caseList" class="draggable-group">
            <template #item="{ element }">
                <div class="widget-item widget-template">
                    <span>{{ element.name }}</span>
                    <div class="img-box">
                        <img :src="element.diagram" />
                    </div>
                </div>
            </template>
        </draggable>
    </div>
</template>
<script setup lang="ts">
import { ref, reactive, defineEmits } from "vue";
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
    display: flex;
    width: 350px;
    flex-shrink: 0;

    .template-list {
        box-shadow: 3px 0 3px 0 rgb(0 0 0 / 8%);
        overflow-x: hidden;
        overflow-y: auto;

        .widget-box {
            cursor: pointer;
            padding: 0px 12px;
            display: flex;
            align-items: center;
            height: 56px;

            &:hover {
                background-color: #ecf5ff;
            }

            &.selected {
                color: #409eff;
            }

            i {
                vertical-align: middle;
                margin-right: 5px;
                width: 24px;
                text-align: center;
                font-size: 18px;
            }

            span {
                white-space: nowrap;
                font-size: 14px;
                width: 100px;
            }
        }
    }

    .draggable-group {
        padding: 10px 20px;

        .widget-item {
            cursor: move;

            span {
                font-size: 12px;
            }

            .img-box {
                transition: all 0.2s;
                margin: 12px 0;
                user-select: none;
                cursor: move;
                box-shadow: 0 0 6px 2px rgb(0 0 0 / 20%);
                border-radius: 4px;

                &:hover {
                    box-shadow: 0 0 6px 3px rgb(64 158 255 / 60%);
                }

                img {
                    width: 150px;
                }
            }
        }
    }
}
</style>
