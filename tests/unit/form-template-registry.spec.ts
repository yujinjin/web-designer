/**
 * @fileoverview 验证内置表单区块模板注册、实例隔离、结构校验和跨组件联动。
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { createFormTemplateWidgets, getFormTemplateGroups, getFormTemplateList, validateFormTemplateWidgets } from "@/views/domain/templates/registry";
import { getWidgetComponentEvents, WIDGET_DEFINITIONS } from "@/views/domain/widgets/registry";
import { useCreateDefaultData as createFormDefaultData } from "@/views/domain/form/form-adapter";
import { useFlatWidgetList, useFormItemRules } from "@/views/domain/form/form-runtime";
import { useCreateDefaultData as createRowDefaultData } from "@/views/domain/widgets/adapters/row-container";
import { useCreateDefaultData as createTextDefaultData } from "@/views/domain/widgets/adapters/text";
import { createTemplateField } from "@/views/domain/templates/builders";
import { type WidgetTextData, type WidgetCascaderData, type WidgetInputNumberData } from "@/views/types";

describe("form template registry", () => {
    it("行业模块有10至14个有效字段，问卷有9至10题且默认至少8题可见", () => {
        for (const template of getFormTemplateList()) {
            if (!["industry", "questionnaire"].includes(template.category)) continue;
            const fields = useFlatWidgetList(template.createWidgets()).filter(item => !["html", "alert", "divider"].includes(item.code));
            if (template.category === "industry") {
                expect(fields.length, template.id).toBeGreaterThanOrEqual(10);
                expect(fields.length, template.id).toBeLessThanOrEqual(14);
                expect(fields.filter(item => item.isShow).length, template.id).toBeGreaterThanOrEqual(9);
            } else {
                expect(fields.length, template.id).toBeGreaterThanOrEqual(9);
                expect(fields.length, template.id).toBeLessThanOrEqual(10);
                expect(fields.filter(item => item.isShow).length, template.id).toBeGreaterThanOrEqual(8);
                expect(
                    template.createWidgets().every(item => item.code !== "row-container"),
                    template.id
                ).toBe(true);
            }
        }
    });
    it("模板初始隐藏勾选与实际状态一致，保留刻意隐藏的分支字段", () => {
        for (const template of getFormTemplateList()) {
            for (const widget of useFlatWidgetList(template.createWidgets())) {
                expect(widget.settingData!.control.includes("isHidden"), `${template.id}:${widget.formAttributes?.label ?? widget.code}`).toBe(!widget.isShow);
            }
        }
        const service = createFormTemplateWidgets("survey-service");
        if (!service.ok) throw new Error(service.message);
        const second = useFlatWidgetList(service.data)[1];
        expect(second.isShow).toBe(true);
        expect(second.settingData!.control).not.toContain("isHidden");
    });
    it("模板标签与组件类型名称分离，设置面板和表单项位置保持一致", () => {
        const field = createTemplateField("text", "右侧对齐标签", { settings: { labelPosition: "right" } }) as WidgetTextData;
        expect(field.name).toBe("文本框");
        expect(field.formAttributes!.label).toBe("右侧对齐标签");
        expect(field.settingData!.label).toBe("右侧对齐标签");
        expect(field.formAttributes!.labelPosition).toBe("right");
        expect(field.settingData!.labelPosition).toBe("right");
    });

    it("模板展示多种标签排版，普通模板不插入装饰性分割线", () => {
        const positions = new Set<string>();
        let withoutDivider = 0;
        for (const template of getFormTemplateList()) {
            const fields = useFlatWidgetList(template.createWidgets());
            fields.forEach(field => {
                if (field.formAttributes?.labelPosition) positions.add(field.formAttributes.labelPosition);
                expect(field.name).toBe(WIDGET_DEFINITIONS.find(definition => definition.meta.code === field.code)!.meta.name);
                if (field.formAttributes) {
                    if (!("labelPosition" in field.settingData!)) throw new Error("表单项缺少可编辑标签位置");
                    expect(field.formAttributes.labelPosition).toBe(field.settingData.labelPosition);
                }
            });
            if (!fields.some(field => field.code === "divider")) withoutDivider++;
        }
        expect([...positions].sort()).toEqual(["left", "right", "top"]);
        expect(withoutDivider).toBeGreaterThanOrEqual(16);
    });
    it("保留配置示例并增加行业及问卷模板，元数据唯一完整", () => {
        const groups = getFormTemplateGroups();
        const templates = getFormTemplateList();

        expect(groups).toHaveLength(10);
        expect(templates).toHaveLength(34);
        expect(groups.find(group => group.code === "industry")?.children).toHaveLength(8);
        expect(groups.find(group => group.code === "questionnaire")?.children).toHaveLength(8);
        expect(new Set(templates.map(item => item.id)).size).toBe(34);
        expect(new Set(templates.map(item => item.previewImage)).size).toBe(34);
        expect(templates.every(item => item.name && item.description && item.previewAlt && item.previewImage.endsWith(".png"))).toBe(true);
    });

    it("每个模板图片都是内容高度与卡片元数据一致的紧凑 PNG", () => {
        for (const template of getFormTemplateList()) {
            const content = readFileSync(fileURLToPath(template.previewImage));
            expect(content.subarray(1, 4).toString("ascii")).toBe("PNG");
            expect(content.readUInt32BE(16)).toBe(720);
            expect(content.readUInt32BE(20)).toBe(template.previewHeight);
            expect(template.previewHeight).toBeGreaterThanOrEqual(100);
            expect(template.previewHeight).toBeLessThanOrEqual(2400);
            expect(content.byteLength).toBeGreaterThan(1000);
        }
    });

    it("全部模板都能创建合法且非空的组件组合", () => {
        for (const template of getFormTemplateList()) {
            const result = createFormTemplateWidgets(template.id);
            expect(result.ok, template.name).toBe(true);
            if (result.ok) {
                expect(result.data.length, template.name).toBeGreaterThan(0);
                expect(validateFormTemplateWidgets(result.data).ok, template.name).toBe(true);
            }
        }
    });

    it("示例覆盖当前注册表中的全部组件类型", () => {
        const covered = new Set<string>();
        for (const template of getFormTemplateList()) {
            const result = createFormTemplateWidgets(template.id);
            if (!result.ok) throw new Error(result.message);
            result.data.forEach(widget => covered.add(widget.code));
            useFlatWidgetList(result.data).forEach(widget => covered.add(widget.code));
        }
        expect(WIDGET_DEFINITIONS.filter(definition => !covered.has(definition.meta.code)).map(definition => definition.meta.code)).toEqual([]);
    });

    it("未知模板返回失败且不会回退创建普通组件", () => {
        const result = createFormTemplateWidgets("missing-template");

        expect(result).toEqual({ ok: false, message: "未知表单模板：missing-template" });
    });

    it("新增行业和问卷模板重复创建不共享字段身份或设置对象", () => {
        for (const template of getFormTemplateList().filter(item => ["industry", "questionnaire"].includes(item.category))) {
            const first = useFlatWidgetList(template.createWidgets());
            const second = useFlatWidgetList(template.createWidgets());
            expect(first.length).toBeGreaterThanOrEqual(4);
            first.forEach((widget, index) => {
                expect(widget.id).not.toBe(second[index].id);
                expect(widget.settingData).not.toBe(second[index].settingData);
                expect(widget.componentAttributes).not.toBe(second[index].componentAttributes);
            });
        }
    });

    it("电商金额计算支持零单价，清空后同步清空金额", () => {
        const result = createFormTemplateWidgets("industry-commerce");
        if (!result.ok) throw new Error(result.message);
        const form = createFormDefaultData();
        form.widgets.push(...result.data);
        const fields = useFlatWidgetList(result.data);
        const quantity = fields.find(item => item.formAttributes?.label === "数量")!;
        const price = fields.find(item => item.formAttributes?.label === "单价")!;
        const total = fields.find(item => item.formAttributes?.label === "商品金额")!;
        const values = { [quantity.id]: 3, [price.id]: 19.99 } as Record<string, any>;
        const events = getWidgetComponentEvents(quantity, values, form);
        events.change(3);
        expect(values[total.id]).toBe(59.97);
        values[price.id] = 0;
        events.change(3);
        expect(values[total.id]).toBe(0);
        values[quantity.id] = null;
        events.change(null);
        expect(values[total.id]).toBeNull();
    });

    it("酒店晚数按日期计算，清空或倒置时清空结果", () => {
        const result = createFormTemplateWidgets("industry-hotel");
        if (!result.ok) throw new Error(result.message);
        const form = createFormDefaultData();
        form.widgets.push(...result.data);
        const fields = useFlatWidgetList(result.data);
        const dates = fields.find(item => item.formAttributes?.label === "入住日期")!;
        const nights = fields.find(item => item.formAttributes?.label === "入住晚数")!;
        const values: Record<string, any> = {};
        const events = getWidgetComponentEvents(dates, values, form);
        events.change(["2026-10-10", "2026-10-13"]);
        expect(values[nights.id]).toBe(3);
        events.change(["2026-10-13", "2026-10-10"]);
        expect(values[nights.id]).toBeNull();
        events.change(null);
        expect(values[nights.id]).toBeNull();
    });

    it("问卷低分与其他原因分支只更新当前实例，切回时隐藏", () => {
        for (const [id, label, shownValue, hiddenValue] of [
            ["survey-satisfaction", "1. 您对本次体验的满意程度", 2, 5],
            ["survey-product", "2. 您遇到哪些问题（可多选）", ["其他"], ["加载慢"]]
        ] as const) {
            const first = createFormTemplateWidgets(id);
            const second = createFormTemplateWidgets(id);
            if (!first.ok || !second.ok) throw new Error("模板创建失败");
            const form = createFormDefaultData();
            form.widgets.push(...first.data, ...second.data);
            const fields = useFlatWidgetList(first.data);
            const controller = fields.find(item => item.formAttributes?.label === label)!;
            const extra = fields.find(item => !item.isShow)!;
            const otherExtra = useFlatWidgetList(second.data).find(item => !item.isShow)!;
            const events = getWidgetComponentEvents(controller, {}, form);
            events.change(shownValue);
            expect(extra.isShow).toBe(true);
            expect(otherExtra.isShow).toBe(false);
            events.change(hiddenValue);
            expect(extra.isShow).toBe(false);
        }
    });

    it("分支问卷邮箱仅在同意回访时必填，关闭分支不被必填拦截", () => {
        const result = createFormTemplateWidgets("survey-branch");
        if (!result.ok) throw new Error(result.message);
        const form = createFormDefaultData();
        form.widgets.push(...result.data);
        const fields = useFlatWidgetList(result.data);
        const follow = fields.find(item => item.code === "switch")!;
        const contact = fields.find(item => item.formAttributes?.label === "4. 回访邮箱")!;
        const failures: Array<Error | undefined> = [];
        const values = { [follow.id]: false };
        const rules = useFormItemRules({ required: false, validate: contact.componentFunctions!.validate }, values, form);
        const validator = rules[0].validator as (...args: any[]) => void;
        validator({}, "", (error?: Error) => failures.push(error));
        values[follow.id] = true;
        validator({}, "", (error?: Error) => failures.push(error));
        validator({}, "test@example.com", (error?: Error) => failures.push(error));
        expect(failures[0]).toBeUndefined();
        expect(failures[1]?.message).toBe("同意回访时请填写邮箱");
        expect(failures[2]).toBeUndefined();
    });

    it("重复创建同一模板会重建完整身份并断开嵌套引用", () => {
        const first = createFormTemplateWidgets("labels-top");
        const second = createFormTemplateWidgets("labels-top");
        expect(first.ok).toBe(true);
        expect(second.ok).toBe(true);
        if (!first.ok || !second.ok) return;

        const firstFields = useFlatWidgetList(first.data);
        const secondFields = useFlatWidgetList(second.data);
        expect(new Set(firstFields.map(item => item.id)).size).toBe(firstFields.length);
        expect(firstFields.map(item => item.id)).not.toEqual(secondFields.map(item => item.id));
        expect(firstFields.map(item => item.propName)).not.toEqual(secondFields.map(item => item.propName));
        expect(first.data[0]).not.toBe(second.data[0]);
        expect(firstFields[0].settingData).not.toBe(secondFields[0].settingData);
        expect(firstFields.every(item => item.componentAttributes !== undefined || ["html", "divider"].includes(item.code))).toBe(true);
    });

    it("拒绝嵌套行容器、重复身份和超限子组件", () => {
        const outer = createRowDefaultData();
        const inner = createRowDefaultData();
        (outer.widgets as unknown[]).push(inner);
        expect(validateFormTemplateWidgets([outer]).ok).toBe(false);

        const duplicated = createTextDefaultData();
        expect(validateFormTemplateWidgets([duplicated, duplicated]).ok).toBe(false);

        const overflow = createRowDefaultData();
        overflow.widgets.push(...Array.from({ length: 7 }, () => createTextDefaultData()));
        expect(validateFormTemplateWidgets([overflow]).ok).toBe(false);
    });

    it("开关联动只修改当前实例中的补充字段", () => {
        const first = createFormTemplateWidgets("visibility-validation");
        const second = createFormTemplateWidgets("visibility-validation");
        if (!first.ok || !second.ok) throw new Error("模板创建失败");
        const firstFields = useFlatWidgetList(first.data);
        const secondFields = useFlatWidgetList(second.data);
        const controller = firstFields.find(item => item.code === "switch")!;
        const firstExtra = firstFields.find(item => item.formAttributes?.label === "补充内容")!;
        const secondExtra = secondFields.find(item => item.formAttributes?.label === "补充内容")!;
        const form = createFormDefaultData();
        form.widgets.push(...first.data);
        const events = getWidgetComponentEvents(controller, {}, form);

        events.change(true);
        expect(firstExtra.isShow).toBe(true);
        expect(secondExtra.isShow).toBe(false);
        events.change(false);
        expect(firstExtra.isShow).toBe(false);
    });

    it("格式校验模板拒绝不是六位数字的输入", () => {
        const result = createFormTemplateWidgets("visibility-validation");
        if (!result.ok) throw new Error(result.message);
        const fields = useFlatWidgetList(result.data);
        const field = fields.find(item => item.formAttributes?.label === "格式校验") as WidgetTextData;
        if (!field.settingData.regExp) throw new Error("模板缺少格式校验规则");
        const pattern = new RegExp(field.settingData.regExp);
        expect(pattern.test("123456")).toBe(true);
        expect(pattern.test("123")).toBe(false);
        expect(pattern.test("abcdef")).toBe(false);
    });

    it("级联模板的多选模型和设置面板 JSON 保持一致", () => {
        const result = createFormTemplateWidgets("cascader-modes");
        if (!result.ok) throw new Error(result.message);
        const fields = useFlatWidgetList(result.data) as WidgetCascaderData[];
        for (const field of fields) {
            expect(JSON.parse(field.settingData.optionsText)).toEqual(field.settingData.options);
        }
        expect(fields[1].defaultValue).toEqual(["leaf-1", "leaf-2"]);
        expect(fields[1].componentAttributes!.props).toMatchObject({ multiple: true, emitPath: false });
    });

    it("最大值按同一模板实例的最小值执行跨字段校验", () => {
        const result = createFormTemplateWidgets("visibility-validation");
        if (!result.ok) throw new Error(result.message);
        const form = createFormDefaultData();
        form.widgets.push(...result.data);
        const fields = useFlatWidgetList(result.data);
        const minimum = fields.find(item => item.formAttributes?.label === "最小值")!;
        const maximum = fields.find(item => item.formAttributes?.label === "最大值") as WidgetInputNumberData;
        const rules = useFormItemRules({ required: false, validate: maximum.componentFunctions!.validate }, { [minimum.id]: 100 }, form);
        const failures: Array<Error | undefined> = [];
        const validator = rules[0].validator as (...args: any[]) => void;
        validator({}, 50, (error?: Error) => failures.push(error));
        validator({}, 120, (error?: Error) => failures.push(error));

        expect(failures[0]?.message).toBe("最大值不能小于最小值");
        expect(failures[1]).toBeUndefined();
        expect(maximum.settingData!.onValidate).toContain(minimum.id);
    });
});
