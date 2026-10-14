/**
 * @fileoverview 在独立副本上校验并物化组件运行属性；失败候选不会污染当前设计状态。
 */
import { type Mutable } from "/#/global.d";
import { isRecord, isIsoDateTime, isWidgetRowContainerData, isWidgetFormData, validateWidgetBaseData } from "./validation";
import { type DesignerFormResult, type DesignerFormDocumentV1, DESIGNER_FORM_DOCUMENT_SCHEMA_VERSION, createDesignerFormFailure } from "./types";
import { type WidgetBaseData, type WidgetRowContainerData } from "@/views/types";
import { buildWidgetComponentAttributes, getWidgetDefinition } from "@/views/domain/widgets/registry";
import { WIDGET_FORM_CODE } from "@/views/domain/form/form-adapter";
import { WIDGET_ROW_CONTAINER } from "@/views/domain/widgets/adapters/row-container";

/**
 * @description 为已校验公共字段的普通 Widget 恢复运行属性。
 * @param widgetData 已通过基础校验的组件节点。
 * @param path 节点在文档中的数据路径。
 * @returns 成功时返回已恢复 componentAttributes 的节点，失败时返回路径化错误。
 * @remarks 行容器只允许出现在顶层；运行属性始终从注册表构建，持久化数据中同名字段不会被信任。
 */
const restoreNormalWidget = function (widgetData: WidgetBaseData, path: string): DesignerFormResult<WidgetBaseData> {
    // 运行属性构建始终以当前注册表为准，忽略外部同名属性。
    const definition = getWidgetDefinition(widgetData.code);
    if (!definition) return createDesignerFormFailure(`未知组件类型：${widgetData.code}`, `${path}.code`);
    if (widgetData.code === WIDGET_ROW_CONTAINER.code) return createDesignerFormFailure("行容器不能嵌套在行容器中", path);
    try {
        if (definition.getAttributes) {
            (widgetData as Mutable<WidgetBaseData>).componentAttributes = buildWidgetComponentAttributes(widgetData);
        } else {
            delete (widgetData as Mutable<WidgetBaseData>).componentAttributes;
        }
        return { ok: true, data: widgetData };
    } catch {
        return createDesignerFormFailure(`组件运行属性恢复失败：${widgetData.code}`, path);
    }
};

/**
 * @description 校验并恢复顶层 Widget，行容器仅恢复一层普通子节点。
 * @param widgetValue 待恢复的顶层节点。
 * @param path 节点在文档中的数据路径。
 * @returns 成功时返回已恢复的顶层节点，失败时返回首个路径化错误。
 */
const restoreTopWidget = function (widgetValue: unknown, path: string): DesignerFormResult<WidgetBaseData> {
    if (!isRecord(widgetValue)) return createDesignerFormFailure("组件节点必须是对象", path);
    if (widgetValue.code !== WIDGET_ROW_CONTAINER.code) {
        // 先验证公共契约，再执行组件特定恢复，错误保留完整路径。
        const validated = validateWidgetBaseData(widgetValue, path);
        return validated.ok ? restoreNormalWidget(validated.data, path) : validated;
    }
    if (typeof widgetValue.id !== "string" || !widgetValue.id) return createDesignerFormFailure("行容器 id 必须是非空字符串", `${path}.id`);
    if (!isRecord(widgetValue.settingData)) return createDesignerFormFailure("行容器 settingData 必须是对象", `${path}.settingData`);
    if (!Array.isArray(widgetValue.widgets)) return createDesignerFormFailure("行容器 widgets 必须是数组", `${path}.widgets`);
    // 先验证公共契约，再执行组件特定恢复，错误保留完整路径。
    const validated = validateWidgetBaseData(widgetValue, path);
    if (!validated.ok) return validated;
    if (!isWidgetRowContainerData(validated.data)) return createDesignerFormFailure("行容器基础字段或布局设置无效", path);
    if (!getWidgetDefinition(WIDGET_ROW_CONTAINER.code)) return createDesignerFormFailure(`未知组件类型：${WIDGET_ROW_CONTAINER.code}`, `${path}.code`);
    // 保留行容器对象身份，子节点运行属性在当前独立副本上恢复。
    const row = validated.data;
    for (let index = 0; index < row.widgets.length; index += 1) {
        const childPath = `${path}.widgets[${index}]`;
        const child = validateWidgetBaseData(row.widgets[index], childPath);
        if (!child.ok) return child;
        const childResult = restoreNormalWidget(child.data, childPath);
        if (!childResult.ok) return childResult;
    }
    delete (row as Mutable<WidgetRowContainerData>).componentAttributes;
    return { ok: true, data: row };
};

/**
 * @description 从未知 JSON 兼容值中恢复独立的表单设计文档。
 * @param value 文档对象或由其他持久化封装提供的文档候选。
 * @returns 成功时返回已完成基础校验和 componentAttributes 重建的 V1 文档，失败时返回具体路径。
 * @remarks 恢复过程先生成不含运行属性的 JSON 副本，再在副本上校验和构建属性，调用方可以原子提交结果且不会污染输入对象。
 */
export const restoreDesignerFormDocument = function (value: unknown): DesignerFormResult<DesignerFormDocumentV1> {
    // 不可信输入只在 JSON 边界保持 unknown，通过守卫后使用具体领域类型。
    let documentValue: unknown;
    try {
        const text = JSON.stringify(value, (key, item) => (key === "componentAttributes" ? undefined : item));
        if (!text) return createDesignerFormFailure("表单设计文档为空");
        documentValue = JSON.parse(text);
    } catch {
        return createDesignerFormFailure("表单设计文档不是有效的 JSON 数据");
    }
    if (!isRecord(documentValue)) return createDesignerFormFailure("表单设计文档必须是对象");
    if (documentValue.schemaVersion !== DESIGNER_FORM_DOCUMENT_SCHEMA_VERSION) {
        return createDesignerFormFailure("表单设计文档版本不受支持", "$.schemaVersion");
    }
    if (documentValue.savedAt !== undefined && !isIsoDateTime(documentValue.savedAt)) {
        return createDesignerFormFailure("表单文档保存时间无效", "$.savedAt");
    }
    if (!isRecord(documentValue.form)) return createDesignerFormFailure("表单设计文档 form 必须是对象", "$.form");
    // 根结构先验证，失败不会对外部源或当前画布产生任何修改。
    const formValue = documentValue.form;
    if (typeof formValue.id !== "string" || !formValue.id) return createDesignerFormFailure("表单 id 必须是非空字符串", "$.form.id");
    if (formValue.code !== WIDGET_FORM_CODE) return createDesignerFormFailure("表单 code 无效", "$.form.code");
    if (!isRecord(formValue.formAttributes)) return createDesignerFormFailure("表单 formAttributes 必须是对象", "$.form.formAttributes");
    if (!isRecord(formValue.componentFunctions)) return createDesignerFormFailure("表单 componentFunctions 必须是对象", "$.form.componentFunctions");
    if (!isRecord(formValue.settingData)) return createDesignerFormFailure("表单 settingData 必须是对象", "$.form.settingData");
    if (!Array.isArray(formValue.widgets)) return createDesignerFormFailure("表单 widgets 必须是数组", "$.form.widgets");
    if (!isWidgetFormData(formValue)) return createDesignerFormFailure("表单根字段结构无效", "$.form");
    for (let index = 0; index < formValue.widgets.length; index += 1) {
        const widgetResult = restoreTopWidget(formValue.widgets[index], `$.form.widgets[${index}]`);
        if (!widgetResult.ok) return widgetResult;
    }
    return {
        ok: true,
        data: {
            schemaVersion: DESIGNER_FORM_DOCUMENT_SCHEMA_VERSION,
            ...(documentValue.savedAt === undefined ? {} : { savedAt: documentValue.savedAt }),
            form: formValue
        }
    };
};
