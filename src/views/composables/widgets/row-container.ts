/**
 * @fileoverview 行容器布局节点适配模块，描述普通字段在 Element Plus 24 栅格中的横向排列方式和对齐配置。
 * @remarks
 * 容器不产生独立表单值，因此没有普通字段的 formAttributes/componentAttributes；子组件和 spans 的一致性由组件管理及布局模块维护。
 * 业务限制容器最多嵌套一层且不能包含另一个行容器，使查找、提交扁平化和拖拽排序保持确定的两层结构。
 * name 的只读类型用于阻止常规代码随意改写，设置面板重命名是通过 Mutable 局部放开的受控例外。
 * @see ../row-container-layout.ts
 */
import { randomId } from "@yujinjin/utils";
import { type Mutable } from "/#/global.d";
import { type WidgetRowContainerData } from "../types";

/** 注册表使用的行容器稳定 code 与组件库展示元数据；该 code 同时用于阻止容器嵌套。 */
export const WIDGET_ROW_CONTAINER = {
    code: "row-container",
    name: "行容器",
    description: "用于按 24 栅格横向排列多个普通组件",
    icon: "icon-layout"
};

/**
 * @description 创建行容器布局节点。
 * @returns 相互隔离的新行容器节点数据。
 * @remarks 容器只组织普通字段，不产生独立表单值，所以 propName 为 null，也没有 formAttributes/componentAttributes；实际栅格由子组件数组和 spans 共同描述。
 */
export function useCreateDefaultData(): WidgetRowContainerData {
    // 根据组件 code 生成当前设计节点的唯一 ID。
    const id = WIDGET_ROW_CONTAINER.code.replace(/-/g, "_") + "_" + randomId();
    return {
        id: id,
        code: WIDGET_ROW_CONTAINER.code,
        name: WIDGET_ROW_CONTAINER.name,
        isShow: true,
        defaultValue: null,
        propName: null,
        widgets: [],
        settingData: {
            name: WIDGET_ROW_CONTAINER.name,
            gutter: 0,
            justify: "start",
            align: "top",
            enableSpanConfig: false,
            spans: []
        }
    };
}

/**
 * @description 同步行容器设置。
 * @param data 将被原地更新的行容器节点数据。
 * @param fileName 发生变化的设置字段。
 * @param value 设置字段的新值。
 * @returns 无返回值。
 * @remarks name 是类型层只读的节点展示名，但重命名属于设置流程中的受控例外；gutter 会规整为有限数字，spans 的长度和值域由布局管理层统一维护。
 */
export function useSettingDataValueChange(data: WidgetRowContainerData, fileName: keyof WidgetRowContainerData["settingData"], value: any) {
    switch (fileName) {
        case "name":
            // 只读限制用于阻止普通业务代码改写节点身份；设置面板重命名是明确入口，因此局部转换为 Mutable。
            (data as Mutable<WidgetRowContainerData>).name = value || WIDGET_ROW_CONTAINER.name;
            break;
        case "gutter":
            // 避免 NaN 进入 ElRow；具体上下限由设置控件约束，这里只保证运行态是有限数字。
            data.settingData.gutter = Number.isFinite(Number(value)) ? Number(value) : 0;
            break;
        case "justify":
        case "align":
        case "enableSpanConfig":
        case "spans":
            // 这些字段本身只存在 settingData；enableSpanConfig/spans 的联动由 row-container-layout 负责，避免此处重复布局算法。
            break;
    }
    (data.settingData as any)[fileName] = value;
}
