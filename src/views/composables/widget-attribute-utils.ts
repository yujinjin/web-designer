/**
 * @fileoverview 提供 Widget 完整静态属性构建所需的非空字段选择工具。
 * @remarks 本模块不负责动态脚本、组件默认值或设置态属性写回，具体 Widget 直接维护自身 componentAttributes。
 */

/**
 * @description 从设置源中选择允许传给组件的非空字段，并合并明确的派生属性。
 * @param settingData 设置面板保存的完整可序列化数据。
 * @param keys 当前组件允许透传的字段名列表。
 * @param derivedAttributes 由 control 或稳定规则生成的额外属性。
 * @returns 不含 null/undefined 设置值的新属性对象。
 * @remarks false、0 和空字符串均可能是有意义的组件值，只有 null 与 undefined 被省略。
 */
export const buildDefinedAttributes = function (settingData: Record<string, any>, keys: readonly string[], derivedAttributes: Record<string, any> = {}): Record<string, any> {
    const attributes: Record<string, any> = {};
    keys.forEach(key => {
        const value = settingData[key];
        if (value !== null && value !== undefined) {
            attributes[key] = value;
        }
    });
    return Object.assign(attributes, derivedAttributes);
};
