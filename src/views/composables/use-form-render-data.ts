/**
 * @fileoverview 维护响应式表单字段值；监听字段身份而非默认值，避免设置变化覆盖用户实时输入。
 */
import { reactive, watch } from "vue";
import { type WidgetFormData } from "@/views/types";
import { useFlatWidgetList } from "@/views/domain/form/form-runtime";

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
