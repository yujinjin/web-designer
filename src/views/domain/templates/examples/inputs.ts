/**
 * @fileoverview 创建输入与选择控件配置示例，供模板目录按需实例化。
 * @remarks 每次调用均通过注册工厂生成独立字段身份；仅定义配置和当前实例脚本，不持有 Vue 状态或共享可编辑节点。
 */
import { createTemplateField, createTemplateRow, options } from "../builders";
import { type WidgetData } from "@/views/types";

/**
 * @description 创建文本、密码及带字数统计的多行输入。
 * @returns 使用实际文本框配置生成的三种形态。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 默认文本只在新节点首次创建时使用；字数统计同时配置最大长度，避免开启后没有计数效果。
 */
export const createTextModes = function (): WidgetData[] {
    return [
        createTemplateField("text", "可清空输入", { defaultValue: "示例文本", settings: { clearable: true } }),
        createTemplateField("text", "密码输入", { defaultValue: "example123", settings: { type: "password" } }),
        createTemplateField("text", "字数统计", { defaultValue: "多行输入支持字数统计。", settings: { type: "textarea", rows: 3, maxlength: 100, showWordLimit: true, labelPosition: "top" } })
    ];
};

/**
 * @description 创建普通选项与按钮选项的对照。
 * @returns 单选和复选的四种实际展示形态。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 每个字段取得独立选项数组，编辑一个字段时不会污染另一组的选项；禁用状态仅属于第三个选项。
 */
export const createOptionModes = function (): WidgetData[] {
    return [
        createTemplateField("radio-group", "普通单选", { defaultValue: "1", settings: { options: options(), type: "radio" } }),
        createTemplateField("radio-group", "按钮单选", { defaultValue: "2", settings: { options: options(), type: "button", fill: "#00b85c", textColor: "#ffffff" } }),
        createTemplateField("checkbox-group", "普通复选", { defaultValue: ["1"], settings: { options: options(), type: "checkbox" } }),
        createTemplateField("checkbox-group", "按钮复选", { defaultValue: ["1", "2"], settings: { options: options(), type: "button", min: 1, max: 2 } })
    ];
};

/**
 * @description 创建可筛选单选与多选标签折叠。
 * @returns 两种下拉选择器配置。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 单选值为字符串、多选值为数组，与组件实际值协议保持一致。
 */
export const createSelectModes = function (): WidgetData[] {
    return [
        createTemplateField("select", "筛选单选", { defaultValue: "2", settings: { options: options(), filterable: true } }),
        createTemplateField("select", "折叠多选", { defaultValue: ["1", "2"], settings: { options: options(), multiple: true, collapseTags: true, maxCollapseTags: 1, collapseTagsTooltip: true } })
    ];
};

/**
 * @description 创建完整路径单选和末级多选级联。
 * @returns 基于同一合法本地树的不同级联配置。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 两种级联分别使用路径数组和末级多选数组；复制树配置避免设置编辑时共享引用。
 */
export const createCascaderModes = function (): WidgetData[] {
    // 不使用业务地区名称，强调层级展示和多选标签本身。
    const tree = [
        {
            label: "分组一",
            value: "group-1",
            children: [
                { label: "子项一", value: "leaf-1" },
                { label: "子项二", value: "leaf-2" }
            ]
        }
    ];
    return [
        createTemplateField("cascader", "完整路径", { defaultValue: ["group-1", "leaf-1"], settings: { options: tree, separator: " / ", showAllLevels: true } }),
        createTemplateField("cascader", "末级多选", {
            defaultValue: ["leaf-1", "leaf-2"],
            settings: { options: structuredClone(tree), multiple: true, emitPath: false, showAllLevels: false, collapseTags: true }
        })
    ];
};

/**
 * @description 创建单日期、月份及日期范围。
 * @returns 覆盖三种日期选择类型的字段。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 日期值与 valueFormat 一致，避免把展示格式误当作存储格式而导致默认值无法回显。
 */
export const createDateModes = function (): WidgetData[] {
    return [
        createTemplateRow("日期与月份", [
            createTemplateField("date-picker", "单日期", { defaultValue: "2026-10-09", settings: { type: "date", valueFormat: "YYYY-MM-DD", labelPosition: "top" } }),
            createTemplateField("date-picker", "月份", { defaultValue: "2026-10", settings: { type: "month", valueFormat: "YYYY-MM", format: "YYYY-MM", labelPosition: "top" } })
        ]),
        createTemplateField("date-picker", "日期范围", { defaultValue: ["2026-10-09", "2026-10-16"], settings: { type: "daterange", valueFormat: "YYYY-MM-DD", rangeSeparator: "至" } })
    ];
};

/**
 * @description 创建单时间、时间范围和固定步长选项。
 * @returns 可直接编辑的时间组件组合。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 时间范围使用双值数组，固定步长组件保留独立的字符串值，遵循各组件真实协议。
 */
export const createTimeModes = function (): WidgetData[] {
    return [
        createTemplateField("time-picker", "单时间", { defaultValue: "09:30:00", settings: { valueFormat: "HH:mm:ss" } }),
        createTemplateField("time-picker", "时间范围", { defaultValue: ["09:00:00", "18:00:00"], settings: { isRange: true, valueFormat: "HH:mm:ss", rangeSeparator: "至" } }),
        createTemplateField("time-select", "固定步长", { defaultValue: "10:00", settings: { start: "09:00", end: "18:00", step: "00:30" } })
    ];
};

/**
 * @description 创建数字步长、右侧控制按钮及范围滑块。
 * @returns 数值输入和刻度选择的不同形态。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 范围滑块使用数组且不显示数值输入；普通滑块保留输入，区分不兼容的配置组合。
 */
export const createNumericModes = function (): WidgetData[] {
    return [
        createTemplateRow("数字控制", [
            createTemplateField("input-number", "小数步长", { defaultValue: 1.5, settings: { precision: 1, step: 0.5, labelPosition: "top" } }),
            createTemplateField("input-number", "右侧按钮", { defaultValue: 20, settings: { controlsPosition: "right", min: 0, max: 100, labelPosition: "top" } })
        ]),
        createTemplateField("slider", "范围刻度", { defaultValue: [20, 60], settings: { range: true, step: 10, showStops: true, showInput: false } }),
        createTemplateField("slider", "直接输入", { defaultValue: 35, settings: { showInput: true, showInputControls: false } })
    ];
};

/**
 * @description 创建半星评分、透明颜色与带文字的开关。
 * @returns 小型状态控件的配置组合。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 半星、透明颜色和内嵌文案分别使用现有组件属性，不增加仅供图片展示的样式。
 */
export const createRatingColor = function (): WidgetData[] {
    return [
        createTemplateField("rate", "半星评分", { defaultValue: 3.5, settings: { allowHalf: true, showScore: true, showText: false } }),
        createTemplateRow("颜色与开关", [
            createTemplateField("color-picker", "透明颜色", { defaultValue: "rgba(0, 184, 92, 0.65)", settings: { showAlpha: true, colorFormat: "rgb" } }),
            createTemplateField("switch", "内嵌文字", { defaultValue: true, settings: { inlinePrompt: true, activeText: "开", inactiveText: "关" } })
        ])
    ];
};
