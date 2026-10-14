/**
 * @fileoverview 创建酒店与房产行业区块，供模板目录按需实例化。
 * @remarks 每次调用均通过注册工厂生成独立字段身份；仅定义配置和当前实例脚本，不持有 Vue 状态或共享可编辑节点。
 */
import { createTemplateField as field, createTemplateRow as row, setTemplateChangeHandler, choices, question } from "../builders";
import { type WidgetData } from "@/views/types";

/**
 * @description 创建按入住日期计算晚数的酒店区块。
 * @returns 日期范围、房型和人数 widgets。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 仅有效且结束晚于开始的日期生成晚数，清空或非法区间返回 null，避免残留上次计算。
 */
export const createHotel = function (): WidgetData[] {
    // 用于计算晚数的日期范围输入。
    const dates = field("date-picker", "入住日期", { settings: { type: "daterange", valueFormat: "YYYY-MM-DD" } });
    // 由有效日期区间派生且禁止手动修改的晚数字段。
    const nights = field("input-number", "入住晚数", { settings: { control: ["disabled"], controls: false } });
    setTemplateChangeHandler(
        dates,
        `const dates = Array.isArray(value) ? value : [];
const start = Date.parse(dates[0]); const end = Date.parse(dates[1]);
formData[${JSON.stringify(nights.id)}] = Number.isFinite(start) && Number.isFinite(end) && end > start ? Math.round((end - start) / 86400000) : null;`
    );
    return [
        row("预订联系", [
            field("text", "预订人姓名", { required: true }),
            field("text", "联系电话", { settings: { regExp: "^1[3-9]\\d{9}$", regExpMessage: "请输入有效手机号", labelPosition: "right" } })
        ]),
        dates,
        row(
            "房型与人数",
            [
                question("radio-group", "房型", { defaultValue: "双床房", settings: { type: "button", options: choices(["大床房", "双床房", "套房"]) } }),
                question("input-number", "入住人数", { defaultValue: 2, settings: { min: 1, max: 6 } })
            ],
            [16, 8]
        ),
        row("预订数量", [field("input-number", "预订房间数", { defaultValue: 1, settings: { min: 1, max: 20, precision: 0 } }), nights], [10, 14]),
        row("入住安排", [
            field("time-select", "预计到店时间", { settings: { start: "12:00", end: "23:30", step: "00:30", labelPosition: "top" } }),
            field("radio-group", "早餐选择", { defaultValue: "含早餐", settings: { type: "button", options: choices(["含早餐", "不含早餐"]), labelPosition: "top" } })
        ]),
        row("订单偏好", [
            field("select", "支付方式", { settings: { options: choices(["到店支付", "预付"]), labelPosition: "right" } }),
            field("switch", "需要发票", { defaultValue: false, settings: { inlinePrompt: true, activeText: "是", inactiveText: "否" } })
        ]),
        field("text", "特殊需求", { settings: { type: "textarea", rows: 2 } })
    ];
};

/**
 * @description 创建意向地区、预算范围和看房时间。
 * @returns 房产预约 widgets。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 范围预算使用滑块数组，地区与户型允许多选；字段保留宽窄和顶部标签的真实配置差异。
 */
export const createProperty = function (): WidgetData[] {
    return [
        row("预约联系", [
            field("text", "联系人", { required: true }),
            field("text", "联系电话", { settings: { regExp: "^1[3-9]\\d{9}$", regExpMessage: "请输入有效手机号", labelPosition: "right" } })
        ]),
        field("cascader", "意向区域", { settings: { multiple: true, collapseTags: true } }),
        question("slider", "预算范围（万元）", { defaultValue: [100, 300], settings: { range: true, min: 0, max: 1000, step: 50, showInput: false, showStops: true } }),
        row(
            "购房意向",
            [
                field("radio-group", "购房目的", { defaultValue: "自住", settings: { type: "button", options: choices(["自住", "改善", "投资"]), labelPosition: "top" } }),
                field("select", "购房计划", { settings: { options: choices(["三个月内", "半年内", "一年内", "暂未确定"]), labelPosition: "right" } })
            ],
            [14, 10]
        ),
        row("看房时间", [question("date-picker", "看房日期"), question("time-picker", "看房时间", { settings: { valueFormat: "HH:mm:ss" } })]),
        field("select", "户型偏好", { settings: { multiple: true, options: choices(["一居", "两居", "三居", "四居"]) } }),
        row(
            "住房要求",
            [
                field("input-number", "期望面积（㎡）", { settings: { min: 20, max: 500, step: 10, controlsPosition: "right" } }),
                field("checkbox-group", "配套偏好", { settings: { options: choices(["近地铁", "有电梯", "可停车"]), labelPosition: "top" } })
            ],
            [10, 14]
        ),
        field("text", "其他需求", { settings: { type: "textarea", rows: 2, maxlength: 300, showWordLimit: true, labelPosition: "top" } })
    ];
};
