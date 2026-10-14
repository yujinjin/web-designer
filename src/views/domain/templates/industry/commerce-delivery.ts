/**
 * @fileoverview 创建电商与物流行业区块，供模板目录按需实例化。
 * @remarks 每次调用均通过注册工厂生成独立字段身份；仅定义配置和当前实例脚本，不持有 Vue 状态或共享可编辑节点。
 */
import { bindTemplateVisibility, createTemplateField as field, createTemplateRow as row, choices, question, bindAmount } from "../builders";
import { type WidgetData } from "@/views/types";

/**
 * @description 创建规格多选及金额联动的电商区块。
 * @returns 商品配置 widgets。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 数量、单价与金额绑定本次节点 ID；金额是只读派生结果，清空输入时由联动脚本清空。
 */
export const createCommerce = function (): WidgetData[] {
    // 金额计算的数量输入，与本次单价和结果字段关联。
    const quantity = field("input-number", "数量", { defaultValue: 1, settings: { min: 1, step: 1, stepStrictly: true } });
    // 金额计算的单价输入，与本次数量和结果字段关联。
    const price = field("input-number", "单价", { defaultValue: 99, settings: { min: 0, precision: 2, controlsPosition: "right" } });
    // 仅由联动脚本写入的派生金额结果。
    const total = field("input-number", "商品金额", { defaultValue: 99, settings: { control: ["disabled"], precision: 2, controls: false } });
    bindAmount(quantity, price, total);
    return [
        row("商品标识", [field("text", "商品名称", { required: true }), field("text", "商品编码", { required: true, settings: { maxlength: 32 } })], [15, 9]),
        row("商品分类", [
            field("select", "商品类别", { settings: { filterable: true, options: choices(["生活用品", "数码配件", "食品饮料", "其他"]) } }),
            field("text", "品牌", { settings: { labelPosition: "right" } })
        ]),
        question("checkbox-group", "可售规格", { defaultValue: ["标准款"], settings: { type: "button", options: choices(["标准款", "升级款", "限量款"]) } }),
        row("价格与数量", [quantity, price], [10, 14]),
        row("金额与库存", [total, field("input-number", "可售库存", { defaultValue: 100, settings: { min: 0, precision: 0, controlsPosition: "right" } })]),
        row(
            "销售设置",
            [
                field("date-picker", "销售有效期", { settings: { type: "daterange", labelPosition: "top" } }),
                field("switch", "立即上架", { defaultValue: false, settings: { inlinePrompt: true, activeText: "是", inactiveText: "否", labelPosition: "right" } })
            ],
            [17, 7]
        ),
        field("upload", "商品图片", { settings: { autoUpload: false, listType: "picture", accept: "image/*", multiple: true, limit: 5 } }),
        field("text", "商品说明", { settings: { type: "textarea", rows: 2, maxlength: 500, showWordLimit: true, labelPosition: "top" } })
    ];
};

/**
 * @description 创建配送方式与上门时间的显隐联动。
 * @returns 物流配送 widgets。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 上门时间初始隐藏，仅上门配送才显示；脚本只定位当前模板创建的字段。
 */
export const createDelivery = function (): WidgetData[] {
    // 控制配送分支的方式选项。
    const mode = field("radio-group", "配送方式", { defaultValue: "快递", settings: { type: "button", options: choices(["快递", "上门配送", "自提"]) } });
    // 只在上门配送分支显示的时间范围字段。
    const time = field("time-picker", "上门时段", { hidden: true, settings: { isRange: true, valueFormat: "HH:mm:ss" } });
    bindTemplateVisibility(mode, [time], "上门配送");
    return [
        row("收件联系", [field("text", "收件人", { required: true }), field("text", "联系电话", { settings: { regExp: "^1[3-9]\\d{9}$", regExpMessage: "请输入有效手机号" } })]),
        field("cascader", "配送地区"),
        field("text", "详细地址"),
        row(
            "货件信息",
            [
                field("text", "订单编号", { required: true }),
                field("input-number", "包裹数量", { defaultValue: 1, settings: { min: 1, precision: 0, labelPosition: "right" } }),
                field("input-number", "总重量（kg）", { settings: { min: 0.01, precision: 2, step: 0.5, labelPosition: "top" } })
            ],
            [10, 7, 7]
        ),
        mode,
        time,
        row(
            "送达安排",
            [field("date-picker", "期望送达日期"), field("radio-group", "签收要求", { defaultValue: "本人签收", settings: { options: choices(["本人签收", "可代收"]), labelPosition: "top" } })],
            [10, 14]
        ),
        field("text", "配送备注", { settings: { type: "textarea", rows: 2, maxlength: 200, showWordLimit: true, labelPosition: "top" } })
    ];
};
