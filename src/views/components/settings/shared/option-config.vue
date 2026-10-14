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
/**
 * @fileoverview 选项配置共享编辑器，编辑选项列表、默认值并通过事件提交排序和增删结果。
 * @remarks 选项和默认值属于父组件；本地列表只承担编辑与排序，通过 updateOptions/updateDefaultValue 交回上层，不直接修改父级配置。
 */
import { type PropType, computed, ref, onMounted, onBeforeUnmount } from "vue";
import { type CheckboxValueType } from "element-plus";
import { Delete, Sort } from "@element-plus/icons-vue";
import Sortable from "sortablejs";

/**
 * @description 父面板提供的选项、默认值和单多选模式。
 * @remarks 配置本身由父面板持有；本地 checked 只用于编辑器交互，提交时不会作为选项属性写回。
 */
const props = defineProps({
    /** 可编辑选项及其禁用状态；初始值用于创建本地编辑列表。 */
    options: {
        type: Array as PropType<
            {
                /** 设置面板与普通选项控件显示的文案。 */
                label: string;
                /** 默认值及字段结果中使用的选项值。 */
                value: string;
                /** 是否禁止终端用户选取；不等于编辑器中的 checked。 */
                disabled?: boolean;
            }[]
        >,
        required: true
    },
    /** 当前组件默认值；单选为标量，多选为值数组。 */
    defaultValue: {
        type: [String, Number, Boolean, Array] as PropType<string | number | boolean | string[] | number[] | boolean[]>,
        default: ""
    },
    /** 是否允许同时设置多个默认选项。 */
    multiple: {
        type: Boolean,
        default: false
    }
});

/**
 * @description 将选项结构和默认值分别交回父面板的事件入口。
 * @remarks 不把本地勾选状态混入选项数据，父面板再通过组件适配器同步设置态和运行属性。
 */
const emits = defineEmits(["updateOptions", "updateDefaultValue"]);

// 挂载 Sortable 的选项表体，只有组件挂载后才具有 DOM 引用。
const tableRef = ref<HTMLTableElement | null>(null);

/**
 * @description 从父级多选默认值数量派生表头全选状态。
 * @remarks 依赖默认值和选项长度，不读取本地勾选列表；沿用当前数量判断规则，不在这里重建默认值。
 */
const checkedAll = computed(() => {
    return props.multiple && !!props.defaultValue && (props.defaultValue as string[] | number[] | boolean[]).length === props.options.length;
});

/**
 * @description 提供表头复选框当前的中间态标记。
 * @remarks 当前实现与全选使用相同的父级数量条件；该派生值只驱动外观，不负责选择或修正默认值。
 */
const isIndeterminate = computed(() => {
    return props.multiple && !!props.defaultValue && (props.defaultValue as string[] | number[] | boolean[]).length === props.options.length;
});

/**
 * @description 本地可编辑的选项列表，并附加编辑器专用 checked 状态。
 * @remarks setup 时复制父级选项对象，避免直接写 props；初始 checked 沿用选项值与默认值严格相等的现有判定，后续编辑通过事件交回上层。
 */
const dataList = ref(
    props.options.map(item => ({
        ...item,
        checked: item.value === props.defaultValue
    }))
);

/**
 * @description 把本地勾选状态转换为普通组件的默认值协议。
 * @returns 无返回值；发出 updateDefaultValue。
 * @remarks 多选输出选中项值数组，单选只输出首个选中值；当前实现未选中时发送 null，不保留编辑器 checked 字段。
 */
const updateDefaultValue = function () {
    if (props.multiple) {
        // 多选结果由当前选项顺序决定，不共享父级默认值数组。
        const checkedItems = dataList.value.filter(item => item.checked);
        emits("updateDefaultValue", checkedItems.length > 0 ? checkedItems.map(item => item.value) : null);
    } else {
        // 单选只提交一个值，空值沿用 null 清空语义。
        const findItem = dataList.value.find(item => item.checked);
        emits("updateDefaultValue", findItem?.value || null);
    }
};

/**
 * @description 提交当前选项顺序、文案、值和禁用状态。
 * @returns 无返回值；发出 updateOptions，不改变默认值事件。
 * @remarks 显式投影三个持久化字段，防止本地 checked 状态泄漏到组件配置。
 */
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

/**
 * @description 处理一个选项的默认值勾选。
 * @param item 本地选项行及当前 checked 状态。
 * @returns 无返回值；同步默认值事件。
 * @remarks 单选先清除其余行再保留当前行，避免生成多个单选默认值；多选保留组件已写入的各行状态。
 */
const checkedChange = (item: {
    /** 本地编辑行中的选项文案。 */
    label: string;
    /** 当前选项提交到默认值的实际值。 */
    value: string;
    /** 普通组件中的禁用状态，与默认值勾选独立。 */
    disabled?: boolean;
    /** 仅供配置编辑器选择默认值的临时状态。 */
    checked: boolean;
}) => {
    if (!props.multiple) {
        dataList.value.forEach(item => (item.checked = false));
        item.checked = true;
    }
    updateDefaultValue();
};

/**
 * @description 将表头全选操作应用到所有本地选项。
 * @param checked 表头复选框变更值，当前模板使用布尔勾选协议。
 * @returns 无返回值；更新各行 checked 并发出新的多选默认值。
 */
const checkedAllChange = (checked: CheckboxValueType) => {
    dataList.value.forEach(item => (item.checked = checked as boolean));
    updateDefaultValue();
};

/**
 * @description 在列表末尾追加一个可继续修改的新选项。
 * @returns 无返回值；新选项默认不勾选，并通过 updateOptions 提交。
 * @remarks 初始名称和值沿用当前列表长度生成，唯一性规则不在这个共享编辑器中另行定义。
 */
const addOption = () => {
    dataList.value.push({ label: "选项" + (dataList.value.length + 1), value: (dataList.value.length + 1).toString(), disabled: false, checked: false });
    updateOptions();
};

/**
 * @description 删除当前表格索引对应的本地选项。
 * @param index 模板提供的当前列表索引。
 * @returns 无返回值；提交删除后的选项列表。
 * @remarks 当前操作只发出选项更新事件，不在此隐式修正父组件默认值。
 */
const deleteOption = (index: number) => {
    dataList.value.splice(index, 1);
    updateOptions();
};

/**
 * @description 当前表体对应的 Sortable 实例。
 * @remarks 该实例只管理 DOM 拖动，不作为响应式数据；组件卸载前必须销毁其事件监听。
 */
let sortableInstance: Sortable | null = null;

/**
 * @description 表体 DOM 创建后安装选项排序，仅允许从排序图标开始拖动。
 * @remarks 拖动完成后按索引同步本地数据并提交，否则仅 DOM 换位会在下一次 Vue 渲染时回退。
 */
onMounted(() => {
    if (tableRef.value) {
        sortableInstance = new Sortable(tableRef.value, {
            handle: ".sort-icon",
            animation: 150,
            sort: true,
            /**
             * @description 将 Sortable 已完成的 DOM 排序同步到本地选项列表。
             * @param evt 包含拖动前后索引的排序事件。
             * @returns 无返回值；有效索引时原地重排并发出选项更新。
             * @remarks 任一索引缺失时不移动数据，避免把未知位置当作首项。
             */
            onEnd: evt => {
                if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
                    // 复用被移动选项对象，保留正在编辑的文案和本地勾选状态。
                    const [movedItem] = dataList.value.splice(evt.oldIndex, 1);
                    dataList.value.splice(evt.newIndex, 0, movedItem);
                    updateOptions();
                }
            }
        });
    }
});

/**
 * @description 在表体移除前释放 Sortable 的 DOM 及监听引用。
 * @remarks 设置面板会随组件切换重建，销毁实例避免重复绑定拖动事件。
 */
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
