/**
 * @fileoverview 创建质检与人事行业区块，供模板目录按需实例化。
 * @remarks 每次调用均通过注册工厂生成独立字段身份；仅定义配置和当前实例脚本，不持有 Vue 状态或共享可编辑节点。
 */
import { bindTemplateVisibility, createTemplateField as field, createTemplateRow as row, choices, question } from "../builders";
import { type WidgetData } from "@/views/types";

/**
 * @description 创建数值检验、判定和缺陷记录。
 * @returns 制造质检 widgets。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 实测值、合格判定和缺陷分别记录，示例不假定行业公差或自动替用户判断检验结果。
 */
export const createQuality = function (): WidgetData[] {
    return [
        row("检验批次", [field("text", "批次编号", { required: true }), field("input-number", "实测尺寸", { settings: { precision: 2, step: 0.01, labelPosition: "right" } })], [14, 10]),
        row("产品信息", [
            field("text", "产品型号", { required: true }),
            field("select", "生产线", { settings: { options: choices(["一号生产线", "二号生产线", "三号生产线"]), labelPosition: "right" } })
        ]),
        row(
            "检验安排",
            [
                field("text", "检验员", { required: true }),
                field("date-picker", "检验日期"),
                field("input-number", "抽检数量", { defaultValue: 10, settings: { min: 1, precision: 0, labelPosition: "top" } })
            ],
            [8, 9, 7]
        ),
        question("radio-group", "检验判定", { settings: { type: "button", options: choices(["合格", "返工", "报废"]) } }),
        question("checkbox-group", "缺陷类型", { settings: { options: choices(["外观", "尺寸", "功能", "其他"]) } }),
        field("select", "处置措施", { settings: { options: choices(["正常入库", "隔离复检", "返工处理", "报废处理"]), labelPosition: "right" } }),
        field("upload", "检验图片", { settings: { autoUpload: false, listType: "picture-card", accept: "image/*", limit: 3 } }),
        field("text", "检验说明", { settings: { type: "textarea", rows: 2, maxlength: 300, showWordLimit: true, labelPosition: "top" } })
    ];
};

/**
 * @description 创建用工类型条件字段，隐藏时跳过必填校验。
 * @returns 人事入职 widgets。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 条件字段的必填校验与用工选择使用同一实例上下文，隐藏分支不会无条件阻止提交。
 */
export const createEmployment = function (): WidgetData[] {
    // 用工类型同时作为在读学校的显示条件和必填校验参照。
    const kind = field("radio-group", "用工类型", { defaultValue: "全职", settings: { type: "button", options: choices(["全职", "实习", "兼职"]) } });
    // 校验与显隐都只引用当前用工类型，隐藏字段不是永久必填。
    const school = field("text", "在读学校", {
        hidden: true,
        functions: { validate: `callback(formData[${JSON.stringify(kind.id)}] === '实习' && !value ? new Error('请填写在读学校') : undefined);` }
    });
    bindTemplateVisibility(kind, [school], "实习");
    return [
        row("入职基本资料", [field("text", "员工姓名", { required: true }), field("date-picker", "入职日期")]),
        row("联系资料", [
            field("text", "联系电话", { settings: { regExp: "^1[3-9]\\d{9}$", regExpMessage: "请输入有效手机号" } }),
            field("text", "电子邮箱", { settings: { regExp: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", regExpMessage: "请输入有效邮箱", labelPosition: "right" } })
        ]),
        row("岗位安排", [
            field("select", "入职部门", { settings: { filterable: true, options: choices(["产品", "研发", "运营", "职能"]) } }),
            field("text", "岗位名称", { required: true, settings: { labelPosition: "right" } })
        ]),
        kind,
        school,
        row("工作安排", [
            field("select", "办公地点", { settings: { options: choices(["总部", "分部", "远程"]), labelPosition: "right" } }),
            field("input-number", "试用期（月）", { defaultValue: 3, settings: { min: 0, max: 6, precision: 0 } })
        ]),
        field("upload", "证件附件", { settings: { autoUpload: false, multiple: true, limit: 4 } }),
        field("text", "入职备注", { settings: { type: "textarea", rows: 2, maxlength: 300, showWordLimit: true, labelPosition: "top" } })
    ];
};
