/**
 * @fileoverview 表单级数据适配模块，负责创建设计数据、同步表单设置、维护渲染值、生成提交对象和校验规则。
 * @remarks
 * 渲染值使用 Vue `reactive` 管理，并只监听字段 id 集合；这样既能在增删组件时同步键集合，又不会因默认值或设置变化覆盖用户当前输入。
 * 行容器在此被扁平化为普通字段列表，提交阶段再按 `propName` 路径组装业务对象，使布局结构与业务数据结构相互独立。
 * 自定义校验通过 `new Function` 注入受控参数执行，仅适用于可信设计配置；非法正则、脚本语法及运行异常会直接向调用方传播。
 * `onInit` 当前仅被转换并存入 componentFunctions，本模块没有执行入口，接入初始化生命周期时需要由外层显式调用。
 */
import { reactive, watch } from "vue";
import { type FormItemRule } from "element-plus";
import { randomId, setObjectProperty } from "@yujinjin/utils";
import { type WidgetData, type WidgetFormData, type WidgetNormalData } from "../types";

/** 表单根节点的稳定类型标识；用于生成实例 id，不参与普通组件注册分组。 */
export const WIDGET_FORM_CODE = "form";

/**
 * @description 创建一份独立的表单设计数据。
 * @returns 尚未包含字段的新表单设计数据。
 * @remarks `settingData` 保存设置面板使用的可编辑值，`formAttributes` 保存传给 ElForm 的运行态属性，二者分离是为了避免渲染组件直接依赖设置面板结构。
 */
export function useCreateDefaultData(): WidgetFormData {
    return {
        id: WIDGET_FORM_CODE.replace(/-/g, "_") + "_" + randomId(),
        code: WIDGET_FORM_CODE,
        formAttributes: {
            inline: false,
            labelPosition: "left",
            labelWidth: 120,
            disabled: false
        },
        componentFunctions: {
            init: null
        },
        settingData: {
            inline: false,
            labelPosition: "left",
            labelWidth: 120,
            onInit: `function onInit(widgetFormData, formData) {
    // 请在这里编写函数体逻辑，可直接使用 widgetFormData/formData 参数
}`
        },
        widgets: []
    };
}

/**
 * @description 同步表单级设置。
 * @param data 将被原地更新的表单设计数据。
 * @param fileName 发生变化的设置字段。
 * @param value 设置字段的新值。
 * @returns 无返回值。
 * @remarks 可直接渲染的字段写入 formAttributes，脚本字段只保存函数体到 componentFunctions，最后始终保留设置面板原文。onInit 必须是完整函数文本，格式不符合约定时不会主动修复。
 */
export function useSettingDataValueChange(data: WidgetFormData, fileName: keyof WidgetFormData["settingData"], value: any) {
    switch (fileName) {
        case "inline":
        case "labelPosition":
        case "labelWidth":
            data.formAttributes[fileName] = value;
            break;
        case "onInit": {
            // 运行时使用 new Function 注入上下文，只需要函数体；设置态保留完整源码，编辑器才能再次展示函数声明和参数提示。
            data.componentFunctions.init = value ? value.split("\n").slice(1, -1).join("\n") : null;
        }
    }
    (data.settingData as any)[fileName] = value;
}

/**
 * @description 将顶层普通字段和行容器中的直接子字段转换为统一列表。
 * @param widgets 表单顶层节点列表。
 * @returns 保持原有排列顺序的普通字段新数组。
 * @remarks 行容器不产生提交值，且业务禁止容器嵌套，因此这里只展开一层，不递归接受非法结构。
 */
export function useFlatWidgetList(widgets: Array<WidgetData>): WidgetNormalData[] {
    return widgets.reduce<WidgetNormalData[]>((list, item) => {
        // 行容器不产生字段值，只把其直接子组件加入结果；其他节点保持原有顺序加入列表。
        if ("widgets" in item && Array.isArray(item.widgets)) {
            list.push(...item.widgets);
        } else {
            list.push(item as WidgetNormalData);
        }
        return list;
    }, []);
}

/**
 * @description 创建并持续维护表单渲染值对象。
 * @param data 表单设计数据；内部 watcher 持续观察其字段身份集合。
 * @returns 可直接作为 ElForm model 使用的响应式对象，由内部 watcher 持续同步字段集合。
 * @remarks 新字段首次出现时才应用默认值；之后修改默认值、排序或插入其他字段都不能覆盖用户输入。被删除字段同步移除，避免残留值进入提交数据。
 */
export function useFormRenderData(data: WidgetFormData) {
    // 保存渲染阶段按组件 ID 索引的实时表单值。
    const formData = reactive<Record<string, any>>({});
    /**
     * @description 按当前字段列表同步渲染值的键集合。
     * @returns 无返回值。
     * @remarks 只为首次出现的字段写入默认值，已有键无论值是否为空都不得覆盖。
     */
    const syncFormData = function () {
        // 展平顶层组件和行容器子组件，统一参与表单值同步。
        const widgets = useFlatWidgetList(data.widgets);
        // 缓存当前有效组件 ID，供残留字段清理时快速判断。
        const widgetIds = new Set(widgets.map(item => item.id));
        // 删除已经不存在的字段，否则设计器删除组件后旧值仍可能被误认为有效表单数据。
        Object.keys(formData).forEach(id => {
            if (!widgetIds.has(id)) {
                delete formData[id];
            }
        });
        widgets.forEach(item => {
            // 判断属性是否存在而不是判断值是否为空，因为 null、false、0 和空字符串都可能是用户主动输入的合法值。
            if (!Object.prototype.hasOwnProperty.call(formData, item.id)) {
                formData[item.id] = item.defaultValue ?? null;
            }
        });
    };
    syncFormData();
    /**
     * @description 监听字段身份和顺序变化，并同步表单渲染值的键集合。
     * @remarks 只监听字段 id 快照，刻意忽略默认值和其他设置变化，保证默认值仅在字段首次创建时写入，不覆盖用户输入。
     */
    watch(
        () =>
            useFlatWidgetList(data.widgets)
                .map(item => item.id)
                .join(","),
        () => {
            // 字段增删或排序后统一清理失效键，并只为新字段应用默认值。
            syncFormData();
        }
    );
    return formData;
}

/**
 * @description 将按组件 id 保存的渲染值转换为按业务字段名保存的提交对象。
 * @param data 表单设计数据。
 * @param formData 当前表单渲染值。
 * @returns 按 propName 路径组装的新业务对象。
 * @remarks propName 支持路径语义，交由 setObjectProperty 构造嵌套对象；未配置 propName 的节点不会进入提交结果。
 */
export function useSubmitFormData(data: WidgetFormData, formData: Record<string, any>) {
    // 按业务 propName 路径逐步构建最终提交对象。
    const submitData: Record<string, any> = {};
    useFlatWidgetList(data.widgets).forEach(item => {
        if (item.propName) {
            setObjectProperty(submitData, item.propName, formData[item.id]);
        }
    });
    return submitData;
}

/**
 * @description 根据字段配置生成 Element Plus 校验规则。
 * @param options 字段的必填、正则及自定义校验配置。
 * @param formData 当前表单渲染值，注入自定义校验脚本。
 * @param widgetFormData 所属表单设计数据，注入自定义校验脚本。
 * @returns 按必填、正则、自定义校验顺序生成的新规则数组。
 * @throws 非法正则会在创建规则时抛错；自定义脚本语法或运行异常会在校验时原样抛出。
 * @remarks 校验配置只应来自可信设计数据，本层不吞掉异常，以便暴露配置错误。
 */
export function useFormItemRules(
    {
        required,
        requiredMessage,
        regExp,
        regExpMessage,
        validate
    }: { required: boolean; requiredMessage?: string | null; regExp?: string | null; regExpMessage?: string | null; validate?: string | null },
    formData: Record<string, any>,
    widgetFormData: WidgetFormData
) {
    // 收集当前字段启用的 Element Plus 表单校验规则。
    const rules: Array<FormItemRule> = [];
    if (required) {
        rules.push({ required: true, message: requiredMessage || "请输入" });
    }
    if (regExp) {
        rules.push({ pattern: new RegExp(regExp), message: regExpMessage || "格式错误" });
    }
    if (validate) {
        rules.push({
            /**
             * @description 执行设计器配置的自定义校验脚本。
             * @param rule Element Plus 当前校验规则；为兼容其回调签名保留，配置脚本不接收该参数。
             * @param value 当前字段值。
             * @param callback 校验完成回调，传入错误信息表示失败。
             * @returns 配置脚本的原始返回值。
             * @throws 配置脚本语法错误或执行失败时原样抛出。
             * @remarks 注入参数名和顺序是脚本编辑器对用户承诺的执行协议，不能随意调整。
             */
            validator: (rule: any, value: any, callback: (error?: string) => void) => {
                // 参数名和顺序是脚本编辑器对用户承诺的执行上下文，调整后会破坏已经保存的函数体。
                return new Function("value", "callback", "formData", "widgetFormData", validate)(value, callback, formData, widgetFormData);
            }
        });
    }
    return rules;
}
