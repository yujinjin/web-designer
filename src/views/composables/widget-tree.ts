/**
 * @fileoverview 组件树查询、类型识别、复制和删除后选中项计算模块，支持顶层组件与行容器直接子字段的固定两层结构。
 * @remarks 树操作返回或修改原始同级数组以保留 Vue 响应式；复制依赖设计数据可 JSON 序列化，并完整重建普通字段身份链。
 */
import { randomId } from "@yujinjin/utils";
import { type Mutable } from "/#/global.d";
import { WIDGET_ROW_CONTAINER } from "./widgets/row-container";
import { type WidgetBaseData, type WidgetData, type WidgetNormalData, type WidgetRowContainerData } from "./types";

/**
 * @description 组件树查找结果，保留命中节点及其原始层级上下文。
 */
export interface WidgetFindResult {
    /** 命中的组件数据。 */
    widgetData: WidgetData;
    /** 组件在 siblings 中的索引，而不是始终相对于顶层数组的索引。 */
    widgetIndex: number;
    /** 顶层组件为 null；子组件指向其直接所属的行容器。 */
    parentWidgetData: WidgetRowContainerData | null;
    /** 组件所在的原始响应式数组，供调用方原地增删；不是数组副本。 */
    siblings: WidgetData[] | WidgetNormalData[];
}

/**
 * @description 判断节点是否为结构有效的行容器。
 * @param widgetData 待识别的组件数据，可为空。
 * @returns 同时满足稳定 code、widgets 属性和数组结构时返回 true，并收窄为 WidgetRowContainerData。
 * @remarks 同时校验 code 和 children 结构，避免仅凭外部导入数据中的 code 就把损坏数据当作行容器处理。
 */
export const isRowContainerWidget = function (widgetData: WidgetData | WidgetBaseData | undefined | null): widgetData is WidgetRowContainerData {
    return Boolean(widgetData && widgetData.code === WIDGET_ROW_CONTAINER.code && "widgets" in widgetData && Array.isArray((widgetData as WidgetRowContainerData).widgets));
};

/**
 * @description 在设计器允许的组件树中定位组件。
 * @param widgets 顶层组件数组。
 * @param widgetId 待查找 id；空值直接返回 null。
 * @returns 组件、所在索引、父行容器和原始同级数组；未找到时返回 null。
 * @remarks 当前业务禁止行容器嵌套，所以只遍历顶层及一层子组件，不进行无边界递归。
 */
export const findWidgetData = function (widgets: Array<WidgetData>, widgetId: string | null): WidgetFindResult | null {
    if (!widgetId) {
        return null;
    }
    for (let index = 0; index < widgets.length; index++) {
        // 读取当前遍历位置的组件，供顶层和容器子项匹配复用。
        const widgetData = widgets[index];
        // 顶层优先匹配；id 按业务要求全局唯一，若导入数据重复，此顺序能提供确定性的结果。
        if (widgetData.id === widgetId) {
            return {
                widgetData,
                widgetIndex: index,
                parentWidgetData: null,
                siblings: widgets
            };
        }
        if (isRowContainerWidget(widgetData)) {
            // 行容器禁止嵌套，因此只检查直接子项；递归反而会掩盖非法数据并扩大管理操作的影响范围。
            // 记录目标组件在行容器直接子项数组中的索引。
            const childIndex = widgetData.widgets.findIndex(item => item.id === widgetId);
            if (childIndex !== -1) {
                return {
                    widgetData: widgetData.widgets[childIndex],
                    widgetIndex: childIndex,
                    parentWidgetData: widgetData,
                    siblings: widgetData.widgets
                };
            }
        }
    }
    return null;
};

/**
 * @description 为复制出的普通组件重建完整身份链。
 * @param widgetData 将被原地修改的普通组件副本。
 * @returns 无返回值。
 * @remarks id、propName、设置态 propName 与表单校验 prop 必须保持一致，否则复制后会出现字段值或校验规则串用。
 */
const resetNormalWidgetId = function (widgetData: WidgetNormalData) {
    // id 在类型层被声明为只读，是为了禁止常规编辑阶段改写；复制是创建新实体的受控例外，因此局部转为 Mutable。
    const mutableWidgetData = widgetData as Mutable<WidgetNormalData>;
    // 为复制出的普通组件生成新的身份，并同步用于默认字段名。
    const id = widgetData.code.replace(/-/g, "_") + "_" + randomId();
    mutableWidgetData.id = id;
    widgetData.propName = id;
    if (widgetData.settingData) {
        widgetData.settingData.propName = id;
    }
    if (widgetData.formAttributes) {
        widgetData.formAttributes.prop = id;
    }
};

/**
 * @description 创建可独立插入组件树的副本，并为容器及其全部子字段生成新标识。
 * @param widgetData 待复制的原组件数据。
 * @returns 与原组件无共享嵌套引用的新组件数据；布局 span 等业务配置保持不变。
 * @throws 传入循环引用、BigInt 或其他不可 JSON 序列化数据时传播原生序列化异常。
 * @remarks 使用 JSON 深拷贝是因为组件配置被约束为可序列化数据；传入循环引用或 BigInt 等非 JSON 数据时会沿用原生序列化异常。
 */
export const cloneWidgetData = function (widgetData: WidgetData): WidgetData {
    // 先断开所有嵌套引用，保证随后改写副本 id、settingData 等内容不会污染原组件。
    // 保存已断开引用的组件副本，后续只在副本上重建身份。
    const newWidgetData = JSON.parse(JSON.stringify(widgetData)) as WidgetData;
    if (isRowContainerWidget(newWidgetData)) {
        // 容器自身只承担布局身份；内部普通字段还会参与表单取值和校验，所以每个子字段都必须完整重建身份链。
        (newWidgetData as Mutable<WidgetRowContainerData>).id = WIDGET_ROW_CONTAINER.code.replace(/-/g, "_") + "_" + randomId();
        newWidgetData.widgets.forEach(item => resetNormalWidgetId(item));
    } else {
        resetNormalWidgetId(newWidgetData as WidgetNormalData);
    }
    return newWidgetData;
};

/**
 * @description 在删除操作完成后的同级数组中选择接替项。
 * @param siblings 删除后的原始同级组件数组。
 * @param deleteIndex 被删除组件在删除前的索引。
 * @returns 后一个组件 id；删除末项时返回前一个 id，数组为空时返回 null。
 * @remarks deleteIndex 使用删除前索引，因此非末项删除后原后继组件会占据相同索引。
 */
export const getNextSelectedId = function (siblings: Array<WidgetData> | Array<WidgetNormalData>, deleteIndex: number) {
    if (siblings.length === 0) {
        return null;
    }
    if (deleteIndex >= siblings.length) {
        // 删除的是末项时，原索引已越过新数组末尾，只能回退到前一个组件。
        return siblings[deleteIndex - 1]?.id ?? null;
    }
    // 非末项删除后，原来的后一个组件会前移到 deleteIndex，保持选择在最接近原位置的组件上。
    return siblings[deleteIndex]?.id ?? null;
};
