<template>
    <div class="option-config">
        <table>
            <thead>
                <tr>
                    <th>
                        <template v-if="multiple">
                            <el-checkbox :model-value="checkedAll" :indeterminate="isIndeterminate" @change="checkedAllChange" />
                        </template>
                        <template v-else>选择</template>
                    </th>
                    <th>选项</th>
                    <th width="60px">值</th>
                    <th>禁用</th>
                    <th width="40px">操作</th>
                </tr>
            </thead>
            <tbody ref="tableRef">
                <tr v-for="(item, index) in dataList" :key="item.value + index">
                    <td>
                        <div class="option-checkbox">
                            <el-icon class="sort-icon">
                                <Sort />
                            </el-icon>
                            <el-checkbox v-model="item.checked" @change="checkedChange(item)" />
                        </div>
                    </td>
                    <td>
                        <el-input v-model="item.label" placeholder="请输入选项" />
                    </td>
                    <td>
                        <el-input v-model="item.value" placeholder="请输入值" />
                    </td>
                    <td>
                        <el-switch v-model="item.disabled" @change="updateOptions" />
                    </td>
                    <td>
                        <el-icon class="delete-icon" @click="deleteOption(index)">
                            <Delete />
                        </el-icon>
                    </td>
                </tr>
            </tbody>
        </table>
        <div>
            <el-button type="primary" size="small" @click="addOption">添加选项</el-button>
        </div>
    </div>
</template>
<script setup lang="ts">
import { type PropType, computed, ref, onMounted, onBeforeUnmount } from "vue";
import { type CheckboxValueType } from "element-plus";
import { Delete, Sort } from "@element-plus/icons-vue";
import Sortable from "sortablejs";

const props = defineProps({
    options: {
        type: Array as PropType<{ label: string; value: string; disabled?: boolean }[]>,
        required: true
    },
    defaultValue: {
        type: [String, Number, Boolean, Array] as PropType<string | number | boolean | string[] | number[] | boolean[]>,
        default: ""
    },
    multiple: {
        type: Boolean,
        default: false
    }
});

const emits = defineEmits(["updateOptions", "updateDefaultValue"]);

const tableRef = ref<HTMLTableElement | null>(null);

const checkedAll = computed(() => {
    return props.multiple && !!props.defaultValue && (props.defaultValue as string[] | number[] | boolean[]).length === props.options.length;
});

const isIndeterminate = computed(() => {
    return props.multiple && !!props.defaultValue && (props.defaultValue as string[] | number[] | boolean[]).length === props.options.length;
});

const dataList = ref(
    props.options.map(item => ({
        ...item,
        checked: item.value === props.defaultValue
    }))
);

const updateDefaultValue = function () {
    if (props.multiple) {
        const checkedItems = dataList.value.filter(item => item.checked);
        emits("updateDefaultValue", checkedItems.length > 0 ? checkedItems.map(item => item.value) : null);
    } else {
        const findItem = dataList.value.find(item => item.checked);
        emits("updateDefaultValue", findItem?.value || null);
    }
};

const updateOptions = function () {
    emits(
        "updateOptions",
        dataList.value.map(item => ({
            label: item.label,
            value: item.value,
            disabled: item.disabled
        }))
    );
};

const checkedChange = (item: { label: string; value: string; disabled?: boolean; checked: boolean }) => {
    if (!props.multiple) {
        dataList.value.forEach(item => (item.checked = false));
        item.checked = true;
    }
    updateDefaultValue();
};

const checkedAllChange = (checked: CheckboxValueType) => {
    dataList.value.forEach(item => (item.checked = checked as boolean));
    updateDefaultValue();
};

const addOption = () => {
    dataList.value.push({ label: "选项" + (dataList.value.length + 1), value: (dataList.value.length + 1).toString(), disabled: false, checked: false });
    updateOptions();
};

const deleteOption = (index: number) => {
    dataList.value.splice(index, 1);
    updateOptions();
};

let sortableInstance: Sortable | null = null;

onMounted(() => {
    if (tableRef.value) {
        sortableInstance = new Sortable(tableRef.value, {
            handle: ".sort-icon",
            animation: 150,
            sort: true,
            onEnd: evt => {
                // 更新 dataList 数组的顺序
                if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
                    const [movedItem] = dataList.value.splice(evt.oldIndex, 1);
                    dataList.value.splice(evt.newIndex, 0, movedItem);
                    updateOptions();
                }
            }
        });
    }
});

onBeforeUnmount(() => {
    if (sortableInstance) {
        sortableInstance.destroy();
    }
});
</script>
<style scoped lang="scss">
.option-config {
    width: 100%;
    margin-top: 8px;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    table {
        width: 100%;
        border-collapse: collapse;
        background-color: #ffffff;
        font-size: 12px;

        th,
        td {
            padding: 4px;
            align-items: center;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }

        th {
            background-color: #f9fafb;
            font-weight: 600;
            color: #374151;
            font-size: 12px;
        }

        tr:last-child td {
            border-bottom: none;
        }

        tr:hover {
            background-color: #f9fafb;
        }

        .option-checkbox {
            display: flex;
            align-items: center;
        }

        .sort-icon {
            cursor: move;
            color: #9ca3af;
            margin-left: 4px;
            transition: color 0.2s;
            font-size: 14px;

            &:hover {
                color: #3b82f6;
            }
        }

        .delete-icon {
            cursor: pointer;
            color: #ef4444;
            transition: color 0.2s;
            font-size: 14px;

            &:hover {
                color: #dc2626;
            }
        }
    }

    > div {
        padding: 8px 10px;
        background-color: #f9fafb;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: flex-end;

        .el-button {
            font-size: 12px;
            padding: 4px 12px;
        }
    }
}
</style>
