/**
 * @fileoverview 创建标签位置示例，供模板目录按需实例化。
 * @remarks 每次调用均通过注册工厂生成独立字段身份；仅定义配置和当前实例脚本，不持有 Vue 状态或共享可编辑节点。
 */
import { createTemplateField, createTemplateRow, options } from "../builders";
import { type WidgetData } from "@/views/types";

/**
 * @description 创建左对齐标签的纵向字段组。
 * @returns 三个独立表单项。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 使用纵向字段而非行容器，让左标签的固定宽度与普通画布布局一致。
 */
export const createLabelsLeft = function (): WidgetData[] {
    return [
        createTemplateField("text", "文本输入"),
        createTemplateField("select", "单项选择", { settings: { options: options() } }),
        createTemplateField("switch", "状态切换", { defaultValue: true })
    ];
};

/**
 * @description 创建右对齐标签的纵向字段组。
 * @returns 三个右对齐表单项。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 保留不同长度题干，直观比较右侧对齐效果，不以缩短标签掩盖真实排版。
 */
export const createLabelsRight = function (): WidgetData[] {
    return [
        createTemplateField("text", "输入", { settings: { labelPosition: "right" } }),
        createTemplateField("text", "较长的输入标签", { settings: { labelPosition: "right" } }),
        createTemplateField("radio-group", "单选", { defaultValue: "1", settings: { labelPosition: "right", options: options() } })
    ];
};

/**
 * @description 创建顶部标签的双列与整行组合。
 * @returns 标签位于控件上方的行容器。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 上方标签用于双列字段和长文本，避免窄列的横向标签挤压控件。
 */
export const createLabelsTop = function (): WidgetData[] {
    return [
        createTemplateRow("顶部双列", [
            createTemplateField("text", "文本输入", { settings: { labelPosition: "top" } }),
            createTemplateField("select", "选项选择", { settings: { labelPosition: "top", options: options() } })
        ]),
        createTemplateField("text", "多行输入", { settings: { labelPosition: "top", type: "textarea", rows: 2 } })
    ];
};

/**
 * @description 创建同一区块内不同标签位置的组合。
 * @returns 左、右、上混合的表单项。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 标签位置分别写入各字段，验证混合排版不会被模板全局配置覆盖。
 */
export const createLabelsMixed = function (): WidgetData[] {
    return [
        createTemplateField("text", "左对齐标签"),
        createTemplateField("input-number", "右对齐标签", { defaultValue: 10, settings: { labelPosition: "right" } }),
        createTemplateField("checkbox-group", "顶部标签", { defaultValue: ["1"], settings: { labelPosition: "top", options: options() } })
    ];
};
