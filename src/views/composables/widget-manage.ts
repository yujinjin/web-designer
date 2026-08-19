/**
 * @fileoverview 表单设计器组件管理组合式函数，集中处理选择、设置同步、插入、复制、排序、删除和清空操作。
 * @remarks 所有树变更均原地作用于 WidgetFormData，保持 Vue 响应式引用；管理范围限定为顶层组件和行容器直接子字段两层结构。
 */
import { type Ref } from "vue";
import { useSettingDataValueChange } from "./widgets/form";
import { WIDGET_ROW_CONTAINER } from "./widgets/row-container";
import {
    type ChangeSelectedWidgetSettingDataFun,
    type UseSettingDataValueChangeFun,
    type WidgetBaseData,
    type WidgetData,
    type WidgetFormData,
    type WidgetNormalData,
    type WidgetRowContainerData
} from "./types";
import { createWidgetDefaultData } from "./widget-registry";
import { cloneWidgetData, findWidgetData, getNextSelectedId, isRowContainerWidget } from "./widget-tree";
import { insertManualSpan, moveRowContainerSpan, ROW_CONTAINER_MAX_WIDGET_COUNT, syncRowContainerSpans } from "./row-container-layout";

/**
 * @description 集中维护设计器组件树及选中状态，避免拖拽面板、设置面板分别修改同一份数据。
 * @param widgetFormData 当前表单设计数据；方法会原地修改其 widgets，以保留 Vue 响应式引用。
 * @param selectedWigetId 当前选中组件 id 的可写引用。
 * @returns 供各面板调用的组件增删、排序和设置更新方法。
 * @remarks 非法 id、索引或不允许的嵌套操作会被忽略，不会抛出异常。
 */
export default function useWidgetManage(widgetFormData: WidgetFormData, selectedWigetId: Ref<string | null>) {
    /**
     * @description 获取当前表单的顶层组件原始数组。
     * @returns widgetFormData.widgets 原始引用，供内部操作原地修改。
     */
    const getTopWidgets = function () {
        return widgetFormData.widgets;
    };

    /**
     * @description 更新设计器当前选中组件。
     * @param id 目标组件 id；null 表示取消选择。
     * @returns 无返回值。
     */
    const changeSelectedWidgetId = function (id: string | null) {
        selectedWigetId.value = id;
    };

    /**
     * @description 将设置面板的值交给组件专属适配器处理。
     * @param useSettingDataValueChangeFun 当前组件专属设置同步函数。
     * @param fileName 发生变化的设置字段名。
     * @param value 设置字段的新值。
     * @returns 无返回值。
     * @remarks 选中项不存在时静默忽略；字段名有效性由对应适配器负责，统一入口保证 settingData 与派生运行数据同步。
     */
    const changeSelectedWidgetSettingData: ChangeSelectedWidgetSettingDataFun = function (useSettingDataValueChangeFun: UseSettingDataValueChangeFun, fileName: string, value: any) {
        if (!selectedWigetId.value || !widgetFormData.widgets.length) {
            return;
        }
        // 设置面板可以选中顶层字段或行容器内字段，统一查找可避免两个面板各自维护一套定位规则。
        const result = findWidgetData(getTopWidgets(), selectedWigetId.value);
        if (result?.widgetData) {
            useSettingDataValueChangeFun(result.widgetData, fileName as keyof WidgetBaseData["settingData"], value);
        }
    };

    /**
     * @description 通过表单专属适配器同步表单级设置。
     * @param fileName 发生变化的表单设置字段。
     * @param value 设置字段的新值。
     * @returns 无返回值。
     * @remarks 统一适配器可避免注入方绕过 formAttributes 等派生属性同步规则。
     */
    const changeFormSettingData = function (fileName: keyof WidgetFormData["settingData"], value: any) {
        useSettingDataValueChange(widgetFormData, fileName, value);
    };

    /**
     * @description 按注册表默认值插入组件，并选中新组件。
     * @param code 注册表中的组件 code；未知 code 由注册表按兼容规则回退。
     * @param newIndex 目标位置，超出范围时会收敛到目标数组边界。
     * @param parentWidgetId 缺省时插入顶层；传入时只允许插入行容器中的普通组件。
     * @returns 无返回值。
     * @remarks 行容器禁止嵌套且最多容纳固定数量的字段；插入子组件后必须同步 span，非法父节点或超限操作会被忽略。
     */
    const insertWidgetDefaultData = function (code: string, newIndex: number, parentWidgetId?: string) {
        if (parentWidgetId) {
            // parentWidgetId 表示拖放目标在容器内部；容器只能放普通字段，禁止继续嵌套容器以维持固定的两层树结构。
            const result = findWidgetData(getTopWidgets(), parentWidgetId);
            if (!result || !isRowContainerWidget(result.widgetData) || code === WIDGET_ROW_CONTAINER.code || result.widgetData.widgets.length >= ROW_CONTAINER_MAX_WIDGET_COUNT) {
                return;
            }
            // 创建准备插入行容器的全新组件数据。
            const widgetData = createWidgetDefaultData(code);
            // 再校验一次工厂产物，防止注册项 code 与实际工厂类型配置错误时绕过前面的 code 检查。
            if (isRowContainerWidget(widgetData)) {
                return;
            }
            // Sortable 和外部调用方都可能给出边界外索引，收敛后插入可避免 splice 的负索引语义导致位置反转。
            const insertIndex = Math.max(0, Math.min(newIndex, result.widgetData.widgets.length));
            result.widgetData.widgets.splice(insertIndex, 0, widgetData as WidgetNormalData);
            if (result.widgetData.settingData.enableSpanConfig) {
                // 手动模式要保留已有字段宽度，只为新字段分配剩余栅格，避免用户已配置的布局被整体重算。
                insertManualSpan(result.widgetData, insertIndex);
            } else {
                // 自动模式没有需要保留的人工宽度，按当前字段数重新平均分配 24 栅格。
                syncRowContainerSpans(result.widgetData);
            }
            changeSelectedWidgetId(widgetData.id);
            return;
        }

        // 顶层允许普通组件和行容器；与容器插入分开处理，避免把子组件数量及 span 规则错误应用到顶层。
        const widgetData = createWidgetDefaultData(code);
        // 获取实际承载顶层组件的响应式数组。
        const topWidgets = getTopWidgets();
        // 将外部索引收敛到顶层数组允许的插入范围。
        const insertIndex = Math.max(0, Math.min(newIndex, topWidgets.length));
        topWidgets.splice(insertIndex, 0, widgetData);
        changeSelectedWidgetId(widgetData.id);
    };

    /**
     * @description 深拷贝一个顶层组件并重建组件标识。
     * @param newIndex 副本在顶层数组中的目标索引，超出范围时收敛到数组边界。
     * @param copyIndex 待复制组件的当前顶层索引。
     * @returns 无返回值。
     * @throws 原组件包含不可 JSON 序列化数据时传播 cloneWidgetData 的序列化异常。
     * @remarks copyIndex 无效时静默忽略；身份重建可防止副本与原组件共享表单字段名。
     */
    const copyWidgetData = function (newIndex: number, copyIndex: number) {
        // 获取复制操作所在的顶层组件数组。
        const topWidgets = getTopWidgets();
        // 读取待复制的原始组件，非法索引时不执行后续操作。
        const copiedWidgetData = topWidgets[copyIndex];
        if (!copiedWidgetData) {
            return;
        }
        // 复制不能复用原 id/propName，否则渲染数据和表单校验会把两个组件视为同一字段。
        const newWidgetData = cloneWidgetData(copiedWidgetData);
        // 将外部索引收敛到当前顶层数组允许的插入范围。
        const insertIndex = Math.max(0, Math.min(newIndex, topWidgets.length));
        topWidgets.splice(insertIndex, 0, newWidgetData);
        changeSelectedWidgetId(newWidgetData.id);
    };

    /**
     * @description 在同一层级内移动组件。
     * @param oldIndex 移动前索引，必须指向现有组件。
     * @param newIndex 移动后索引，必须位于现有数组范围内，不接受追加位置。
     * @param parentWidgetId 传入时移动指定行容器的子组件，否则移动顶层组件。
     * @returns 无返回值。
     * @remarks 手动栅格模式下，span 表示组件布局属性，因此必须与子组件一起移动。
     */
    const updateWidgetOrder = function (oldIndex: number, newIndex: number, parentWidgetId?: string) {
        // 获取顶层组件数组，容器内排序时也以此定位父容器。
        const topWidgets = getTopWidgets();
        // 保存本次实际参与排序的同级组件数组。
        let widgets = topWidgets as Array<WidgetData | WidgetNormalData>;
        // 记录容器内排序对应的父容器，顶层排序时保持 null。
        let rowContainerData: WidgetRowContainerData | null = null;
        if (parentWidgetId) {
            // 同一排序入口同时服务顶层和容器内部，先切换到真正被 Sortable 操作的同级数组。
            const result = findWidgetData(topWidgets, parentWidgetId);
            if (!result || !isRowContainerWidget(result.widgetData)) {
                return;
            }
            rowContainerData = result.widgetData;
            widgets = rowContainerData.widgets as WidgetNormalData[];
        }
        // 显式拒绝非法索引，而不是依赖 splice 容错；负索引在 JavaScript 中有效，但不符合拖拽排序语义。
        if (oldIndex < 0 || newIndex < 0 || oldIndex >= widgets.length || newIndex >= widgets.length || oldIndex === newIndex) {
            return;
        }
        // 暂存被移动组件，供目标位置重新插入。
        const movedWidgetData = widgets.splice(oldIndex, 1)[0];
        if (!movedWidgetData) {
            return;
        }
        widgets.splice(newIndex, 0, movedWidgetData);
        if (rowContainerData) {
            // span 与组件按索引一一对应，组件移动后必须同步移动 span，不能只重排组件数组。
            moveRowContainerSpan(rowContainerData, oldIndex, newIndex);
        }
    };

    /**
     * @description 删除任意可定位的组件，并修复其所在层级的布局和选中状态。
     * @param widgetId 待删除组件 id，可指向顶层组件或行容器直接子字段。
     * @returns 无返回值。
     * @remarks 行容器子组件删除后同步移除对应 span；仅当被删项当前已选中时才选择相邻项，未找到 id 时静默忽略。
     */
    const deleteWidget = function (widgetId: string) {
        // 定位待删除组件及其所在的原始同级数组。
        const result = findWidgetData(getTopWidgets(), widgetId);
        if (!result) {
            return;
        }
        // siblings 是组件所在的原数组，直接 splice 才能让 Vue 观察到变更，并同时支持顶层和容器子级删除。
        result.siblings.splice(result.widgetIndex, 1);
        if (result.parentWidgetData) {
            // 先按同一索引删除布局项，再归一化长度；否则残留 span 会被错误关联到后一个组件。
            result.parentWidgetData.settingData.spans.splice(result.widgetIndex, 1);
            syncRowContainerSpans(result.parentWidgetData);
        }
        if (selectedWigetId.value === widgetId) {
            // 未选中的组件被删除时保持当前选择，避免用户编辑上下文无故跳转。
            selectedWigetId.value = getNextSelectedId(result.siblings, result.widgetIndex);
        }
    };

    /**
     * @description 清空全部顶层组件并取消当前选择。
     * @returns 无返回值。
     * @remarks 原地清空而不是替换 widgets，确保 provide/inject 和其他组合式函数持有的数组引用继续有效。
     */
    const clearWidgets = function () {
        // 原地清空而不是替换 widgets，确保已经通过 provide/inject 和组合式函数持有的数组引用继续有效。
        widgetFormData.widgets.splice(0, widgetFormData.widgets.length);
        selectedWigetId.value = null;
    };

    return {
        changeSelectedWidgetId,
        changeSelectedWidgetSettingData,
        changeFormSettingData,
        insertWidgetDefaultData,
        updateWidgetOrder,
        copyWidgetData,
        deleteWidget,
        clearWidgets
    };
}
