/**
 * @fileoverview 定义 18 个配置型示例并聚合行业、问卷扩展，统一提供模板图片高度元数据。
 * @remarks 图片由这些工厂的真实预览生成；不使用业务名称包装相同布局，也不向每个模板插入装饰性标题。
 */
import { bindTemplateVisibility, createTemplateDivider, createTemplateField, createTemplateRow } from "@/views/composables/form-template-builders";
import { type FormBlockTemplateDefinition } from "@/views/composables/form-template-types";
import { type WidgetData } from "@/views/composables/types";
import imageHeights from "@/assets/images/form-templates/image-heights.json";
import { FORM_TEMPLATE_EXTENSIONS } from "@/views/composables/form-template-extensions";

/**
 * @description 生成模板图片的构建期 URL。
 * @param fileName 不含目录的 PNG 文件名。
 * @returns Vite 可处理的本地资源地址。
 */
const templateImage = function (fileName: string): string {
    return new URL(`../../assets/images/form-templates/${fileName}`, import.meta.url).href;
};

/**
 * @description 创建用于比较选项展示形态的独立选项数组。
 * @returns 值与标签稳定对应的新数组，第三项禁用以展示选项级状态。
 */
const options = function () {
    return [
        { label: "选项一", value: "1" },
        { label: "选项二", value: "2" },
        { label: "选项三", value: "3", disabled: true }
    ];
};

/** @description 创建左对齐标签的纵向字段组。 @returns 三个独立表单项。 */
const createLabelsLeft = function (): WidgetData[] {
    return [
        createTemplateField("text", "文本输入"),
        createTemplateField("select", "单项选择", { settings: { options: options() } }),
        createTemplateField("switch", "状态切换", { defaultValue: true })
    ];
};

/** @description 创建右对齐标签的纵向字段组。 @returns 三个右对齐表单项。 */
const createLabelsRight = function (): WidgetData[] {
    return [
        createTemplateField("text", "输入", { settings: { labelPosition: "right" } }),
        createTemplateField("text", "较长的输入标签", { settings: { labelPosition: "right" } }),
        createTemplateField("radio-group", "单选", { defaultValue: "1", settings: { labelPosition: "right", options: options() } })
    ];
};

/** @description 创建顶部标签的双列与整行组合。 @returns 标签位于控件上方的行容器。 */
const createLabelsTop = function (): WidgetData[] {
    return [
        createTemplateRow("顶部双列", [
            createTemplateField("text", "文本输入", { settings: { labelPosition: "top" } }),
            createTemplateField("select", "选项选择", { settings: { labelPosition: "top", options: options() } })
        ]),
        createTemplateField("text", "多行输入", { settings: { labelPosition: "top", type: "textarea", rows: 2 } })
    ];
};

/** @description 创建同一区块内不同标签位置的组合。 @returns 左、右、上混合的表单项。 */
const createLabelsMixed = function (): WidgetData[] {
    return [
        createTemplateField("text", "左对齐标签"),
        createTemplateField("input-number", "右对齐标签", { defaultValue: 10, settings: { labelPosition: "right" } }),
        createTemplateField("checkbox-group", "顶部标签", { defaultValue: ["1"], settings: { labelPosition: "top", options: options() } })
    ];
};

/** @description 创建双列与三列均分栅格。 @returns 不同列数的行容器。 */
const createGridBalanced = function (): WidgetData[] {
    return [
        createTemplateRow("双列均分", [createTemplateField("text", "左列输入"), createTemplateField("text", "右列输入")]),
        createTemplateRow("三列均分", [
            createTemplateField("text", "第一列", { settings: { labelPosition: "top" } }),
            createTemplateField("text", "第二列", { settings: { labelPosition: "top" } }),
            createTemplateField("text", "第三列", { settings: { labelPosition: "top" } })
        ])
    ];
};

/** @description 创建宽窄不等的两行栅格。 @returns 16/8 与 6/18 的列宽组合。 */
const createGridAsymmetric = function (): WidgetData[] {
    return [
        createTemplateRow(
            "宽窄组合",
            [createTemplateField("text", "宽列输入"), createTemplateField("input-number", "窄列数值", { settings: { labelPosition: "top", controlsPosition: "right" } })],
            [16, 8]
        ),
        createTemplateRow(
            "窄宽组合",
            [
                createTemplateField("switch", "开关", { defaultValue: true, settings: { labelPosition: "top" } }),
                createTemplateField("text", "宽列内容", { settings: { type: "textarea", rows: 2, labelPosition: "top" } })
            ],
            [6, 18]
        )
    ];
};

/** @description 创建同一行容器内自动换行的栅格。 @returns 两个半宽字段及一个整行字段。 */
const createGridWrapped = function (): WidgetData[] {
    return [
        createTemplateRow(
            "容器内换行",
            [
                createTemplateField("text", "第一项"),
                createTemplateField("select", "第二项", { settings: { options: options() } }),
                createTemplateField("text", "整行内容", { settings: { type: "textarea", rows: 2 } })
            ],
            [12, 12, 24]
        )
    ];
};

/** @description 创建文本、密码及带字数统计的多行输入。 @returns 使用实际文本框配置生成的三种形态。 */
const createTextModes = function (): WidgetData[] {
    return [
        createTemplateField("text", "可清空输入", { defaultValue: "示例文本", settings: { clearable: true } }),
        createTemplateField("text", "密码输入", { defaultValue: "example123", settings: { type: "password" } }),
        createTemplateField("text", "字数统计", { defaultValue: "多行输入支持字数统计。", settings: { type: "textarea", rows: 3, maxlength: 100, showWordLimit: true, labelPosition: "top" } })
    ];
};

/** @description 创建普通选项与按钮选项的对照。 @returns 单选和复选的四种实际展示形态。 */
const createOptionModes = function (): WidgetData[] {
    return [
        createTemplateField("radio-group", "普通单选", { defaultValue: "1", settings: { options: options(), type: "radio" } }),
        createTemplateField("radio-group", "按钮单选", { defaultValue: "2", settings: { options: options(), type: "button", fill: "#00b85c", textColor: "#ffffff" } }),
        createTemplateField("checkbox-group", "普通复选", { defaultValue: ["1"], settings: { options: options(), type: "checkbox" } }),
        createTemplateField("checkbox-group", "按钮复选", { defaultValue: ["1", "2"], settings: { options: options(), type: "button", min: 1, max: 2 } })
    ];
};

/** @description 创建可筛选单选与多选标签折叠。 @returns 两种下拉选择器配置。 */
const createSelectModes = function (): WidgetData[] {
    return [
        createTemplateField("select", "筛选单选", { defaultValue: "2", settings: { options: options(), filterable: true } }),
        createTemplateField("select", "折叠多选", { defaultValue: ["1", "2"], settings: { options: options(), multiple: true, collapseTags: true, maxCollapseTags: 1, collapseTagsTooltip: true } })
    ];
};

/** @description 创建完整路径单选和末级多选级联。 @returns 基于同一合法本地树的不同级联配置。 */
const createCascaderModes = function (): WidgetData[] {
    // 不使用业务地区名称，强调层级展示和多选标签本身。
    const tree = [
        {
            label: "分组一",
            value: "group-1",
            children: [
                { label: "子项一", value: "leaf-1" },
                { label: "子项二", value: "leaf-2" }
            ]
        }
    ];
    return [
        createTemplateField("cascader", "完整路径", { defaultValue: ["group-1", "leaf-1"], settings: { options: tree, separator: " / ", showAllLevels: true } }),
        createTemplateField("cascader", "末级多选", {
            defaultValue: ["leaf-1", "leaf-2"],
            settings: { options: structuredClone(tree), multiple: true, emitPath: false, showAllLevels: false, collapseTags: true }
        })
    ];
};

/** @description 创建单日期、月份及日期范围。 @returns 覆盖三种日期选择类型的字段。 */
const createDateModes = function (): WidgetData[] {
    return [
        createTemplateRow("日期与月份", [
            createTemplateField("date-picker", "单日期", { defaultValue: "2026-10-09", settings: { type: "date", valueFormat: "YYYY-MM-DD", labelPosition: "top" } }),
            createTemplateField("date-picker", "月份", { defaultValue: "2026-10", settings: { type: "month", valueFormat: "YYYY-MM", format: "YYYY-MM", labelPosition: "top" } })
        ]),
        createTemplateField("date-picker", "日期范围", { defaultValue: ["2026-10-09", "2026-10-16"], settings: { type: "daterange", valueFormat: "YYYY-MM-DD", rangeSeparator: "至" } })
    ];
};

/** @description 创建单时间、时间范围和固定步长选项。 @returns 可直接编辑的时间组件组合。 */
const createTimeModes = function (): WidgetData[] {
    return [
        createTemplateField("time-picker", "单时间", { defaultValue: "09:30:00", settings: { valueFormat: "HH:mm:ss" } }),
        createTemplateField("time-picker", "时间范围", { defaultValue: ["09:00:00", "18:00:00"], settings: { isRange: true, valueFormat: "HH:mm:ss", rangeSeparator: "至" } }),
        createTemplateField("time-select", "固定步长", { defaultValue: "10:00", settings: { start: "09:00", end: "18:00", step: "00:30" } })
    ];
};

/** @description 创建数字步长、右侧控制按钮及范围滑块。 @returns 数值输入和刻度选择的不同形态。 */
const createNumericModes = function (): WidgetData[] {
    return [
        createTemplateRow("数字控制", [
            createTemplateField("input-number", "小数步长", { defaultValue: 1.5, settings: { precision: 1, step: 0.5, labelPosition: "top" } }),
            createTemplateField("input-number", "右侧按钮", { defaultValue: 20, settings: { controlsPosition: "right", min: 0, max: 100, labelPosition: "top" } })
        ]),
        createTemplateField("slider", "范围刻度", { defaultValue: [20, 60], settings: { range: true, step: 10, showStops: true, showInput: false } }),
        createTemplateField("slider", "直接输入", { defaultValue: 35, settings: { showInput: true, showInputControls: false } })
    ];
};

/** @description 创建半星评分、透明颜色与带文字的开关。 @returns 小型状态控件的配置组合。 */
const createRatingColor = function (): WidgetData[] {
    return [
        createTemplateField("rate", "半星评分", { defaultValue: 3.5, settings: { allowHalf: true, showScore: true, showText: false } }),
        createTemplateRow("颜色与开关", [
            createTemplateField("color-picker", "透明颜色", { defaultValue: "rgba(0, 184, 92, 0.65)", settings: { showAlpha: true, colorFormat: "rgb" } }),
            createTemplateField("switch", "内嵌文字", { defaultValue: true, settings: { inlinePrompt: true, activeText: "开", inactiveText: "关" } })
        ])
    ];
};

/** @description 创建普通上传、拖拽上传和图片卡片。 @returns 不自动发起网络请求的上传形态对照。 */
const createUploadModes = function (): WidgetData[] {
    return [
        createTemplateField("upload", "文件列表", { settings: { autoUpload: false, multiple: true, listType: "text" } }),
        createTemplateField("upload", "拖拽上传", { settings: { autoUpload: false, drag: true, listType: "text", labelPosition: "top" } }),
        createTemplateField("upload", "图片卡片", { settings: { autoUpload: false, accept: "image/*", listType: "picture-card", limit: 3, labelPosition: "top" } })
    ];
};

/** @description 创建展示组件配置，而非给所有模板加标题。 @returns HTML、两种提示主题及分割线示例。 */
const createDisplayBlocks = function (): WidgetData[] {
    return [
        createTemplateField("html", "HTML", { defaultValue: "<p><strong>HTML 展示</strong> · 支持富文本内容</p>" }),
        createTemplateField("alert", "浅色提示", {
            settings: { title: "带图标的浅色提示", description: "说明内容由提示组件配置生成。", type: "info", showIcon: true, closable: false, effect: "light" }
        }),
        createTemplateDivider("分割线示例"),
        createTemplateField("alert", "深色提示", { settings: { title: "居中的深色提示", type: "success", center: true, showIcon: true, closable: false, effect: "dark" } })
    ];
};

/** @description 创建实例内显隐联动、格式校验及跨字段范围校验。 @returns 脚本引用当前实例 ID 的可交互字段组。 */
const createVisibilityValidation = function (): WidgetData[] {
    const controller = createTemplateField("switch", "显示补充项", { defaultValue: false, settings: { activeText: "显示", inactiveText: "隐藏" } });
    const extra = createTemplateField("text", "补充内容", { hidden: true });
    bindTemplateVisibility(controller, [extra], true);
    const minimum = createTemplateField("input-number", "最小值", { defaultValue: 10 });
    const maximum = createTemplateField("input-number", "最大值", {
        defaultValue: 50,
        functions: {
            validate: `const minimum = Number(formData[${JSON.stringify(minimum.id)}]);\ncallback(value !== null && Number(value) < minimum ? new Error("最大值不能小于最小值") : undefined);`
        }
    });
    return [
        controller,
        extra,
        createTemplateField("text", "格式校验", { required: true, settings: { placeholder: "请输入6位数字", regExp: "^\\d{6}$", regExpMessage: "请输入6位数字" } }),
        createTemplateRow("数值范围校验", [minimum, maximum])
    ];
};

/** 按配置差异定义模板；卡片标题不会作为 Widget 写入画布。 */
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
    }
];

/** 使用真实截图记录的内容高度预留卡片空间，避免图片加载后布局跳变。 */
export const FORM_TEMPLATE_CATALOG: ReadonlyArray<FormBlockTemplateDefinition> = [...templateCatalog, ...FORM_TEMPLATE_EXTENSIONS].map(template => ({
    ...template,
    previewHeight: imageHeights[template.id as keyof typeof imageHeights]
}));
