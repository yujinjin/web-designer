/**
 * @fileoverview 创建满意度、产品与服务体验问卷，供模板目录按需实例化。
 * @remarks 每次调用均通过注册工厂生成独立字段身份；仅定义配置和当前实例脚本，不持有 Vue 状态或共享可编辑节点。
 */
import { setTemplateChangeHandler, choices, question } from "../builders";
import { type WidgetData } from "@/views/types";

/**
 * @description 创建低分原因分支的满意度问卷。
 * @returns 评分、原因和建议题目。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 低分原因仅在有效评分不高于 2 时显示；默认高分隐藏该题，保留题号而不重新编号。
 */
export const createSatisfaction = function (): WidgetData[] {
    // 评分控制项，低分时展示原因分支。
    const score = question("rate", "1. 您对本次体验的满意程度", { defaultValue: 4, settings: { showScore: true, showText: false } });
    // 默认隐藏的低分原因多选题。
    const reasons = question("checkbox-group", "2. 不满意的主要原因（可多选）", { hidden: true, settings: { options: choices(["响应慢", "使用困难", "效果不佳", "其他"]) } });
    setTemplateChangeHandler(score, `for (const item of widgetFormData.widgets) { if (item.id === ${JSON.stringify(reasons.id)}) item.isShow = Number(value) > 0 && Number(value) <= 2; }`);
    return [
        score,
        reasons,
        question("radio-group", "3. 您是否愿意再次使用", { settings: { type: "button", options: choices(["愿意", "不确定", "不愿意"]) } }),
        question("radio-group", "4. 您主要在哪种场景下使用", { settings: { options: choices(["工作学习", "日常生活", "临时任务"]) } }),
        question("radio-group", "5. 您的使用频率", { settings: { type: "button", options: choices(["每天", "每周", "偶尔"]) } }),
        question("rate", "6. 操作是否便捷", { settings: { allowHalf: true, showScore: true, showText: false } }),
        question("radio-group", "7. 结果是否符合预期", { settings: { options: choices(["完全符合", "基本符合", "不符合"]) } }),
        question("checkbox-group", "8. 您最认可哪些方面", { settings: { options: choices(["使用方便", "响应及时", "效果稳定", "服务周到"]) } }),
        question("select", "9. 最应优先改进的方面", { settings: { options: choices(["易用性", "性能", "功能完整性", "服务支持"]) } }),
        question("text", "10. 您的建议", { settings: { type: "textarea", rows: 2, maxlength: 300, showWordLimit: true } })
    ];
};

/**
 * @description 创建产品频率、问题多选及其他原因分支。
 * @returns 产品反馈问卷 widgets。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 其他原因属于问题多选的后续分支，通过数组 includes 判定而非单值比较。
 */
export const createProductSurvey = function (): WidgetData[] {
    // 问题多选题，用数组值判断其他原因分支。
    const issues = question("checkbox-group", "2. 您遇到哪些问题（可多选）", { settings: { options: choices(["加载慢", "操作复杂", "功能不足", "其他"]) } });
    // 仅选择其他选项后展示的自由文本说明。
    const other = question("text", "请说明其他问题", { hidden: true, settings: { type: "textarea", rows: 2 } });
    setTemplateChangeHandler(issues, `for (const item of widgetFormData.widgets) { if (item.id === ${JSON.stringify(other.id)}) item.isShow = Array.isArray(value) && value.includes('其他'); }`);
    return [
        question("radio-group", "1. 您的使用频率", { settings: { type: "button", options: choices(["每天", "每周", "偶尔", "首次使用"]) } }),
        issues,
        other,
        question("radio-group", "3. 您主要使用哪个终端", { settings: { type: "button", options: choices(["电脑", "手机", "平板"]) } }),
        question("checkbox-group", "4. 您最常使用的功能", { settings: { options: choices(["查询", "编辑", "导出", "协作"]) } }),
        question("rate", "5. 完成任务的便利程度", { settings: { showScore: true, showText: false } }),
        question("select", "6. 最影响效率的问题", { settings: { options: choices(["响应速度", "步骤繁琐", "信息不清晰", "暂未遇到问题"]) } }),
        question("rate", "7. 功能完整性评价", { settings: { allowHalf: true, showScore: true, showText: false } }),
        question("switch", "8. 是否愿意尝试新功能", { settings: { inlinePrompt: true, activeText: "是", inactiveText: "否" } }),
        question("text", "9. 最希望改进的功能", { settings: { type: "textarea", rows: 2, maxlength: 500, showWordLimit: true } })
    ];
};

/**
 * @description 创建多维评分与推荐度问卷。
 * @returns 纵向评分、滑块及开放题。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 多维评分、半星和 0–10 推荐度使用不同控件协议，全部题目默认显示，不引入分支隐藏。
 */
export const createServiceSurvey = function (): WidgetData[] {
    return [
        question("rate", "1. 服务响应速度", { defaultValue: 4, settings: { showScore: true, showText: false } }),
        question("rate", "2. 沟通与专业程度", { defaultValue: 3.5, settings: { allowHalf: true, showScore: true, showText: false } }),
        question("slider", "3. 推荐给他人的可能性（0–10）", { defaultValue: 8, settings: { min: 0, max: 10, step: 1, showStops: true, showInput: true } }),
        question("radio-group", "4. 本次通过哪个渠道获得服务", { settings: { options: choices(["在线客服", "电话", "现场服务"]) } }),
        question("radio-group", "5. 您的需求是否被准确理解", { settings: { type: "button", options: choices(["准确理解", "部分理解", "未理解"]) } }),
        question("rate", "6. 沟通表达是否清晰", { settings: { showScore: true, showText: false } }),
        question("radio-group", "7. 本次问题处理结果", { settings: { options: choices(["已解决", "部分解决", "未解决"]) } }),
        question("checkbox-group", "8. 最需要改善哪些环节", { settings: { options: choices(["响应", "沟通", "处理效率", "后续跟进"]) } }),
        question("radio-group", "9. 是否愿意再次选择该服务", { settings: { type: "button", options: choices(["愿意", "不确定", "不愿意"]) } }),
        question("text", "10. 服务改进建议", { settings: { type: "textarea", rows: 2, maxlength: 300, showWordLimit: true } })
    ];
};
