/**
 * @fileoverview 验证领域模块在真实字段、脚本和树结构上的行为边界。
 * @remarks 不断言源码文本或由被测方法推导期望值，重点防止事件上下文串用、提交映射丢失与模板实例相互污染。
 */
import { describe, expect, it } from "vitest";
import { type WidgetHTMLData, type WidgetSelectData, type WidgetTextData } from "@/views/types";
import { useCreateDefaultData as createForm, useSettingDataValueChange as changeForm } from "@/views/domain/form/form-adapter";
import { useFlatWidgetList, useFormItemRules, useSubmitFormData } from "@/views/domain/form/form-runtime";
import { createWidgetDefaultData, getWidgetComponentEvents } from "@/views/domain/widgets/registry";
import { cloneWidgetData, findWidgetData, getNextSelectedId, isRowContainerWidget } from "@/views/domain/widgets/tree";
import { useCreateDefaultData as createText } from "@/views/domain/widgets/adapters/text";
import { useCreateDefaultData as createRow, useSettingDataValueChange as changeRow } from "@/views/domain/widgets/adapters/row-container";
import { useAttributes as buildUpload, useCreateDefaultData as createUpload, useSettingDataValueChange as changeUpload } from "@/views/domain/widgets/adapters/upload";
import { bindAmount, bindTemplateVisibility, choices, createTemplateField, createTemplateRow, options, question, setTemplateChangeHandler } from "@/views/domain/templates/builders";
import { inspectWidgetDynamicContent, isIsoDateTime, isRecord, validateWidgetBaseData } from "@/views/domain/document/validation";
import { createDesignerFormFailure } from "@/views/domain/document/types";

describe("组件树的身份与层级边界", () => {
    it("子项查找保留原始同级数组，可直接用于删除", () => {
        const row = createRow();
        const first = createText();
        const second = createText();
        row.widgets.push(first, second);
        const result = findWidgetData([row], second.id)!;
        expect(result.parentWidgetData).toBe(row);
        expect(result.widgetIndex).toBe(1);
        expect(result.siblings).toBe(row.widgets);
        result.siblings.splice(result.widgetIndex, 1);
        expect(row.widgets).toEqual([first]);
    });

    it("空身份、未知身份和损坏容器不作为有效命中", () => {
        const widget = createText();
        expect(findWidgetData([widget], null)).toBeNull();
        expect(findWidgetData([widget], "不存在")).toBeNull();
        expect(isRowContainerWidget(null)).toBe(false);
        expect(isRowContainerWidget({ ...widget, code: "row-container" })).toBe(false);
        expect(isRowContainerWidget({ ...createRow(), widgets: null } as never)).toBe(false);
    });

    it("复制后重建完整字段身份且不共享选项设置", () => {
        const field = createTemplateField("select", "选择", { settings: { options: choices(["甲", "乙"]) } }) as WidgetSelectData;
        const row = createTemplateRow("宽窄布局", [field], [12]);
        const copied = cloneWidgetData(row);
        if (!isRowContainerWidget(copied)) throw new Error("复制结果应是行容器");
        const child = copied.widgets[0];
        expect(copied.id).not.toBe(row.id);
        expect(child.id).not.toBe(field.id);
        expect(child.propName).toBe(child.id);
        expect(child.settingData!.propName).toBe(child.id);
        expect(child.formAttributes!.prop).toBe(child.id);
        copied.settingData.spans[0] = 24;
        (child as WidgetSelectData).settingData.label = "仅修改副本";
        expect(row.settingData.spans).toEqual([12]);
        expect(field.settingData!.label).toBe("选择");
    });

    it("未知组件和循环设计数据拒绝复制，不污染原对象", () => {
        const widget = createText();
        expect(() => cloneWidgetData({ ...widget, code: "missing" })).toThrow("未知组件类型");
        const cyclic = { ...widget, settingData: { ...widget.settingData, self: widget } };
        cyclic.settingData.self = cyclic as typeof widget;
        expect(() => cloneWidgetData(cyclic)).toThrow(TypeError);
        expect(widget.code).toBe("text");
    });

    it("删除中间、末尾和唯一节点分别选择后继、前驱和空状态", () => {
        const first = createText();
        const last = createText();
        expect(getNextSelectedId([first, last], 1)).toBe(last.id);
        expect(getNextSelectedId([first], 1)).toBe(first.id);
        expect(getNextSelectedId([], 0)).toBeNull();
    });
});

describe("表单运行与规则上下文", () => {
    it("展平保留显示节点和隐藏字段，提交采用业务路径而非组件id", () => {
        const form = createForm();
        const field = createText();
        field.propName = "person.name";
        field.isShow = false;
        const unbound = createText();
        unbound.propName = null;
        const row = createRow();
        row.widgets.push(field);
        form.widgets.push(row, unbound);
        expect(useFlatWidgetList(form.widgets)).toEqual([field, unbound]);
        expect(useSubmitFormData(form, { [field.id]: "张三", [unbound.id]: "不提交" })).toEqual({ person: { name: "张三" } });
    });

    it("未配置规则返回空列表，空消息回落且非法正则向上抛出", () => {
        const form = createForm();
        expect(useFormItemRules({ required: false }, {}, form)).toEqual([]);
        const rules = useFormItemRules({ required: true, requiredMessage: "", regExp: "^\\d+$", regExpMessage: "" }, {}, form);
        expect(rules[0]).toEqual({ required: true, message: "请输入" });
        expect((rules[1].pattern as RegExp).test("120")).toBe(true);
        expect((rules[1].pattern as RegExp).test("abc")).toBe(false);
        expect(rules[1].message).toBe("格式错误");
        expect(() => useFormItemRules({ required: false, regExp: "[" }, {}, form)).toThrow(SyntaxError);
    });

    it("自定义校验收到当前上下文并暴露运行异常", () => {
        const form = createForm();
        const values = { limit: 10 };
        const body = "callback(value <= formData.limit && widgetFormData.code === 'form' ? undefined : '超限'); return value;";
        const validator = useFormItemRules({ required: false, validate: body }, values, form)[0].validator!;
        const results: Array<string | undefined> = [];
        expect(validator({}, 11, error => results.push(error as string | undefined), {}, {})).toBe(11);
        values.limit = 20;
        validator({}, 11, error => results.push(error as string | undefined), {}, {});
        expect(results).toEqual(["超限", undefined]);
        const invalid = useFormItemRules({ required: false, validate: "throw new Error('校验失败')" }, {}, form)[0].validator!;
        expect(() => invalid({}, 1, () => {}, {}, {})).toThrow("校验失败");
    });

    it("根表单工厂相互隔离，设置脚本只保存不执行", () => {
        const first = createForm();
        const second = createForm();
        first.widgets.push(createText());
        changeForm(first, "labelWidth", 180);
        changeForm(first, "onInit", "function onInit(widgetFormData, formData) {\n throw new Error('不应执行');\n}");
        expect(first.formAttributes.labelWidth).toBe(180);
        expect(first.settingData.labelWidth).toBe(180);
        expect(first.componentFunctions.init).toBe(" throw new Error('不应执行');");
        expect(second.widgets).toEqual([]);
        expect(second.formAttributes.labelWidth).toBe(120);
        changeForm(first, "onInit", null);
        expect(first.componentFunctions.init).toBeNull();
    });
});

describe("真实组件事件协议", () => {
    it.each([
        ["select", "removeTag", "tagValue", "标签甲"],
        ["select", "visibleChange", "visible", true],
        ["cascader", "removeTag", "value", ["省", "市"]],
        ["cascader", "expandChange", "value", ["省"]],
        ["cascader", "visibleChange", "visible", false],
        ["color-picker", "activeChange", "value", "#123456"],
        ["slider", "input", "value", 60],
        ["text", "input", "value", "输入中"]
    ] as const)("%s.%s传递声明的独立事件参数", (code, eventName, parameterName, value) => {
        const widget = createWidgetDefaultData(code);
        const values: Record<string, unknown> = {};
        (widget.componentFunctions as Record<string, string | null>)[eventName] = `formData.received = ${parameterName};`;
        getWidgetComponentEvents(widget, values, createForm())[eventName](value);
        expect(values.received).toBe(value);
    });

    it.each(["select", "cascader", "date-picker", "time-picker", "time-select", "color-picker"])("%s.clear不依赖事件值并保留表单上下文", code => {
        const widget = createWidgetDefaultData(code);
        const form = createForm();
        const values: Record<string, unknown> = {};
        (widget.componentFunctions as Record<string, string | null>).clear = "formData.cleared = widgetFormData.code;";
        getWidgetComponentEvents(widget, values, form).clear();
        expect(values.cleared).toBe("form");
    });

    it.each(["text", "radio-group", "checkbox-group", "select", "cascader", "date-picker", "time-picker", "time-select", "switch", "rate", "color-picker", "slider"])(
        "%s change传递事件值与原始表单引用",
        code => {
            const widget = createWidgetDefaultData(code);
            const form = createForm();
            const values: Record<string, unknown> = {};
            (widget.componentFunctions as Record<string, string | null>).change = "formData.received = value; widgetFormData.widgets[0].isShow = false;";
            form.widgets.push(widget);
            const events = getWidgetComponentEvents(widget, values, form);
            const value = ["选项甲", "选项乙"];
            events.change(value);
            expect(values.received).toBe(value);
            expect(widget.isShow).toBe(false);
            (widget.componentFunctions as Record<string, string | null>).change = "throw new Error('脚本异常');";
            expect(() => getWidgetComponentEvents(widget, values, form).change(value)).toThrow("脚本异常");
        }
    );

    it("数值输入change保留新旧值顺序", () => {
        const widget = createWidgetDefaultData("input-number");
        (widget.componentFunctions as Record<string, string | null>).change = "formData.delta = currentValue - oldValue;";
        const values: Record<string, unknown> = {};
        getWidgetComponentEvents(widget, values, createForm()).change(8, 3);
        expect(values.delta).toBe(5);
    });

    it.each(["text", "input-number", "select", "date-picker", "time-picker", "time-select", "color-picker"])("%s focus读取实时值而不是事件创建时的旧值", code => {
        const widget = createWidgetDefaultData(code);
        (widget.componentFunctions as Record<string, string | null>).focus = "formData.focused = [e.type, value, widgetFormData.code];";
        const values: Record<string, unknown> = { [widget.id]: "旧值" };
        const events = getWidgetComponentEvents(widget, values, createForm());
        values[widget.id] = "新值";
        events.focus({ type: "focus" });
        expect(values.focused).toEqual(["focus", "新值", "form"]);
    });
});

describe("上传属性钩子的真实参数协议", () => {
    it.each([
        ["onPreview", "uploadFile.mark = uploadFile.name;", "a.txt"],
        ["onRemove", "uploadFile.mark = uploadFiles[0].name;", "b.txt"],
        ["onSuccess", "uploadFile.mark = response.status + ':' + uploadFiles[0].name;", "ok:b.txt"],
        ["onError", "uploadFile.mark = error.message + ':' + uploadFiles[0].name;", "失败:b.txt"],
        ["onProgress", "uploadFile.mark = evt.percent + ':' + uploadFiles[0].name;", "50:b.txt"],
        ["onChange", "uploadFile.mark = uploadFiles[0].name;", "b.txt"],
        ["onExceed", "files[0].mark = uploadFiles[0].name;", "b.txt"]
    ] as const)("%s完整物化和设置局部同步保持相同参数顺序", (hook, body, expected) => {
        const widget = createUpload();
        changeUpload(widget, hook, `function ${hook}() {\n${body}\n}`);
        for (const attributes of [widget.componentAttributes!, buildUpload(widget)]) {
            const file = { name: "a.txt", mark: "", uid: 1, status: "success" as const };
            const files = [{ name: "b.txt", uid: 2, status: "success" as const }];
            if (hook === "onSuccess") attributes[hook]!({ status: "ok" }, file as never, files);
            else if (hook === "onError") attributes[hook]!(new Error("失败") as never, file as never, files);
            else if (hook === "onProgress") attributes[hook]!({ percent: 50 } as never, file as never, files);
            else if (hook === "onExceed") attributes[hook]!([file] as never, files);
            else if (hook === "onPreview") attributes[hook]!(file as never);
            else attributes[hook]!(file as never, files);
            expect(file.mark).toBe(expected);
        }
        changeUpload(widget, hook, null);
        expect(widget.componentAttributes).not.toHaveProperty(hook);
    });

    it("上传与删除前置校验支持false和Promise拒绝", async () => {
        const widget = createUpload();
        changeUpload(widget, "beforeUpload", "function beforeUpload(rawFile) {\n return rawFile.size < 100;\n}");
        changeUpload(widget, "beforeRemove", "function beforeRemove(uploadFile, uploadFiles) {\n return Promise.reject(new Error(uploadFile.name + ':' + uploadFiles.length));\n}");
        expect(widget.componentAttributes!.beforeUpload!({ size: 100 } as never)).toBe(false);
        expect(widget.componentAttributes!.beforeUpload!({ size: 99 } as never)).toBe(true);
        await expect(widget.componentAttributes!.beforeRemove!({ name: "a.txt" } as never, [])).rejects.toThrow("a.txt:0");
    });
});

describe("模板构建器的可编辑性与实例边界", () => {
    it.each([false, 0, "", null])("显式默认值%s不被truthy判断丢弃", defaultValue => {
        const field = createTemplateField("text", "自定义标题", { defaultValue, settings: { labelPosition: "right" } }) as WidgetTextData;
        expect(field.name).toBe("文本框");
        expect(field.defaultValue).toBe(defaultValue);
        expect(field.settingData!.defaultValue).toBe(defaultValue);
        expect(field.formAttributes!.labelPosition).toBe("right");
    });

    it("隐藏模板字段保留禁用状态且问卷允许显式标签布局覆盖", () => {
        const field = question("text", "补充题", { hidden: true, settings: { control: ["disabled"], labelPosition: "left" } }) as WidgetTextData;
        expect(field.isShow).toBe(false);
        expect(field.settingData!.control).toEqual(["disabled", "isHidden"]);
        expect(field.componentAttributes!.disabled).toBe(true);
        expect(field.formAttributes!.labelPosition).toBe("left");
    });

    it("行容器拒绝空行和超限，列宽复制不持有外部数组", () => {
        expect(() => createTemplateRow("空行", [])).toThrow("字段数量无效");
        expect(() =>
            createTemplateRow(
                "超限",
                Array.from({ length: 7 }, () => createText())
            )
        ).toThrow("字段数量无效");
        const spans = [8, 16];
        const row = createTemplateRow("比例", [createText(), createText()], spans);
        spans[0] = 24;
        expect(row.settingData.spans).toEqual([8, 16]);
        expect(() => createTemplateField("row-container", "非法字段")).toThrow("模板字段类型无效");
    });

    it("显隐脚本严格比较并只作用目标，不修改初始control", () => {
        const controller = createTemplateField("radio-group", "开关");
        const target = createTemplateField("text", "补充", { hidden: true });
        const unrelated = createTemplateField("text", "其他", { hidden: true });
        const form = createForm();
        form.widgets.push(controller, createTemplateRow("行内", [target, unrelated]));
        bindTemplateVisibility(controller, [target], "1");
        const events = getWidgetComponentEvents(controller, {}, form);
        events.change(1);
        expect(target.isShow).toBe(false);
        events.change("1");
        expect(target.isShow).toBe(true);
        expect(target.settingData!.control).toEqual(["isHidden"]);
        expect(unrelated.isShow).toBe(false);
    });

    it("金额计算两侧事件均生效，零值合法且结果两位小数", () => {
        const quantity = createTemplateField("input-number", "数量");
        const price = createTemplateField("input-number", "价格");
        const total = createTemplateField("input-number", "金额");
        const form = createForm();
        form.widgets.push(quantity, price, total);
        bindAmount(quantity, price, total);
        const values = { [quantity.id]: 3, [price.id]: 0.335 };
        getWidgetComponentEvents(price, values, form).change(0.335);
        expect(values[total.id]).toBe(1.01);
        values[quantity.id] = 0;
        getWidgetComponentEvents(quantity, values, form).change(0);
        expect(values[total.id]).toBe(0);
        expect(() => setTemplateChangeHandler(createTemplateField("html", "HTML"), "")).toThrow("不支持 change 联动");
    });

    it("独立选项数组不共享对象，语义选项保持原值", () => {
        const first = options();
        first[0].label = "修改";
        expect(options()[0].label).toBe("选项一");
        expect(choices(["甲", "乙"])).toEqual([
            { label: "甲", value: "甲" },
            { label: "乙", value: "乙" }
        ]);
    });

    it.fails("已知缺陷：行容器gutter非法数字应回落为零而非被末尾赋值覆盖", () => {
        const row = createRow();
        changeRow(row, "gutter", Number.NaN);
        expect(row.settingData.gutter).toBe(0);
    });
});

describe("文档校验的输入与执行边界", () => {
    it("文档错误保留具体定位，无路径时不生成伪路径字段", () => {
        expect(createDesignerFormFailure("错误", "$.form.widgets[0]")).toEqual({ ok: false, message: "错误", path: "$.form.widgets[0]" });
        expect(createDesignerFormFailure("错误")).toEqual({ ok: false, message: "错误" });
    });
    it.each([null, [], 1, "text"])("非对象输入%s返回false", value => expect(isRecord(value)).toBe(false));

    it("ISO日期必须精确无损，节点错误提供具体路径", () => {
        expect(isIsoDateTime("2026-10-13T00:00:00.000Z")).toBe(true);
        expect(isIsoDateTime("2026-10-13")).toBe(false);
        expect(isIsoDateTime("2026-02-30T00:00:00.000Z")).toBe(false);
        expect(validateWidgetBaseData({ ...createText(), id: "" }, "$.field")).toMatchObject({ ok: false, path: "$.field.id" });
        expect(validateWidgetBaseData({ ...createText(), settingData: [] }, "$.field")).toMatchObject({ ok: false, path: "$.field.settingData" });
    });

    it("脚本检查只编译不执行，非法脚本暴露具体函数路径", () => {
        const field = createText();
        const content = { hasDynamicScripts: false, hasHtml: false };
        field.componentFunctions.change = "throw new Error('禁止在检查阶段执行');";
        expect(inspectWidgetDynamicContent(field, "$.field", content, () => ({ ok: true, data: "" }))).toBeNull();
        expect(content.hasDynamicScripts).toBe(true);
        field.componentFunctions.change = "if (";
        expect(inspectWidgetDynamicContent(field, "$.field", content, () => ({ ok: true, data: "" }))).toMatchObject({ ok: false, path: "$.field.componentFunctions.change" });
    });

    it("HTML校验使用持久化文本，失败携带路径且不标记为可导入内容", () => {
        const field = createTemplateField("html", "HTML", { defaultValue: "<b>安全文本</b>" }) as WidgetHTMLData;
        const content = { hasDynamicScripts: false, hasHtml: false };
        expect(inspectWidgetDynamicContent(field, "$.html", content, html => ({ ok: true, data: html }))).toBeNull();
        expect(content.hasHtml).toBe(true);
        field.settingData!.defaultValue = "<script>alert(1)</script>";
        const rejectedContent = { hasDynamicScripts: false, hasHtml: false };
        expect(inspectWidgetDynamicContent(field, "$.html", rejectedContent, () => ({ ok: false, message: "危险脚本" }))).toEqual({
            ok: false,
            message: "危险脚本",
            path: "$.html.settingData.defaultValue"
        });
        expect(rejectedContent.hasHtml).toBe(false);
    });
});
