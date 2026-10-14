/**
 * @fileoverview 提示组件的临时重挂载状态与恢复编排；WeakMap 按对象身份隔离实例，不进入持久化 JSON。
 */
import { ref, toRaw, type Ref } from "vue";
import { type WidgetAlertData, type WidgetBaseData } from "@/views/types";
import { useSettingDataValueChange } from "@/views/domain/widgets/adapters/alert";

/** 提示节点的临时重挂载标识；弱引用避免删除节点后残留状态，且不进入设计 JSON。 */
const alertRenderKeys = new WeakMap<WidgetBaseData, Ref<number>>();

/**
 * @description 获取提示节点的响应式渲染标识，用于重置 ElAlert 自身的关闭状态。
 * @param widgetData 当前节点，代理和原始对象共享同一状态。
 * @returns 当前节点的临时递增标识。
 * @remarks 以对象身份隔离预览副本和重复实例，不使用可重复的业务 ID 作为全局缓存键。
 */
export function getAlertRenderKey(widgetData: WidgetBaseData): number {
    // 代理和原始对象共同定位同一键，复制或预览快照仍互相隔离。
    const node = toRaw(widgetData);
    // 首次渲染创建 Ref，后续递增会使依赖 key 的 ElAlert 重新挂载。
    let key = alertRenderKeys.get(node);
    if (!key) {
        key = ref(0);
        alertRenderKeys.set(node, key);
    }
    return key.value;
}

/**
 * @description 恢复当前提示的设计显隐，并使 ElAlert 重新挂载以清除内部关闭状态。
 * @param widgetAlertData 由统一设置入口定位的当前提示节点。
 * @returns 无返回值；清除隐藏控制项并递增临时渲染标识，保留内容、样式与运行属性引用。
 * @remarks ElAlert 的 close 只改变内部 visible，单独设置根级 isShow 无法让已关闭的实例再次显示。
 */
export function showAlert(widgetAlertData: WidgetAlertData): void {
    useSettingDataValueChange(
        widgetAlertData,
        "control",
        widgetAlertData.settingData.control.filter(item => item !== "isHidden")
    );
    getAlertRenderKey(widgetAlertData);
    alertRenderKeys.get(toRaw(widgetAlertData))!.value++;
}
