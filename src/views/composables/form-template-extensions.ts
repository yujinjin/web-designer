/**
 * @fileoverview 为配置型模板库补充行业区块和纵向问卷，复用现有组件与运行脚本协议。
 * @remarks 不接外部接口，不提供问卷提交或统计；联动仅引用本次创建的字段 ID，重复拖入时互不影响。
 */
import { bindTemplateVisibility, createTemplateField as field, createTemplateRow as row, setTemplateChangeHandler, type TemplateFieldOptions } from "@/views/composables/form-template-builders";
import { type FormBlockTemplateDefinition } from "@/views/composables/form-template-types";
import { type WidgetData, type WidgetNormalData } from "@/views/composables/types";

/**
 * @description 生成语义稳定的选项，默认值和事件均使用展示文本作为值。
 * @param labels 选项文案。
 * @returns 每次独立创建的选项数组。
 */
const choices = function (labels: string[]) {
    return labels.map(label => ({ label, value: label }));
};

/**
 * @description 创建纵向问卷题目，长题干不占用左侧固定标签宽度。
 * @param code 现有普通组件类型。
 * @param label 包含题号的题干。
 * @param options 默认值、校验及具体组件配置。
 * @returns 顶部题干、可继续编辑的普通组件。
 */
const question = function (code: string, label: string, options: TemplateFieldOptions = {}): WidgetNormalData {
    return field(code, label, { ...options, settings: { labelPosition: "top", ...options.settings } });
};

/**
 * @description 绑定两项数值的金额乘积到当前实例结果字段。
 * @param quantity 数量字段。
 * @param price 单价字段。
 * @param total 金额结果字段。
 * @returns 无返回值；为两个输入字段写入同一计算脚本。
 * @remarks 清空任一输入同步清空金额，零值仍为合法输入；结果保留两位小数。
 */
const bindAmount = function (quantity: WidgetNormalData, price: WidgetNormalData, total: WidgetNormalData): void {
    const body = `const quantity = formData[${JSON.stringify(quantity.id)}];
const price = formData[${JSON.stringify(price.id)}];
formData[${JSON.stringify(total.id)}] = quantity == null || price == null ? null : Math.round(Number(quantity) * Number(price) * 100) / 100;`;
    setTemplateChangeHandler(quantity, body);
    setTemplateChangeHandler(price, body);
};

/** @description 创建规格多选及金额联动的电商区块。 @returns 商品配置 widgets。 */
const createCommerce = function (): WidgetData[] {
    const quantity = field("input-number", "数量", { defaultValue: 1, settings: { min: 1, step: 1, stepStrictly: true } });
    const price = field("input-number", "单价", { defaultValue: 99, settings: { min: 0, precision: 2, controlsPosition: "right" } });
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

/** @description 创建配送方式与上门时间的显隐联动。 @returns 物流配送 widgets。 */
const createDelivery = function (): WidgetData[] {
    const mode = field("radio-group", "配送方式", { defaultValue: "快递", settings: { type: "button", options: choices(["快递", "上门配送", "自提"]) } });
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

/** @description 创建课程多选、班次按钮与材料上传。 @returns 教育报名 widgets。 */
const createEducation = function (): WidgetData[] {
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

/** @description 创建初复诊条件信息和本地科室级联。 @returns 不含真实患者数据的医疗预约区块。 */
const createMedical = function (): WidgetData[] {
    const visit = field("radio-group", "就诊类型", { defaultValue: "初诊", settings: { options: choices(["初诊", "复诊"]) } });
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

/** @description 创建按入住日期计算晚数的酒店区块。 @returns 日期范围、房型和人数 widgets。 */
const createHotel = function (): WidgetData[] {
    const dates = field("date-picker", "入住日期", { settings: { type: "daterange", valueFormat: "YYYY-MM-DD" } });
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

/** @description 创建数值检验、判定和缺陷记录。 @returns 制造质检 widgets。 */
const createQuality = function (): WidgetData[] {
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

/** @description 创建意向地区、预算范围和看房时间。 @returns 房产预约 widgets。 */
const createProperty = function (): WidgetData[] {
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

/** @description 创建用工类型条件字段，隐藏时跳过必填校验。 @returns 人事入职 widgets。 */
const createEmployment = function (): WidgetData[] {
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

/** @description 创建低分原因分支的满意度问卷。 @returns 评分、原因和建议题目。 */
const createSatisfaction = function (): WidgetData[] {
    const score = question("rate", "1. 您对本次体验的满意程度", { defaultValue: 4, settings: { showScore: true, showText: false } });
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

/** @description 创建产品频率、问题多选及其他原因分支。 @returns 产品反馈问卷 widgets。 */
const createProductSurvey = function (): WidgetData[] {
    const issues = question("checkbox-group", "2. 您遇到哪些问题（可多选）", { settings: { options: choices(["加载慢", "操作复杂", "功能不足", "其他"]) } });
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

/** @description 创建多维评分与推荐度问卷。 @returns 纵向评分、滑块及开放题。 */
const createServiceSurvey = function (): WidgetData[] {
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

/** @description 创建培训前后自评和课程反馈。 @returns 两个独立评分及选择、开放题。 */
const createTrainingSurvey = function (): WidgetData[] {
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

/** @description 创建参与意愿、主题和时间偏好问卷。 @returns 按钮单选、多选和时间题。 */
const createActivitySurvey = function (): WidgetData[] {
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

/** @description 创建员工体验和开放意见问卷。 @returns 不采集身份字段的意见题组。 */
const createEmployeeSurvey = function (): WidgetData[] {
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

/** @description 创建需求选择、重要性评分与预算调查。 @returns 多选、评分及范围滑块题。 */
const createPrioritySurvey = function (): WidgetData[] {
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

/** @description 创建按回答显隐的后续问题及条件必填联系方式。 @returns 分支问卷 widgets。 */
const createBranchSurvey = function (): WidgetData[] {
    const used = question("radio-group", "1. 您是否使用过该产品", { defaultValue: "没有", settings: { type: "button", options: choices(["使用过", "没有"]) } });
    const score = question("rate", "2. 请评价使用体验", { hidden: true, settings: { showScore: true, showText: false } });
    bindTemplateVisibility(used, [score], "使用过");
    const follow = question("switch", "3. 是否愿意接受回访", { defaultValue: false, settings: { inlinePrompt: true, activeText: "是", inactiveText: "否" } });
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

/**
 * @description 建立扩展模板元数据，图片只引用本地真实预览截图。
 * @param id 稳定模板标识及 PNG 基础文件名。
 * @param name 卡片名称，不插入为顶部分割线。
 * @param description 模板配置与交互摘要。
 * @param category 行业或问卷分类。
 * @param createWidgets 创建全新实例的工厂。
 * @returns 不含图片高度的注册项，高度由统一目录从截图元数据读取。
 */
const defineTemplate = function (
    id: string,
    name: string,
    description: string,
    category: "industry" | "questionnaire",
    createWidgets: () => WidgetData[]
): Omit<FormBlockTemplateDefinition, "previewHeight"> {
    return { id, name, description, category, previewImage: new URL(`../../assets/images/form-templates/${id}.png`, import.meta.url).href, previewAlt: `${name}真实预览`, createWidgets };
};

/** 行业和问卷只作为既有配置示例的补充，不替换原来的 18 个模板。 */
export const FORM_TEMPLATE_EXTENSIONS: ReadonlyArray<Omit<FormBlockTemplateDefinition, "previewHeight">> = [
    defineTemplate("industry-commerce", "电商商品规格", "规格多选、数量单价、金额联动", "industry", createCommerce),
    defineTemplate("industry-delivery", "物流配送", "地区级联、配送方式、上门时段", "industry", createDelivery),
    defineTemplate("industry-education", "教育课程报名", "课程多选、班次按钮、材料上传", "industry", createEducation),
    defineTemplate("industry-medical", "医疗预约登记", "科室级联、初复诊、预约时段", "industry", createMedical),
    defineTemplate("industry-hotel", "酒店入住预订", "日期范围、房型人数、晚数计算", "industry", createHotel),
    defineTemplate("industry-quality", "制造质检记录", "实测数值、判定、缺陷与图片", "industry", createQuality),
    defineTemplate("industry-property", "房产看房预约", "意向区域、预算范围、看房时间", "industry", createProperty),
    defineTemplate("industry-employment", "人事入职资料", "用工类型、条件校验、证件附件", "industry", createEmployment),
    defineTemplate("survey-satisfaction", "满意度评价", "评分、低分原因、再次使用意愿", "questionnaire", createSatisfaction),
    defineTemplate("survey-product", "产品使用反馈", "使用频率、问题多选、其他原因", "questionnaire", createProductSurvey),
    defineTemplate("survey-service", "服务体验评价", "多维评分、推荐度、开放建议", "questionnaire", createServiceSurvey),
    defineTemplate("survey-training", "培训效果评估", "前后自评、课程多选、改进意见", "questionnaire", createTrainingSurvey),
    defineTemplate("survey-activity", "活动参与调查", "参与意愿、主题偏好、时间选择", "questionnaire", createActivitySurvey),
    defineTemplate("survey-employee", "员工意见调查", "工作体验、改进项、负荷与意见", "questionnaire", createEmployeeSurvey),
    defineTemplate("survey-priority", "需求优先级调查", "需求多选、重要评分、预算范围", "questionnaire", createPrioritySurvey),
    defineTemplate("survey-branch", "分支问卷", "回答显隐、回访意愿、条件必填", "questionnaire", createBranchSurvey)
];
