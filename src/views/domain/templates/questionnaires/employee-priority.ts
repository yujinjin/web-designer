/**
 * @fileoverview 创建员工体验与需求优先级问卷，供模板目录按需实例化。
 * @remarks 每次调用均通过注册工厂生成独立字段身份；仅定义配置和当前实例脚本，不持有 Vue 状态或共享可编辑节点。
 */
import { choices, question } from "../builders";
import { type WidgetData } from "@/views/types";

/**
 * @description 创建员工体验和开放意见问卷。
 * @returns 不采集身份字段的意见题组。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 不创建身份采集字段；工作体验、负荷与开放意见分别建模，不提供统计或提交服务。
 */
export const createEmployeeSurvey = function (): WidgetData[] {
    return [
        question("radio-group", "1. 当前工作体验如何", { settings: { options: choices(["很满意", "较满意", "一般", "需改善"]) } }),
        question("checkbox-group", "2. 优先改善哪些方面", { settings: { options: choices(["工作流程", "团队协作", "培训成长", "办公环境"]) } }),
        question("slider", "3. 当前工作负荷（0–10）", { defaultValue: 5, settings: { min: 0, max: 10, showInput: false, showStops: true } }),
        question("rate", "4. 团队协作体验", { settings: { showScore: true, showText: false } }),
        question("rate", "5. 工作流程清晰程度", { settings: { allowHalf: true, showScore: true, showText: false } }),
        question("radio-group", "6. 对成长机会的评价", { settings: { options: choices(["充足", "一般", "不足"]) } }),
        question("select", "7. 希望获得哪些培训", { settings: { multiple: true, options: choices(["专业技能", "沟通协作", "项目管理", "工具使用"]) } }),
        question("radio-group", "8. 表达意见是否便利", { settings: { type: "button", options: choices(["便利", "一般", "不便利"]) } }),
        question("radio-group", "9. 工作安排的灵活程度", { settings: { options: choices(["灵活", "适中", "需改善"]) } }),
        question("text", "10. 最希望优先改善的措施", { settings: { type: "textarea", rows: 3, maxlength: 500, showWordLimit: true } })
    ];
};

/**
 * @description 创建需求选择、重要性评分与预算调查。
 * @returns 多选、评分及范围滑块题。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 重要程度评分和预算范围保留不同数值结构，需求多选不自动重排题目或生成重复题。
 */
export const createPrioritySurvey = function (): WidgetData[] {
    return [
        question("checkbox-group", "1. 最需要哪些能力（最多选三项）", { settings: { max: 3, type: "button", options: choices(["数据导出", "自动化", "协作", "移动端"]) } }),
        question("rate", "2. 这些需求的重要程度", { defaultValue: 4, settings: { showScore: true, showText: false } }),
        question("slider", "3. 可接受的月预算范围（元）", { defaultValue: [50, 150], settings: { min: 0, max: 500, step: 50, range: true, showInput: false, showStops: true } }),
        question("radio-group", "4. 当前最主要的目标", { settings: { options: choices(["提升效率", "降低成本", "提高质量", "改善协作"]) } }),
        question("radio-group", "5. 当前使用的替代方案", { settings: { options: choices(["手工处理", "其他工具", "内部系统", "暂无方案"]) } }),
        question("radio-group", "6. 预计使用频率", { settings: { type: "button", options: choices(["每天", "每周", "每月", "偶尔"]) } }),
        question("select", "7. 期望上线时间", { settings: { options: choices(["一个月内", "三个月内", "半年内", "暂无明确计划"]) } }),
        question("switch", "8. 是否愿意向团队推广", { settings: { inlinePrompt: true, activeText: "是", inactiveText: "否" } }),
        question("radio-group", "9. 最重要的一项能力", { settings: { type: "button", options: choices(["数据导出", "自动化", "协作", "移动端"]) } }),
        question("text", "10. 需求补充说明", { settings: { type: "textarea", rows: 2 } })
    ];
};
