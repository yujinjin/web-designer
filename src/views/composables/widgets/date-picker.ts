/**
 * @fileoverview 日期选择器适配模块，统一维护设计面板数据、Element Plus 日期属性、动态禁用函数和组件事件。
 * @remarks
 * 单日期、日期范围及日期时间模式共用一套数据结构；切换类型时主动清空默认值，避免标量、数组和日期时间格式不兼容造成错误回显。
 * 禁用日期及时分秒规则以可编辑函数模板保存，渲染时才按需包装为组件回调，因此设计数据保持可序列化，也不会为未配置规则创建函数。
 * 动态脚本可读取当前字段值和组件数据，配置必须可信且符合 Element Plus 回调返回约定，异常不会在本模块内被吞掉。
 */
import { randomId } from "@yujinjin/utils";
import { type WidgetDatePickerData, type WidgetFormData } from "@/views/composables/types";

/** 注册表使用的日期选择器稳定 code 与组件库展示元数据。 */
export const WIDGET_DATE_PICKER = {
    code: "date-picker",
    name: "选择日期",
    description: "选择日期",
    icon: "icon-date-picker"
};

/**
 * @description 创建日期组件的独立设计数据。
 * @returns 相互隔离的新日期选择器节点数据。
 * @remarks 默认使用单日期字符串模式，动态禁用规则仅保存为可编辑模板，未配置前不会执行。
 */
export function useCreateDefaultData(): WidgetDatePickerData {
    // 根据组件 code 生成当前设计节点的唯一 ID。
    const id = WIDGET_DATE_PICKER.code.replace(/-/g, "_") + "_" + randomId();
    return {
        id,
        code: WIDGET_DATE_PICKER.code,
        name: WIDGET_DATE_PICKER.name,
        isShow: true,
        defaultValue: null,
        propName: id,
        formAttributes: {
            prop: id,
            required: false,
            label: WIDGET_DATE_PICKER.name,
            labelPosition: "left"
        },
        componentAttributes: {
            type: "date",
            placeholder: "请选择日期",
            clearable: true,
            startPlaceholder: "开始日期",
            endPlaceholder: "结束日期",
            valueFormat: "YYYY-MM-DD"
        },
        componentFunctions: {
            validate: null,
            change: null,
            blur: null,
            focus: null,
            clear: null,
            visibleChange: null,
            disabledDate: null,
            disabledHours: null,
            disabledMinutes: null,
            disabledSeconds: null
        },
        settingData: {
            propName: id,
            label: WIDGET_DATE_PICKER.name,
            labelPosition: "left",
            type: "date",
            control: [],
            defaultValue: null,
            defaultTime: null,
            clearable: true,
            placeholder: "请选择日期",
            startPlaceholder: "开始日期",
            endPlaceholder: "结束日期",
            valueFormat: "YYYY-MM-DD",
            format: "YYYY-MM-DD",
            dateFormat: "YYYY-MM-DD",
            timeFormat: "HH:mm:ss",
            editable: true,
            rangeSeparator: "-",
            required: false,
            requiredMessage: null,
            disabledDate: `function disabledDate(date, value) {
    // 请在这里编写禁用日期函数体逻辑，可直接使用 date, value 参数,返回 true 表示禁用该日期
}`,
            disabledHours: `function disabledHours(role, comparingDate, value) {
    // 请在这里编写禁用小时函数体逻辑，可直接使用 role, comparingDate, value 参数,返回数组 表示禁用该小时选项
}`,
            disabledMinutes: `function disabledMinutes(hour, role, comparingDate, value) {
    // 请在这里编写禁用分钟函数体逻辑，可直接使用 hour, role, comparingDate, value 参数,返回数组 表示禁用该分钟选项
}`,
            disabledSeconds: `function disabledSeconds(hour, minute, role, comparingDate, value) {
    // 请在这里编写禁用秒数函数体逻辑，可直接使用 hour, minute, role, comparingDate, value 参数,返回数组 表示禁用该秒数选项
}`,
            onValidate: `function onValidate(value, callback, formData, widgetFormData) {
    // 请在这里编写验证函数体逻辑，可直接使用 value, callback, formData, widgetFormData 参数
}`,
            onChange: `function onChange(value, formData, widgetFormData) {
    // 请在这里编写改变事件处理函数体逻辑，可直接使用 value, formData, widgetFormData 参数
}`,
            onBlur: `function onBlur(event, value, formData, widgetFormData) {
    // 请在这里编写失去焦点事件处理函数体逻辑，可直接使用 event, value, formData, widgetFormData 参数
}`,
            onFocus: `function onFocus(event, value, formData, widgetFormData) {
    // 请在这里编写获得焦点事件处理函数体逻辑，可直接使用 event, value, formData, widgetFormData 参数
}`,
            onClear: `function onClear(formData, widgetFormData) {
    // 请在这里编写清除事件处理函数体逻辑，可直接使用 formData, widgetFormData 参数
}`,
            onVisibleChange: `function onVisibleChange(visible, formData, widgetFormData) {
    // 请在这里编写可见性改变事件处理函数体逻辑，可直接使用 visible, formData, widgetFormData 参数
}`
        }
    };
}

/**
 * @description 将日期设置同步到根级默认值、表单项属性、组件属性或动态函数体。
 * @param data 将被原地更新的日期选择器节点数据。
 * @param fileName 发生变化的设置字段。
 * @param value 设置字段的新值。
 * @returns 无返回值。
 * @remarks 类型切换会清空两处默认值，因为单日期、日期范围和日期时间范围的数据形态不兼容。
 */
export function useSettingDataValueChange(data: WidgetDatePickerData, fileName: keyof WidgetDatePickerData["settingData"], value: any) {
    switch (fileName) {
        case "defaultValue":
        case "propName":
            data[fileName] = value;
            break;
        case "label":
        case "labelPosition":
            data.formAttributes[fileName] = value;
            break;
        case "control":
            // control 是设置面板组合选项，运行时需拆成组件属性和设计器节点显示状态。
            data.componentAttributes.disabled = value.includes("disabled");
            data.isShow = value.includes("isShow");
            data.componentAttributes.readonly = value.includes("readonly");
            break;
        case "type":
            data.componentAttributes.type = value || "date";
            // 根级值用于首次渲染，设置态值用于面板回显，两处都清理才能避免重新打开面板时出现失效旧值。
            data.defaultValue = null;
            data.settingData.defaultValue = null;
            break;
        case "placeholder":
        case "startPlaceholder":
        case "endPlaceholder":
        case "defaultTime":
        case "editable":
        case "rangeSeparator":
        case "valueFormat":
        case "format":
        case "dateFormat":
        case "timeFormat":
            data.componentAttributes[fileName] = value;
            break;
        case "required":
        case "requiredMessage":
            break;
        case "disabledDate":
            // 编辑器保存完整函数文本，运行态只保存函数体，useAttributes 再按约定参数包装成真实回调。
            data.componentFunctions.disabledDate = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "disabledHours":
            data.componentFunctions.disabledHours = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "disabledMinutes":
            data.componentFunctions.disabledMinutes = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "disabledSeconds":
            data.componentFunctions.disabledSeconds = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onValidate":
            data.componentFunctions.validate = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onChange":
            data.componentFunctions.change = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onBlur":
            data.componentFunctions.blur = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onFocus":
            data.componentFunctions.focus = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onClear":
            data.componentFunctions.clear = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onVisibleChange":
            data.componentFunctions.visibleChange = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        default:
            break;
    }
    (data.settingData as any)[fileName] = value;
}

/**
 * @description 合并静态日期属性与按需构造的禁用函数。
 * @param widgetDatePickerData 当前日期选择器节点数据。
 * @param value 当前字段值，供禁用日期脚本读取。
 * @returns 合并静态属性与已配置禁用回调的新对象。
 * @remarks 动态脚本按 Element Plus 的回调协议注入参数，只应执行可信设计配置。
 */
export function useAttributes(widgetDatePickerData: WidgetDatePickerData, value: Date | string | number | Array<Date | string | number> | null): WidgetDatePickerData["componentAttributes"] {
    // 收集由脚本配置动态生成的组件属性函数。
    const functionAttributes: Record<
        string,
        | ((date: Date) => boolean)
        | ((role: string, comparingDate: Date, value: string | number) => boolean)
        | ((hour: number, role: string, comparingDate: Date, value: string | number) => boolean)
        | ((hour: number, minute: number, role: string, comparingDate: Date, value: string | number) => boolean)
    > = {};
    if (widgetDatePickerData.componentFunctions.disabledDate) {
        /**
         * @description 判断指定日期是否禁用。
         * @param date 当前候选日期。
         * @returns true 表示禁止选择该日期。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        functionAttributes.disabledDate = function (date: Date) {
            return new Function("date", "value", "widgetDatePickerData", widgetDatePickerData.componentFunctions.disabledDate as string)(date, value, widgetDatePickerData);
        };
    }
    if (widgetDatePickerData.componentFunctions.disabledHours) {
        /**
         * @description 计算当前面板角色下禁用的小时选项。
         * @param role 范围选择器的开始或结束面板角色。
         * @param comparingDate 用于范围比较的另一端日期。
         * @param value Element Plus 回调提供的当前值。
         * @returns 配置脚本返回的禁用小时集合。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        functionAttributes.disabledHours = function (role: string, comparingDate: Date, value: string | number) {
            return new Function("role", "comparingDate", "value", "widgetDatePickerData", widgetDatePickerData.componentFunctions.disabledHours as string)(
                role,
                comparingDate,
                value,
                widgetDatePickerData
            );
        };
    }
    if (widgetDatePickerData.componentFunctions.disabledMinutes) {
        /**
         * @description 计算指定小时下禁用的分钟选项。
         * @param hour 当前小时。
         * @param role 范围选择器的开始或结束面板角色。
         * @param comparingDate 用于范围比较的另一端日期。
         * @param value Element Plus 回调提供的当前值。
         * @returns 配置脚本返回的禁用分钟集合。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        functionAttributes.disabledMinutes = function (hour: number, role: string, comparingDate: Date, value: string | number) {
            return new Function("hour", "role", "comparingDate", "value", "widgetDatePickerData", widgetDatePickerData.componentFunctions.disabledMinutes as string)(
                hour,
                role,
                comparingDate,
                value,
                widgetDatePickerData
            );
        };
    }
    if (widgetDatePickerData.componentFunctions.disabledSeconds) {
        /**
         * @description 计算指定小时和分钟下禁用的秒选项。
         * @param hour 当前小时。
         * @param minute 当前分钟。
         * @param role 范围选择器的开始或结束面板角色。
         * @param comparingDate 用于范围比较的另一端日期。
         * @param value Element Plus 回调提供的当前值。
         * @returns 配置脚本返回的禁用秒集合。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        functionAttributes.disabledSeconds = function (hour: number, minute: number, role: string, comparingDate: Date, value: string | number) {
            return new Function("hour", "minute", "role", "comparingDate", "value", "widgetDatePickerData", widgetDatePickerData.componentFunctions.disabledSeconds as string)(
                hour,
                minute,
                role,
                comparingDate,
                value,
                widgetDatePickerData
            );
        };
    }
    return Object.assign({}, widgetDatePickerData.componentAttributes, functionAttributes);
}

/**
 * @description 将已配置函数体包装为日期组件事件映射。
 * @param widgetDatePickerData 当前日期选择器节点数据。
 * @param formData 当前表单渲染值。
 * @param widgetFormData 所属表单设计数据。
 * @returns 仅包含已配置脚本的事件映射。
 * @remarks 未配置事件不会出现在返回对象中；脚本异常不在此捕获。
 */
export function useEvents(widgetDatePickerData: WidgetDatePickerData, formData: Record<string, any>, widgetFormData: WidgetFormData) {
    // 收集当前组件实际配置的运行时事件处理器。
    const events: Record<string, ((e: FocusEvent) => void) | ((value: any) => void) | (() => void)> = {};
    if (widgetDatePickerData.componentFunctions.change) {
        /**
         * @description 执行日期值变更脚本。
         * @param value 当前单日期或日期范围值。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.change = function (value: any) {
            new Function("value", "formData", "widgetFormData", widgetDatePickerData.componentFunctions.change as string)(value, formData, widgetFormData);
        };
    }
    if (widgetDatePickerData.componentFunctions.blur) {
        /**
         * @description 执行日期选择器失焦脚本并注入当前字段值。
         * @param event 原始焦点事件。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.blur = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetDatePickerData.componentFunctions.blur as string)(event, formData[widgetDatePickerData.id], formData, widgetFormData);
        };
    }
    if (widgetDatePickerData.componentFunctions.focus) {
        /**
         * @description 执行日期选择器聚焦脚本并注入当前字段值。
         * @param event 原始焦点事件。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.focus = function (event: FocusEvent) {
            new Function("e", "value", "formData", "widgetFormData", widgetDatePickerData.componentFunctions.focus as string)(event, formData[widgetDatePickerData.id], formData, widgetFormData);
        };
    }
    if (widgetDatePickerData.componentFunctions.clear) {
        /**
         * @description 执行日期清空脚本。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.clear = function () {
            new Function("formData", "widgetFormData", widgetDatePickerData.componentFunctions.clear as string)(formData, widgetFormData);
        };
    }
    if (widgetDatePickerData.componentFunctions.visibleChange) {
        /**
         * @description 执行日期面板可见性变更脚本。
         * @param visible 日期面板是否可见。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        events.visibleChange = function (visible: boolean) {
            new Function("visible", "formData", "widgetFormData", widgetDatePickerData.componentFunctions.visibleChange as string)(visible, formData, widgetFormData);
        };
    }
    return events;
}
