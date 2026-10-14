/**
 * @fileoverview HTML、提示信息与分隔线展示组件的数据契约。
 * @remarks 这些节点用于展示内容，不等同于普通输入字段；隐藏状态与运行缓存的语义保持不变。
 */
// 全类型导入必须整体擦除，避免 verbatimModuleSyntax 将内联 type 编译为空运行导入。
/* eslint import-x/consistent-type-specifier-style: ["error", "prefer-top-level"] */
import type { AlertProps, DividerProps, BorderStyle } from "element-plus";
import type { WidgetBaseData } from "../base";
import type { Mutable } from "/#/global.d";

/**
 * @description 原始 HTML 展示节点数据，defaultValue 由渲染层作为 HTML 内容输出。
 */
export interface WidgetHTMLData extends WidgetBaseData {
    /** 设置面板直接编辑和回显的数据集合。 */
    readonly settingData: {
        /** 提交数据使用的业务字段名或嵌套路径；null 表示不进入提交对象。 */
        propName: string | null;
        /** 字段首次进入渲染数据时使用的默认值；null 通常表示未设置。 */
        defaultValue: string | null;
        /** 设置面板隐藏控制项；空数组表示正常显示。 */
        control: "isHidden"[];
    };
}

/**
 * @description 提示信息展示节点数据，不参与普通表单取值和校验。
 */
export interface WidgetAlertData extends WidgetBaseData {
    /** 直接传递给渲染组件的运行态属性。 */
    readonly componentAttributes?: Partial<Mutable<AlertProps>>;
    /** 设置面板直接编辑和回显的数据集合。 */
    readonly settingData: {
        /** 提交数据使用的业务字段名或嵌套路径；null 表示不进入提交对象。 */
        propName: string | null;
        /** 设置面板隐藏控制项；空数组表示正常显示。 */
        control: "isHidden"[];
        /** 提示信息展示的主标题。 */
        title: string | null;
        /** 组件用途的简短描述。 */
        description: string | null;
        /** 组件具体展示模式或数据选择类型。 */
        type: "success" | "info" | "warning" | "error" | null;
        /** 提示信息是否展示状态图标。 */
        showIcon: boolean | null;
        /** 提示信息是否允许关闭。 */
        closable: boolean | null;
        /** 提示内容是否居中展示。 */
        center: boolean | null;
        /** 提示信息关闭按钮的自定义文案。 */
        closeText: string | null;
        /** 提示信息使用浅色或深色主题。 */
        effect: "dark" | "light" | null;
    };
}

/**
 * @description 分隔线展示节点数据，defaultValue 表示分隔线文案而不是提交字段值。
 */
export interface WidgetDividerData extends WidgetBaseData {
    /** 直接传递给渲染组件的运行态属性。 */
    readonly componentAttributes?: Partial<Mutable<DividerProps>>;
    /** 设置面板直接编辑和回显的数据集合。 */
    readonly settingData: {
        /** 提交数据使用的业务字段名或嵌套路径；null 表示不进入提交对象。 */
        propName: string | null;
        /** 设置面板隐藏控制项；空数组表示正常显示。 */
        control: "isHidden"[];
        /** 字段首次进入渲染数据时使用的默认值；null 通常表示未设置。 */
        defaultValue: string | null;
        /** 分隔线的水平或垂直方向。 */
        direction: "horizontal" | "vertical" | null;
        /** 分隔线边框线型。 */
        borderStyle: BorderStyle | null;
        /** 分隔线文案在横向分隔线中的位置。 */
        contentPosition: "left" | "right" | "center" | null;
    };
}
