/**
 * @fileoverview 通过 TypeScript 编译器验证设计器公共类型入口及拆分后的领域契约。
 * @remarks 本文件不由 Vitest 执行；负例使用 @ts-expect-error，类型约束意外放宽时编译器也必须报错。
 */
/* eslint import-x/consistent-type-specifier-style: ["error", "prefer-top-level"] */
import type { ExtractPropTypes } from "vue";
import type { Mutable } from "/#/global.d";
import type {
    UseSettingDataValueChangeFun,
    ChangeSelectedWidgetSettingDataFun,
    WidgetBaseData,
    WidgetFormData,
    WidgetNormalData,
    WidgetData,
    WidgetTextData,
    WidgetInputNumberData,
    WidgetSwitchData,
    WidgetRateData,
    WidgetColorPickerData,
    WidgetSliderData,
    WidgetUploadData,
    WidgetRadioGroupData,
    WidgetCheckboxGroupData,
    WidgetSelectData,
    WidgetDatePickerData,
    WidgetTimePickerData,
    WidgetTimeSelectData,
    WidgetHTMLData,
    WidgetAlertData,
    WidgetDividerData,
    WidgetRowContainerData,
    WidgetCascaderData,
    CascaderNodeValue,
    CascaderOption,
    CascaderParseSuccess,
    CascaderParseFailure,
    CascaderParseResult,
    CascaderValue
} from "@/views/types";
import type {
    DesignerFormDocumentV1,
    DesignerFormSuccess,
    DesignerFormFailure,
    DesignerFormResult,
    DesignerFormDynamicContent,
    ParsedDesignerFormDocument,
    InspectHtmlFunction
} from "@/views/domain/document/types";
import type { FormTemplateCategory, FormBlockTemplateDefinition, FormTemplateGroup, FormTemplateSuccess, FormTemplateFailure, FormTemplateResult } from "@/views/domain/templates/types";

/** 两个类型的双向等价判定，避免单向可赋值检查漏掉意外扩宽的联合成员。 */
type Equal<Left, Right> = (<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2 ? true : false;

/** 编译期断言，只接受已经证明为 true 的类型条件。 */
type Expect<Condition extends true> = Condition;

/** 完整普通组件成员，独立枚举以检测公共联合意外遗漏或新增成员。 */
type ExpectedNormalWidgets =
    | WidgetTextData
    | WidgetInputNumberData
    | WidgetSwitchData
    | WidgetRateData
    | WidgetColorPickerData
    | WidgetSliderData
    | WidgetUploadData
    | WidgetRadioGroupData
    | WidgetCheckboxGroupData
    | WidgetSelectData
    | WidgetDatePickerData
    | WidgetTimePickerData
    | WidgetTimeSelectData
    | WidgetHTMLData
    | WidgetAlertData
    | WidgetDividerData
    | WidgetCascaderData;

/** 公共入口完整覆盖输入、选择、日期时间、展示和布局五类组件。 */
export type WidgetUnionContract = Expect<Equal<WidgetNormalData, ExpectedNormalWidgets>>;
/** 顶层允许行容器，行内只接受普通组件，类型层面禁止容器嵌套。 */
export type WidgetTreeContract = Expect<Equal<WidgetData, WidgetNormalData | WidgetRowContainerData>>;
/** 行容器的子节点数组保持普通组件契约。 */
export type RowChildrenContract = Expect<Equal<WidgetRowContainerData["widgets"][number], WidgetNormalData>>;
/** 根表单持有顶层节点联合，不能因目录拆分遗漏容器。 */
export type FormChildrenContract = Expect<Equal<WidgetFormData["widgets"][number], WidgetData>>;
/** 通用设置调用保持三个参数，避免重构破坏设置面板注入协议。 */
export type SettingUpdateContract = Expect<Equal<Parameters<UseSettingDataValueChangeFun>["length"], 3>>;
/** 选中组件分发协议的首参必须仍为具体组件设置适配器。 */
export type SelectedSettingUpdateContract = Expect<Equal<Parameters<ChangeSelectedWidgetSettingDataFun>[0], UseSettingDataValueChangeFun>>;
/** 缺省运行属性合法，持久化恢复前的数据不必伪造缓存。 */
export type OptionalRuntimeContract = Expect<Equal<undefined extends WidgetTextData["componentAttributes"] ? true : false, true>>;
/** ElCascader 外层 props 包含 options 和 placeholder，不能误用 CascaderPanel 的字段配置类型。 */
export type CascaderAttributesContract = Expect<Equal<WidgetCascaderData["componentAttributes"], Partial<Mutable<ExtractPropTypes<typeof import("element-plus").cascaderProps>>> | undefined>>;
/** 级联节点值仅允许可序列化的字符串和数字。 */
export type CascaderNodeContract = Expect<Equal<CascaderNodeValue, string | number>>;
/** 隐藏控制使用新协议，不接受旧的 isShow 控制项。 */
export type CascaderControlContract = Expect<Equal<WidgetCascaderData["settingData"]["control"][number], "disabled" | "isHidden">>;
/** 文档版本为具体字面量，不允许任意数字绕过版本分支。 */
export type DocumentVersionContract = Expect<Equal<DesignerFormDocumentV1["schemaVersion"], 1>>;
/** 文档成功结果保留泛型数据，失败结果不能混入 data。 */
export type DocumentResultContract = Expect<Equal<DesignerFormResult<WidgetFormData>, DesignerFormSuccess<WidgetFormData> | DesignerFormFailure>>;
/** 级联解析结果保留具体选项数组，不退化为 unknown。 */
export type CascaderResultContract = Expect<Equal<CascaderParseResult<CascaderOption[]>, CascaderParseSuccess<CascaderOption[]> | CascaderParseFailure>>;
/** 模板创建结果与文档结果独立，失败分支仅携带面向用户的原因。 */
export type TemplateResultContract = Expect<Equal<FormTemplateResult, FormTemplateSuccess | FormTemplateFailure>>;
/** 模板分类必须兼容既有配置示例、行业与问卷分类。 */
export type TemplateCategoryContract = Expect<
    Equal<FormTemplateCategory, "labels" | "layout" | "text" | "selection" | "datetime" | "numeric" | "display" | "interaction" | "industry" | "questionnaire">
>;
/** 图片卡片工厂输出与顶层节点一致，分类列表提供只读成员集合。 */
export type TemplateFactoryContract = Expect<Equal<ReturnType<FormBlockTemplateDefinition["createWidgets"]>, WidgetData[]>>;
/** 分类成员只能通过注册工厂创建，不在类型层提供数组增删入口。 */
export type TemplateGroupContract = Expect<Equal<FormTemplateGroup["children"], ReadonlyArray<FormBlockTemplateDefinition>>>;
/** 导入动态风险标记与领域公共接口保持一致。 */
export type DynamicContentContract = Expect<Equal<ParsedDesignerFormDocument["dynamicContent"], DesignerFormDynamicContent>>;
/** HTML 检查接口参数仍为原始字符串，不与文件读取结果混用。 */
export type HtmlInspectionContract = Expect<Equal<Parameters<InspectHtmlFunction>, [html: string]>>;

/**
 * @description 验证节点身份只读而具体配置和数组内容可原地编辑。
 * @param base 通用组件节点。
 * @param form 根表单节点。
 * @param row 行容器节点。
 * @param field 普通字段节点。
 * @returns 无返回值；此函数只供编译器检查，不应被运行测试调用。
 */
export function checkWidgetOwnership(base: WidgetBaseData, form: WidgetFormData, row: WidgetRowContainerData, field: WidgetTextData): void {
    // @ts-expect-error 常规设置流程不得重写节点唯一身份。
    base.id = "replacement";
    // @ts-expect-error 组件 code 是注册表稳定标识。
    base.code = "replacement";
    // @ts-expect-error 组件类型名称不能随字段 label 编辑而覆盖。
    base.name = "replacement";
    // @ts-expect-error 表单根身份同样只读。
    form.id = "replacement";
    // @ts-expect-error 数组引用不可替换，允许 splice 保留响应式身份。
    form.widgets = [];
    form.widgets.push(field, row);
    row.widgets.push(field);
    // @ts-expect-error 行容器内不能再加入行容器。
    row.widgets.push(row);
    // @ts-expect-error 设置引用不能整体替换，具体字段仍允许更新。
    field.settingData = { ...field.settingData };
    field.settingData.label = "可编辑标签";
    field.formAttributes.label = "可编辑标签";
    // @ts-expect-error 运行属性引用为只读，恢复构建仅能通过显式 Mutable 边界写入。
    field.componentAttributes = {};
}

/**
 * @description 检查级联值形态、完整节点和隐藏控制项的合法及非法输入。
 * @param cascader 已创建的级联字段。
 * @returns 可序列化的级联值列表，仅供编译期验证。
 */
export function checkCascaderValues(cascader: WidgetCascaderData): CascaderValue[] {
    // 字符串/数字、完整路径和多选路径均为现有组件真实支持的数据形态。
    const values: CascaderValue[] = [
        "leaf",
        1,
        ["root", 2],
        [
            ["root", "leaf"],
            [1, 2]
        ]
    ];
    // @ts-expect-error 布尔值不是级联节点值。
    values.push(true);
    // @ts-expect-error 节点必须有 label 和 value，不能只提供 children。
    cascader.settingData.options.push({ children: [] });
    cascader.settingData.options.push({ label: "根", value: 1, children: [{ label: "叶", value: "leaf", disabled: true }] });
    cascader.settingData.control.push("isHidden", "disabled");
    // @ts-expect-error control 不兼容已移除的旧显示协议。
    cascader.settingData.control.push("isShow");
    return values;
}

/**
 * @description 确认 ok 判别值可以把三种领域结果收窄为各自的成功或失败分支。
 * @param document 文档恢复结果。
 * @param cascader 级联选项校验结果。
 * @param template 模板创建结果。
 * @returns 成功数据或失败信息，内容只用于验证分支属性可访问性。
 */
export function checkResultNarrowing(
    document: DesignerFormResult<WidgetFormData>,
    cascader: CascaderParseResult<CascaderOption[]>,
    template: FormTemplateResult
): Array<WidgetFormData | WidgetData[] | CascaderOption[] | string> {
    // 每个失败分支访问 data 都必须被编译器拒绝，而不是依靠类型断言绕过。
    const result: Array<WidgetFormData | WidgetData[] | CascaderOption[] | string> = [];
    if (document.ok) result.push(document.data);
    else {
        result.push(document.message);
        // @ts-expect-error 文档失败结果不含成功数据。
        result.push(document.data);
    }
    if (cascader.ok) result.push(cascader.data);
    else {
        result.push(cascader.path);
        // @ts-expect-error 级联失败结果不含成功数据。
        result.push(cascader.data);
    }
    if (template.ok) result.push(template.data);
    else {
        result.push(template.message);
        // @ts-expect-error 模板失败结果不含成功数据。
        result.push(template.data);
    }
    return result;
}
