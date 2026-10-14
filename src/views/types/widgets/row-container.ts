/**
 * @fileoverview 行容器布局契约，定义直接子组件与 24 栅格设置。
 * @remarks 子项只允许普通组件，类型层约束不嵌套行容器；spans 与子项索引一一对应。
 */
// 全类型导入必须整体擦除，避免 verbatimModuleSyntax 将内联 type 编译为空运行导入。
/* eslint import-x/consistent-type-specifier-style: ["error", "prefer-top-level"] */
import type { WidgetBaseData } from "../base";
import type { WidgetNormalData } from "../widget";

/**
 * @description 行容器布局节点数据，只组织普通组件并通过 spans 描述 24 栅格宽度。
 */
export interface WidgetRowContainerData extends WidgetBaseData {
    /** 表单顶层组件或行容器直接子组件的响应式数组。 */
    readonly widgets: Array<WidgetNormalData>;
    /** 设置面板直接编辑和回显的数据集合。 */
    readonly settingData: {
        /** 组件展示名称、行容器名称或上传文件字段名。 */
        name: string;
        /** 行容器相邻栅格列之间的间距。 */
        gutter: number;
        /** 行容器子项在主轴方向的排列方式。 */
        justify: "start" | "end" | "center" | "space-around" | "space-between" | "space-evenly";
        /** 组件内容或行容器子项的对齐方式。 */
        align: "top" | "middle" | "bottom";
        /** 是否启用行容器手动栅格宽度配置。 */
        enableSpanConfig: boolean;
        /** 与行容器子组件索引一一对应的栅格宽度数组。 */
        spans: number[];
    };
}
