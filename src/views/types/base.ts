/**
 * @fileoverview 组件共同身份与设置分发协议，供具体组件契约直接引用。
 * @remarks 这里只定义类型，不依赖注册表或运行模块；可选运行属性不属于持久化 JSON。
 */

/**
 * @description 组件专属设置同步函数协议。
 * @param data 将被原地更新的组件数据。
 * @param fileName 发生变化的设置字段。
 * @param value 设置字段的新值。
 * @returns 无返回值。
 */
export type UseSettingDataValueChangeFun = (data: any, fileName: keyof WidgetBaseData["settingData"], value: any) => void;

/**
 * @description 当前选中组件设置值的统一分发函数协议。
 * @param useSettingDataValueChangeFun 当前组件专属设置同步函数。
 * @param fileName 发生变化的设置字段名。
 * @param value 设置字段的新值。
 * @returns 无返回值。
 */
export type ChangeSelectedWidgetSettingDataFun = (useSettingDataValueChangeFun: UseSettingDataValueChangeFun, fileName: string, value: any) => void;

/**
 * @description 所有设计器组件节点共享的身份、显示、默认值和可选运行数据契约。
 */
export interface WidgetBaseData {
    /** 设计器节点实例的全局唯一标识，同时作为渲染表单值键。 */
    readonly id: string;
    /** 节点或表单类型的稳定标识，用于注册表分发和持久化识别。 */
    readonly code: string;
    /** 组件展示名称、行容器名称或上传文件字段名。 */
    readonly name: string;
    /** 设计器和预览中是否渲染当前节点。 */
    isShow: boolean;
    /** 字段首次进入渲染数据时使用的默认值；null 通常表示未设置。 */
    defaultValue: any;
    /** 提交数据使用的业务字段名或嵌套路径；null 表示不进入提交对象。 */
    propName: string | null;
    /** 传递给 ElFormItem 或 ElForm 的运行态表单属性。 */
    readonly formAttributes?: Record<string, any>;
    /** 直接传递给渲染组件的可选运行态缓存；规范 JSON 不包含该字段。 */
    readonly componentAttributes?: Record<string, any>;
    /** 由设置态完整脚本转换得到的运行时函数体集合。 */
    readonly componentFunctions?: Record<string, any>;
    /** 设置面板直接编辑和回显的数据集合。 */
    readonly settingData?: Record<string, any>;
}
