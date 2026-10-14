/**
 * @fileoverview 创建培训与活动问卷，供模板目录按需实例化。
 * @remarks 每次调用均通过注册工厂生成独立字段身份；仅定义配置和当前实例脚本，不持有 Vue 状态或共享可编辑节点。
 */
import { choices, question } from "../builders";
import { type WidgetData } from "@/views/types";

/**
 * @description 创建培训前后自评和课程反馈。
 * @returns 两个独立评分及选择、开放题。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 前后自评创建两个独立评分字段，编辑或回答其中一题不会复用另一题状态。
 */
export const createTrainingSurvey = function (): WidgetData[] {
    return [
        question("rate", "1. 培训前的掌握程度", { defaultValue: 2, settings: { showScore: true, showText: false } }),
        question("rate", "2. 培训后的掌握程度", { defaultValue: 4, settings: { showScore: true, showText: false } }),
        question("checkbox-group", "3. 最有帮助的课程内容", { settings: { options: choices(["概念讲解", "案例分析", "实践练习", "交流讨论"]) } }),
        question("radio-group", "4. 培训内容与工作的相关程度", { settings: { options: choices(["高度相关", "部分相关", "关联较少"]) } }),
        question("rate", "5. 讲师讲解效果", { settings: { allowHalf: true, showScore: true, showText: false } }),
        question("radio-group", "6. 实践练习是否充分", { settings: { type: "button", options: choices(["充分", "适中", "不足"]) } }),
        question("select", "7. 可以立即应用哪些技能", { settings: { multiple: true, filterable: true, options: choices(["问题分析", "工具使用", "沟通表达", "流程改进"]) } }),
        question("radio-group", "8. 期望的后续培训形式", { settings: { type: "button", options: choices(["线上课程", "线下工作坊", "案例研讨"]) } }),
        question("input-number", "9. 建议每次培训时长（小时）", { settings: { min: 0.5, max: 8, step: 0.5, precision: 1, controlsPosition: "right" } }),
        question("text", "10. 希望增加哪些内容", { settings: { type: "textarea", rows: 2 } })
    ];
};

/**
 * @description 创建参与意愿、主题和时间偏好问卷。
 * @returns 按钮单选、多选和时间题。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 参与意愿、主题多选和时间偏好保持独立，问卷为纵向题目而非行业多列资料表。
 */
export const createActivitySurvey = function (): WidgetData[] {
    return [
        question("radio-group", "1. 是否愿意参加下一期活动", { settings: { type: "button", options: choices(["愿意", "视情况而定", "不愿意"]) } }),
        question("checkbox-group", "2. 感兴趣的活动主题", { settings: { options: choices(["技术分享", "实践工作坊", "行业交流", "休闲体验"]) } }),
        question("radio-group", "3. 偏好的举办日期", { settings: { options: choices(["工作日", "周六", "周日"]) } }),
        question("time-picker", "4. 方便参与的时间段", { settings: { isRange: true, valueFormat: "HH:mm:ss" } }),
        question("radio-group", "5. 偏好的活动形式", { settings: { type: "button", options: choices(["线上", "线下", "混合"]) } }),
        question("input-number", "6. 期望活动时长（小时）", { settings: { min: 0.5, max: 12, step: 0.5, precision: 1 } }),
        question("input-number", "7. 可接受的活动费用（元）", { settings: { min: 0, max: 5000, step: 50, controlsPosition: "right" } }),
        question("checkbox-group", "8. 参与时最关注哪些因素", { settings: { options: choices(["内容质量", "交流机会", "地点交通", "时间安排"]) } }),
        question("switch", "9. 是否愿意接收活动提醒", { settings: { inlinePrompt: true, activeText: "是", inactiveText: "否" } }),
        question("text", "10. 补充建议", { settings: { type: "textarea", rows: 2 } })
    ];
};
