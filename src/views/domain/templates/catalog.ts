/**
 * @fileoverview 按既有顺序汇总配置示例、行业区块和问卷的模板元数据。
 * @remarks 目录不创建可编辑节点；工厂在用户拖入时才执行。图片沿用真实预览资源与尺寸元数据，卡片标题不进入表单组件树。
 */
import { type FormBlockTemplateDefinition } from "./types";
import { createLabelsLeft, createLabelsRight, createLabelsTop, createLabelsMixed } from "./examples/labels";
import { createGridBalanced, createGridAsymmetric, createGridWrapped } from "./examples/layout";
import { createTextModes, createOptionModes, createSelectModes, createCascaderModes, createDateModes, createTimeModes, createNumericModes, createRatingColor } from "./examples/inputs";
import { createUploadModes, createDisplayBlocks, createVisibilityValidation } from "./examples/display-interaction";
import { createCommerce, createDelivery } from "./industry/commerce-delivery";
import { createEducation, createMedical } from "./industry/education-medical";
import { createHotel, createProperty } from "./industry/hotel-property";
import { createQuality, createEmployment } from "./industry/quality-employment";
import { createSatisfaction, createProductSurvey, createServiceSurvey } from "./questionnaires/experience";
import { createTrainingSurvey, createActivitySurvey } from "./questionnaires/training-activity";
import { createEmployeeSurvey, createPrioritySurvey } from "./questionnaires/employee-priority";
import { createBranchSurvey } from "./questionnaires/branch";
import imageHeights from "@/assets/images/form-templates/image-heights.json";

/**
 * @description 生成模板图片的构建期 URL。
 * @param fileName 不含目录的 PNG 文件名。
 * @returns Vite 可处理的本地资源地址。
 */
const templateImage = function (fileName: string): string {
    return new URL(`../../../assets/images/form-templates/${fileName}`, import.meta.url).href;
};

/**
 * @description 模板稳定身份、分类和工厂的注册顺序。
 * @remarks 顺序保持迁移前一致；不得按拆分后的目录顺序重排，以免改变组件库展示。
 */
const templateCatalog: ReadonlyArray<Omit<FormBlockTemplateDefinition, "previewHeight">> = [
    {
        id: "labels-left",
        name: "左对齐标签",
        description: "纵向字段组，标签左对齐",
        category: "labels",
        previewImage: templateImage("labels-left.png"),
        previewAlt: "左对齐标签真实预览",
        createWidgets: createLabelsLeft
    },
    {
        id: "labels-right",
        name: "右对齐标签",
        description: "不同长度标签，末端对齐",
        category: "labels",
        previewImage: templateImage("labels-right.png"),
        previewAlt: "右对齐标签真实预览",
        createWidgets: createLabelsRight
    },
    {
        id: "labels-top",
        name: "顶部标签",
        description: "双列输入与整行多行文本",
        category: "labels",
        previewImage: templateImage("labels-top.png"),
        previewAlt: "顶部标签真实预览",
        createWidgets: createLabelsTop
    },
    {
        id: "labels-mixed",
        name: "混合标签位置",
        description: "左、右、上三种位置组合",
        category: "labels",
        previewImage: templateImage("labels-mixed.png"),
        previewAlt: "混合标签位置真实预览",
        createWidgets: createLabelsMixed
    },
    {
        id: "grid-balanced",
        name: "双列与三列",
        description: "均分列宽，不同列数组合",
        category: "layout",
        previewImage: templateImage("grid-balanced.png"),
        previewAlt: "双列与三列真实预览",
        createWidgets: createGridBalanced
    },
    {
        id: "grid-asymmetric",
        name: "宽窄混排",
        description: "16/8 与 6/18 栅格组合",
        category: "layout",
        previewImage: templateImage("grid-asymmetric.png"),
        previewAlt: "宽窄混排真实预览",
        createWidgets: createGridAsymmetric
    },
    {
        id: "grid-wrapped",
        name: "容器内换行",
        description: "半宽字段与整行内容组合",
        category: "layout",
        previewImage: templateImage("grid-wrapped.png"),
        previewAlt: "容器内换行真实预览",
        createWidgets: createGridWrapped
    },
    {
        id: "text-modes",
        name: "文本输入形态",
        description: "可清空、密码、多行字数统计",
        category: "text",
        previewImage: templateImage("text-modes.png"),
        previewAlt: "文本输入形态真实预览",
        createWidgets: createTextModes
    },
    {
        id: "option-modes",
        name: "普通与按钮选项",
        description: "单选、复选和禁用选项",
        category: "selection",
        previewImage: templateImage("option-modes.png"),
        previewAlt: "普通与按钮选项真实预览",
        createWidgets: createOptionModes
    },
    {
        id: "select-modes",
        name: "筛选与多选折叠",
        description: "可筛选单选、折叠多选标签",
        category: "selection",
        previewImage: templateImage("select-modes.png"),
        previewAlt: "筛选与多选折叠真实预览",
        createWidgets: createSelectModes
    },
    {
        id: "cascader-modes",
        name: "级联路径与多选",
        description: "完整路径、末级显示、多选",
        category: "selection",
        previewImage: templateImage("cascader-modes.png"),
        previewAlt: "级联路径与多选真实预览",
        createWidgets: createCascaderModes
    },
    {
        id: "date-modes",
        name: "日期选择形态",
        description: "单日期、月份、日期范围",
        category: "datetime",
        previewImage: templateImage("date-modes.png"),
        previewAlt: "日期选择形态真实预览",
        createWidgets: createDateModes
    },
    {
        id: "time-modes",
        name: "时间与固定步长",
        description: "单时间、范围、半小时选项",
        category: "datetime",
        previewImage: templateImage("time-modes.png"),
        previewAlt: "时间与固定步长真实预览",
        createWidgets: createTimeModes
    },
    {
        id: "numeric-modes",
        name: "数值与滑块",
        description: "小数步长、右侧按钮、范围刻度",
        category: "numeric",
        previewImage: templateImage("numeric-modes.png"),
        previewAlt: "数值与滑块真实预览",
        createWidgets: createNumericModes
    },
    {
        id: "rating-color",
        name: "评分、颜色与开关",
        description: "半星、透明颜色、内嵌文字",
        category: "numeric",
        previewImage: templateImage("rating-color.png"),
        previewAlt: "评分颜色与开关真实预览",
        createWidgets: createRatingColor
    },
    {
        id: "upload-modes",
        name: "上传展示形态",
        description: "文件列表、拖拽、图片卡片",
        category: "display",
        previewImage: templateImage("upload-modes.png"),
        previewAlt: "上传展示形态真实预览",
        createWidgets: createUploadModes
    },
    {
        id: "display-blocks",
        name: "提示与内容展示",
        description: "HTML、浅深提示、分割线",
        category: "display",
        previewImage: templateImage("display-blocks.png"),
        previewAlt: "提示与内容展示真实预览",
        createWidgets: createDisplayBlocks
    },
    {
        id: "visibility-validation",
        name: "显隐与字段校验",
        description: "开关联动、格式及跨字段校验",
        category: "interaction",
        previewImage: templateImage("visibility-validation.png"),
        previewAlt: "显隐与字段校验真实预览",
        createWidgets: createVisibilityValidation
    },
    {
        id: "industry-commerce",
        name: "电商商品规格",
        description: "规格多选、数量单价、金额联动",
        category: "industry",
        previewImage: templateImage("industry-commerce.png"),
        previewAlt: "电商商品规格真实预览",
        createWidgets: createCommerce
    },
    {
        id: "industry-delivery",
        name: "物流配送",
        description: "地区级联、配送方式、上门时段",
        category: "industry",
        previewImage: templateImage("industry-delivery.png"),
        previewAlt: "物流配送真实预览",
        createWidgets: createDelivery
    },
    {
        id: "industry-education",
        name: "教育课程报名",
        description: "课程多选、班次按钮、材料上传",
        category: "industry",
        previewImage: templateImage("industry-education.png"),
        previewAlt: "教育课程报名真实预览",
        createWidgets: createEducation
    },
    {
        id: "industry-medical",
        name: "医疗预约登记",
        description: "科室级联、初复诊、预约时段",
        category: "industry",
        previewImage: templateImage("industry-medical.png"),
        previewAlt: "医疗预约登记真实预览",
        createWidgets: createMedical
    },
    {
        id: "industry-hotel",
        name: "酒店入住预订",
        description: "日期范围、房型人数、晚数计算",
        category: "industry",
        previewImage: templateImage("industry-hotel.png"),
        previewAlt: "酒店入住预订真实预览",
        createWidgets: createHotel
    },
    {
        id: "industry-quality",
        name: "制造质检记录",
        description: "实测数值、判定、缺陷与图片",
        category: "industry",
        previewImage: templateImage("industry-quality.png"),
        previewAlt: "制造质检记录真实预览",
        createWidgets: createQuality
    },
    {
        id: "industry-property",
        name: "房产看房预约",
        description: "意向区域、预算范围、看房时间",
        category: "industry",
        previewImage: templateImage("industry-property.png"),
        previewAlt: "房产看房预约真实预览",
        createWidgets: createProperty
    },
    {
        id: "industry-employment",
        name: "人事入职资料",
        description: "用工类型、条件校验、证件附件",
        category: "industry",
        previewImage: templateImage("industry-employment.png"),
        previewAlt: "人事入职资料真实预览",
        createWidgets: createEmployment
    },
    {
        id: "survey-satisfaction",
        name: "满意度评价",
        description: "评分、低分原因、再次使用意愿",
        category: "questionnaire",
        previewImage: templateImage("survey-satisfaction.png"),
        previewAlt: "满意度评价真实预览",
        createWidgets: createSatisfaction
    },
    {
        id: "survey-product",
        name: "产品使用反馈",
        description: "使用频率、问题多选、其他原因",
        category: "questionnaire",
        previewImage: templateImage("survey-product.png"),
        previewAlt: "产品使用反馈真实预览",
        createWidgets: createProductSurvey
    },
    {
        id: "survey-service",
        name: "服务体验评价",
        description: "多维评分、推荐度、开放建议",
        category: "questionnaire",
        previewImage: templateImage("survey-service.png"),
        previewAlt: "服务体验评价真实预览",
        createWidgets: createServiceSurvey
    },
    {
        id: "survey-training",
        name: "培训效果评估",
        description: "前后自评、课程多选、改进意见",
        category: "questionnaire",
        previewImage: templateImage("survey-training.png"),
        previewAlt: "培训效果评估真实预览",
        createWidgets: createTrainingSurvey
    },
    {
        id: "survey-activity",
        name: "活动参与调查",
        description: "参与意愿、主题偏好、时间选择",
        category: "questionnaire",
        previewImage: templateImage("survey-activity.png"),
        previewAlt: "活动参与调查真实预览",
        createWidgets: createActivitySurvey
    },
    {
        id: "survey-employee",
        name: "员工意见调查",
        description: "工作体验、改进项、负荷与意见",
        category: "questionnaire",
        previewImage: templateImage("survey-employee.png"),
        previewAlt: "员工意见调查真实预览",
        createWidgets: createEmployeeSurvey
    },
    {
        id: "survey-priority",
        name: "需求优先级调查",
        description: "需求多选、重要评分、预算范围",
        category: "questionnaire",
        previewImage: templateImage("survey-priority.png"),
        previewAlt: "需求优先级调查真实预览",
        createWidgets: createPrioritySurvey
    },
    {
        id: "survey-branch",
        name: "分支问卷",
        description: "回答显隐、回访意愿、条件必填",
        category: "questionnaire",
        previewImage: templateImage("survey-branch.png"),
        previewAlt: "分支问卷真实预览",
        createWidgets: createBranchSurvey
    }
];

/**
 * @description 配备真实截图高度的完整只读模板目录。
 * @remarks 高度预留图片卡片空间，避免资源加载导致列表跳变；工厂仍为延迟创建的新实例入口。
 */
export const FORM_TEMPLATE_CATALOG: ReadonlyArray<FormBlockTemplateDefinition> = templateCatalog.map(template => ({
    ...template,
    previewHeight: imageHeights[template.id as keyof typeof imageHeights]
}));
