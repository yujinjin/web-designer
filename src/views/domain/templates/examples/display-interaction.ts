/**
 * @fileoverview 创建上传、展示和字段联动示例，供模板目录按需实例化。
 * @remarks 每次调用均通过注册工厂生成独立字段身份；仅定义配置和当前实例脚本，不持有 Vue 状态或共享可编辑节点。
 */
import { bindTemplateVisibility, createTemplateDivider, createTemplateField, createTemplateRow } from "../builders";
import { type WidgetData } from "@/views/types";

/**
 * @description 创建普通上传、拖拽上传和图片卡片。
 * @returns 不自动发起网络请求的上传形态对照。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 关闭自动上传以免示例触发请求，列表类型和拖拽状态均由上传组件原生配置呈现。
 */
export const createUploadModes = function (): WidgetData[] {
    return [
        createTemplateField("upload", "文件列表", { settings: { autoUpload: false, multiple: true, listType: "text" } }),
        createTemplateField("upload", "拖拽上传", { settings: { autoUpload: false, drag: true, listType: "text", labelPosition: "top" } }),
        createTemplateField("upload", "图片卡片", { settings: { autoUpload: false, accept: "image/*", listType: "picture-card", limit: 3, labelPosition: "top" } })
    ];
};

/**
 * @description 创建展示组件配置，而非给所有模板加标题。
 * @returns HTML、两种提示主题及分割线示例。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 分割线仅作为自身配置示例插入，不自动成为其他模板的装饰标题。
 */
export const createDisplayBlocks = function (): WidgetData[] {
    return [
        createTemplateField("html", "HTML", { defaultValue: "<p><strong>HTML 展示</strong> · 支持富文本内容</p>" }),
        createTemplateField("alert", "浅色提示", {
            settings: { title: "带图标的浅色提示", description: "说明内容由提示组件配置生成。", type: "info", showIcon: true, closable: false, effect: "light" }
        }),
        createTemplateDivider("分割线示例"),
        createTemplateField("alert", "深色提示", { settings: { title: "居中的深色提示", type: "success", center: true, showIcon: true, closable: false, effect: "dark" } })
    ];
};

/**
 * @description 创建实例内显隐联动、格式校验及跨字段范围校验。
 * @returns 脚本引用当前实例 ID 的可交互字段组。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 先创建被引用字段，再嵌入本次实例 ID；重复拖入仍能独立执行显隐和跨字段校验。
 */
export const createVisibilityValidation = function (): WidgetData[] {
    // 触发当前实例联动的控制字段。
    const controller = createTemplateField("switch", "显示补充项", { defaultValue: false, settings: { activeText: "显示", inactiveText: "隐藏" } });
    // 初始隐藏的补充字段，仅由同实例控制项切换显示。
    const extra = createTemplateField("text", "补充内容", { hidden: true });
    bindTemplateVisibility(controller, [extra], true);
    // 范围校验的参照字段，先创建才能将其 ID 写入另一字段脚本。
    const minimum = createTemplateField("input-number", "最小值", { defaultValue: 10 });
    // 保留当前实例最小值引用的范围上限字段。
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
