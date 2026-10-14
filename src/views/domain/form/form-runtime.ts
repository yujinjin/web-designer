/**
 * @fileoverview 表单运行期的字段展平、提交对象和规则构建；布局树与业务提交结构相互独立。
 */
import { type FormItemRule } from "element-plus";
import { setObjectProperty } from "@yujinjin/utils";
import { type WidgetData, type WidgetFormData, type WidgetNormalData } from "@/views/types";

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
