/**
 * @fileoverview 创建条件显隐与校验分支问卷，供模板目录按需实例化。
 * @remarks 每次调用均通过注册工厂生成独立字段身份；仅定义配置和当前实例脚本，不持有 Vue 状态或共享可编辑节点。
 */
import { bindTemplateVisibility, choices, question } from "../builders";
import { type WidgetData } from "@/views/types";

/**
 * @description 创建按回答显隐的后续问题及条件必填联系方式。
 * @returns 分支问卷 widgets。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 先构建控制项及后续字段，再绑定显隐和条件校验，避免引用其他模板实例的字段身份。
 */
export const createBranchSurvey = function (): WidgetData[] {
    // 是否实际使用过产品，决定是否需要展示体验评分题。
    const used = question("radio-group", "1. 您是否使用过该产品", { defaultValue: "没有", settings: { type: "button", options: choices(["使用过", "没有"]) } });
    // 未使用过产品时隐藏体验评分，避免收集没有依据的评价。
    const score = question("rate", "2. 请评价使用体验", { hidden: true, settings: { showScore: true, showText: false } });
    bindTemplateVisibility(used, [score], "使用过");
    // 回访意愿与使用经历独立，由自身值控制邮箱显示和必填规则。
    const follow = question("switch", "3. 是否愿意接受回访", { defaultValue: false, settings: { inlinePrompt: true, activeText: "是", inactiveText: "否" } });
    // 仅在愿意回访时使用的联系字段。
    const contact = question("text", "4. 回访邮箱", {
        hidden: true,
        settings: { regExp: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", regExpMessage: "请输入有效邮箱" },
        functions: { validate: `callback(formData[${JSON.stringify(follow.id)}] && !value ? new Error('同意回访时请填写邮箱') : undefined);` }
    });
    bindTemplateVisibility(follow, [contact], true);
    return [
        used,
        score,
        follow,
        contact,
        question("radio-group", "5. 您通过什么渠道接触产品", { settings: { options: choices(["朋友推荐", "搜索", "社交平台", "工作需要"]) } }),
        question("checkbox-group", "6. 最关心哪些能力", { settings: { options: choices(["易用性", "性能", "功能", "服务支持"]) } }),
        question("radio-group", "7. 预期使用频率", { settings: { type: "button", options: choices(["每天", "每周", "偶尔"]) } }),
        question("radio-group", "8. 对学习新工具的接受程度", { settings: { options: choices(["愿意主动学习", "需要指导", "倾向沿用旧工具"]) } }),
        question("radio-group", "9. 是否愿意参与后续试用", { settings: { type: "button", options: choices(["愿意", "不确定", "不愿意"]) } }),
        question("text", "10. 其他意见", { settings: { type: "textarea", rows: 2 } })
    ];
};
