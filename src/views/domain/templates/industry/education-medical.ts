/**
 * @fileoverview 创建教育与医疗行业区块，供模板目录按需实例化。
 * @remarks 每次调用均通过注册工厂生成独立字段身份；仅定义配置和当前实例脚本，不持有 Vue 状态或共享可编辑节点。
 */
import { bindTemplateVisibility, createTemplateField as field, createTemplateRow as row, choices, question } from "../builders";
import { type WidgetData } from "@/views/types";

/**
 * @description 创建课程多选、班次按钮与材料上传。
 * @returns 教育报名 widgets。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 课程多选与班次按钮保留各自值结构，上传只保存配置，不模拟实际报名提交。
 */
export const createEducation = function (): WidgetData[] {
    return [
        row("学员资料", [field("text", "学员姓名", { required: true }), field("date-picker", "报名日期", { settings: { labelPosition: "right" } })]),
        row("联系信息", [
            field("text", "联系电话", { settings: { regExp: "^1[3-9]\\d{9}$", regExpMessage: "请输入有效手机号" } }),
            field("text", "电子邮箱", { settings: { regExp: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", regExpMessage: "请输入有效邮箱", labelPosition: "right" } })
        ]),
        row("学习基础", [
            field("select", "当前程度", { settings: { options: choices(["零基础", "初级", "中级", "进阶"]) } }),
            field("radio-group", "授课方式", { defaultValue: "线下", settings: { type: "button", options: choices(["线下", "在线"]), labelPosition: "top" } })
        ]),
        question("select", "报名课程", { settings: { multiple: true, filterable: true, options: choices(["基础课程", "进阶课程", "实践课程"]) } }),
        question("radio-group", "授课班次", { defaultValue: "周末班", settings: { type: "button", options: choices(["工作日班", "晚间班", "周末班"]) } }),
        row("学习计划", [field("date-picker", "期望开课日期"), field("input-number", "每周学习时长", { defaultValue: 4, settings: { min: 1, max: 40, precision: 0, labelPosition: "right" } })]),
        field("upload", "报名材料", { settings: { autoUpload: false, multiple: true, limit: 3 } }),
        field("text", "学习目标", { settings: { type: "textarea", rows: 2, maxlength: 300, showWordLimit: true, labelPosition: "top" } })
    ];
};

/**
 * @description 创建初复诊条件信息和本地科室级联。
 * @returns 不含真实患者数据的医疗预约区块。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 初复诊控制复诊补充信息；科室数据为合法本地树，不查询接口或加载患者资料。
 */
export const createMedical = function (): WidgetData[] {
    // 初复诊控制字段，其值决定补充信息的可见性。
    const visit = field("radio-group", "就诊类型", { defaultValue: "初诊", settings: { options: choices(["初诊", "复诊"]) } });
    // 仅复诊时使用的补充信息字段。
    const history = question("text", "复诊补充信息", { hidden: true, settings: { type: "textarea", rows: 2 } });
    bindTemplateVisibility(visit, [history], "复诊");
    return [
        row("预约人资料", [
            field("text", "就诊人姓名", { required: true }),
            field("text", "联系电话", { settings: { regExp: "^1[3-9]\\d{9}$", regExpMessage: "请输入有效手机号", labelPosition: "right" } })
        ]),
        row(
            "基本信息",
            [
                field("input-number", "年龄", { settings: { min: 0, max: 120, precision: 0 } }),
                field("radio-group", "性别", { settings: { options: choices(["男", "女", "不填写"]), labelPosition: "top" } })
            ],
            [8, 16]
        ),
        field("cascader", "预约科室", {
            settings: {
                options: [
                    {
                        label: "门诊",
                        value: "clinic",
                        children: [
                            { label: "内科", value: "internal" },
                            { label: "外科", value: "surgery" }
                        ]
                    }
                ]
            }
        }),
        row("预约时间", [question("date-picker", "预约日期"), question("time-select", "预约时段", { settings: { start: "08:00", end: "17:00", step: "00:30" } })]),
        field("select", "预约渠道", { settings: { options: choices(["线上预约", "电话预约", "现场登记"]), labelPosition: "right" } }),
        visit,
        history,
        field("text", "就诊需求", { settings: { type: "textarea", rows: 2, maxlength: 300, showWordLimit: true, labelPosition: "top" } }),
        field("upload", "已有检查资料", { settings: { autoUpload: false, multiple: true, limit: 3, accept: ".pdf,.jpg,.jpeg,.png" } })
    ];
};
