/**
 * @fileoverview 上传组件适配模块，集中管理上传属性和预览、删除、成功、失败、进度及前置校验等动态钩子。
 * @remarks
 * 各钩子以完整源码供设置面板编辑，以纯函数体供运行时按需包装，避免把 Function 写入需要复制和导出的设计数据。
 * 只有已配置的钩子才会出现在返回属性中，未配置项继续使用 Element Plus 默认行为；脚本异常或 Promise 拒绝由上传调用链处理。
 * 受控文件列表由 `widget-renderer.vue` 通过 `v-model:file-list` 绑定，本模块不把它重复合并到属性对象；普通 `v-model` 不能替代该具名模型。
 */
import { randomId } from "@yujinjin/utils";
import { type UploadFile, type UploadUserFile } from "element-plus";
import { type WidgetUploadData } from "../types";
import { buildDefinedAttributes } from "@/views/composables/widget-attribute-utils";
import { createWidgetComponentFunction, extractFunctionBody } from "@/views/composables/widget-script-utils";

/** 注册表使用的上传组件稳定 code 与组件库展示元数据。 */
export const WIDGET_UPLOAD = {
    code: "upload",
    name: "上传文件",
    description: "上传文件",
    icon: "icon-upload"
};

/**
 * @description 生成传给 ElUpload 的属性与钩子对象。
 * @param widgetUploadData 当前上传节点数据。
 * @returns 合并静态属性与已配置上传钩子的新对象。
 * @remarks 完整构建覆盖 data、httpRequest 及全部上传钩子；设计态设置只原地更新当前钩子，持久化投影负责排除包含 Function 的运行缓存。
 */
export function useAttributes(widgetUploadData: WidgetUploadData): NonNullable<WidgetUploadData["componentAttributes"]> {
    // 收集由脚本配置动态生成的上传属性和钩子函数。
    const functionAttributes: Record<string, any> = {};
    // 只为实际配置的钩子创建包装函数，未配置项保持缺省，让 Element Plus 使用自身默认行为。
    if (widgetUploadData.componentFunctions.onPreview) {
        /**
         * @description 执行文件预览脚本。
         * @param uploadFile 当前预览文件。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        functionAttributes.onPreview = function (uploadFile: UploadFile) {
            new Function("uploadFile", widgetUploadData.componentFunctions.onPreview as string)(uploadFile);
        };
    }
    if (widgetUploadData.componentFunctions.onRemove) {
        /**
         * @description 执行文件移除后的处理脚本。
         * @param uploadFile 被移除的文件。
         * @param uploadFiles 移除后的文件列表。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        functionAttributes.onRemove = function (uploadFile: UploadFile, uploadFiles: UploadUserFile[]) {
            new Function("uploadFile", "uploadFiles", widgetUploadData.componentFunctions.onRemove as string)(uploadFile, uploadFiles);
        };
    }
    if (widgetUploadData.componentFunctions.onSuccess) {
        /**
         * @description 执行上传成功脚本。
         * @param response 服务端响应。
         * @param uploadFile 本次上传文件。
         * @param uploadFiles 当前文件列表。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        functionAttributes.onSuccess = function (response: any, uploadFile: UploadFile, uploadFiles: UploadUserFile[]) {
            new Function("response", "uploadFile", "uploadFiles", widgetUploadData.componentFunctions.onSuccess as string)(response, uploadFile, uploadFiles);
        };
    }
    if (widgetUploadData.componentFunctions.onError) {
        /**
         * @description 执行上传失败脚本。
         * @param error 上传错误对象。
         * @param uploadFile 本次上传文件。
         * @param uploadFiles 当前文件列表。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        functionAttributes.onError = function (error: any, uploadFile: UploadFile, uploadFiles: UploadUserFile[]) {
            new Function("error", "uploadFile", "uploadFiles", widgetUploadData.componentFunctions.onError as string)(error, uploadFile, uploadFiles);
        };
    }
    if (widgetUploadData.componentFunctions.onProgress) {
        /**
         * @description 执行上传进度脚本。
         * @param evt 当前上传进度事件。
         * @param uploadFile 本次上传文件。
         * @param uploadFiles 当前文件列表。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        functionAttributes.onProgress = function (evt: any, uploadFile: UploadFile, uploadFiles: UploadUserFile[]) {
            new Function("evt", "uploadFile", "uploadFiles", widgetUploadData.componentFunctions.onProgress as string)(evt, uploadFile, uploadFiles);
        };
    }
    if (widgetUploadData.componentFunctions.onChange) {
        /**
         * @description 执行上传文件状态变更脚本。
         * @param uploadFile 状态发生变化的文件。
         * @param uploadFiles 当前文件列表。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        functionAttributes.onChange = function (uploadFile: UploadFile, uploadFiles: UploadUserFile[]) {
            new Function("uploadFile", "uploadFiles", widgetUploadData.componentFunctions.onChange as string)(uploadFile, uploadFiles);
        };
    }
    if (widgetUploadData.componentFunctions.onExceed) {
        /**
         * @description 执行文件数量超限脚本。
         * @param files 本次选择且导致超限的文件。
         * @param uploadFiles 当前文件列表。
         * @returns 无返回值。
         * @throws 配置脚本语法错误或执行失败时原样抛出。
         */
        functionAttributes.onExceed = function (files: UploadUserFile[], uploadFiles: UploadUserFile[]) {
            new Function("files", "uploadFiles", widgetUploadData.componentFunctions.onExceed as string)(files, uploadFiles);
        };
    }
    if (widgetUploadData.componentFunctions.beforeUpload) {
        /**
         * @description 执行上传前校验脚本。
         * @param rawFile 待上传的原始文件。
         * @returns 是否允许上传，或 Element Plus 支持的异步校验结果。
         * @throws 配置脚本语法错误、执行失败或 Promise 拒绝时原样传播。
         */
        functionAttributes.beforeUpload = function (rawFile: File) {
            return new Function("rawFile", widgetUploadData.componentFunctions.beforeUpload as string)(rawFile);
        };
    }
    if (widgetUploadData.componentFunctions.beforeRemove) {
        /**
         * @description 执行删除文件前校验脚本。
         * @param uploadFile 待删除文件。
         * @param uploadFiles 当前文件列表。
         * @returns 是否允许删除，或 Element Plus 支持的异步校验结果。
         * @throws 配置脚本语法错误、执行失败或 Promise 拒绝时原样传播。
         */
        functionAttributes.beforeRemove = function (uploadFile: UploadFile, uploadFiles: UploadUserFile[]) {
            return new Function("uploadFile", "uploadFiles", widgetUploadData.componentFunctions.beforeRemove as string)(uploadFile, uploadFiles);
        };
    }
    if (widgetUploadData.componentFunctions.data) {
        /**
         * @description 计算单个待上传文件携带的附加数据。
         * @param rawFile 当前原始文件。
         * @returns 配置脚本生成的普通对象或 Promise。
         * @throws 配置脚本语法错误、执行失败或 Promise 拒绝时原样传播。
         */
        functionAttributes.data = function (rawFile: File) {
            return new Function("rawFile", widgetUploadData.componentFunctions.data as string)(rawFile);
        };
    }
    if (widgetUploadData.componentFunctions.httpRequest) {
        /**
         * @description 使用设计器配置脚本执行自定义上传请求。
         * @param options Element Plus 提供的上传请求选项。
         * @returns 配置脚本的原始返回值。
         * @throws 配置脚本语法错误或执行失败时原样传播。
         */
        functionAttributes.httpRequest = function (options: unknown) {
            return new Function("options", widgetUploadData.componentFunctions.httpRequest as string)(options);
        };
    }
    return Object.assign(
        buildDefinedAttributes(widgetUploadData.settingData, ["action", "accept", "method", "multiple", "name", "headers", "showFileList", "drag", "autoUpload", "listType", "limit"], {
            disabled: widgetUploadData.settingData.control.includes("disabled")
        }),
        functionAttributes
    );
}

/**
 * @description 创建上传组件默认数据。
 * @returns 相互隔离的新上传节点数据。
 * @remarks 上传钩子以完整函数模板保存在 settingData，componentFunctions 初始为空，只有用户确认配置后才参与运行时属性绑定。
 */
export function useCreateDefaultData(): WidgetUploadData {
    // 根据组件 code 生成当前设计节点的唯一 ID。
    const id = WIDGET_UPLOAD.code.replace(/-/g, "_") + "_" + randomId();
    return {
        id,
        code: WIDGET_UPLOAD.code,
        name: WIDGET_UPLOAD.name,
        isShow: true,
        defaultValue: [],
        propName: id,
        formAttributes: {
            label: WIDGET_UPLOAD.name,
            prop: id,
            required: false,
            labelPosition: "left"
        },
        componentAttributes: {
            action: "#",
            method: "post",
            multiple: false,
            name: "file",
            headers: {},
            showFileList: true,
            drag: false,
            autoUpload: true,
            listType: "text",
            disabled: false
        },
        componentFunctions: {
            validate: null,
            data: null,
            onPreview: null,
            onRemove: null,
            onSuccess: null,
            onError: null,
            onProgress: null,
            onChange: null,
            onExceed: null,
            beforeUpload: null,
            beforeRemove: null,
            httpRequest: null
        },
        settingData: {
            propName: id,
            label: WIDGET_UPLOAD.name,
            labelPosition: "left",
            defaultValue: [],
            required: false,
            requiredMessage: null,
            control: ["isShow"],
            action: "#",
            accept: null,
            method: "post",
            multiple: false,
            name: "file",
            headers: {},
            showFileList: true,
            drag: false,
            autoUpload: true,
            listType: "text",
            limit: null,
            data: `async function data(rawFile) {
    // 上传时附带的额外参数，可直接使用 rawFile 参数
}`,
            onPreview: `function onPreview(uploadFile) {
    // 请在这里编写预览文件函数体逻辑，可直接使用 uploadFile 参数
}`,
            onRemove: `function onRemove(uploadFile, uploadFiles) {
    // 请在这里编写删除文件函数体逻辑，可直接使用 uploadFile, uploadFiles 参数
}`,
            onSuccess: `function onSuccess(response, uploadFile, uploadFiles) {
    // 请在这里编写上传成功函数体逻辑，可直接使用 response, uploadFile, uploadFiles 参数
}`,
            onError: `function onError(error, uploadFile, uploadFiles) {
    // 请在这里编写上传失败函数体逻辑，可直接使用 error, uploadFile, uploadFiles 参数
}`,
            onProgress: `function onProgress(evt, uploadFile, uploadFiles) {
    // 请在这里编写上传进度函数体逻辑，可直接使用 evt, uploadFile, uploadFiles 参数
}`,
            onChange: `function onChange(uploadFile, uploadFiles) {
    // 请在这里编写改变事件处理函数体逻辑，可直接使用 uploadFile, uploadFiles 参数
}`,
            onExceed: `function onExceed(files, uploadFiles) {
    // 请在这里编写超出限制时处理逻辑，可直接使用 files, uploadFiles 参数
}`,
            beforeUpload: `function beforeUpload(rawFile) {
    // 请在这里编写上传前前的处理逻辑，可直接使用 rawFile 参数
}`,
            beforeRemove: `function beforeRemove(uploadFile, uploadFiles) {
    // 请在这里编写删除文件前的处理逻辑，可直接使用 uploadFile, uploadFiles 参数
}`,
            httpRequest: `function httpRequest(options) {
    // 请在这里编写上传请求函数体逻辑，可直接使用 options 参数
}`,
            onValidate: `function onValidate(value, callback, formData, widgetFormData) {
    // 请在这里编写验证函数体逻辑，可直接使用 value, callback, formData, widgetFormData 参数
}`
        }
    };
}

/**
 * @description 将上传设置同步到字段、组件属性和上传钩子函数体。
 * @param widgetUploadData 将被原地更新的上传节点数据。
 * @param fileName 发生变化的设置字段。
 * @param value 设置字段的新值。
 * @returns 无返回值。
 * @remarks 函数字段采用“完整源码用于编辑、纯函数体用于执行”的双存储方式；输入不符合模板格式时可能在实际上传阶段产生语法错误。
 */
export function useSettingDataValueChange(widgetUploadData: WidgetUploadData, fileName: keyof WidgetUploadData["settingData"], value: any) {
    // 设置面板只接收工厂创建或恢复完成的 Widget，因此运行属性在此阶段必然存在。
    const componentAttributes = widgetUploadData.componentAttributes!;
    switch (fileName) {
        case "propName":
            widgetUploadData[fileName] = value;
            break;
        case "defaultValue":
            // ElUpload 的 file-list 会被直接遍历和展开，空值必须归一化为数组。
            value = Array.isArray(value) ? value : [];
            widgetUploadData.defaultValue = value;
            break;
        case "label":
        case "labelPosition":
            widgetUploadData.formAttributes[fileName] = value;
            break;
        case "control":
            widgetUploadData.isShow = value.includes("isShow");
            componentAttributes.disabled = value.includes("disabled");
            break;
        case "action":
        case "accept":
        case "name":
        case "multiple":
        case "listType":
        case "showFileList":
        case "autoUpload":
        case "drag":
        case "method":
        case "limit":
        case "headers":
            componentAttributes[fileName] = value;
            break;
        case "required":
        case "requiredMessage":
            break;
        case "data":
            // data/httpRequest 等配置在 Element Plus 中要求函数，不能直接使用编辑器保存的完整函数声明。
            widgetUploadData.componentFunctions.data = extractFunctionBody(value);
            if (widgetUploadData.componentFunctions.data) {
                componentAttributes.data = createWidgetComponentFunction(widgetUploadData.componentFunctions.data, ["rawFile"]);
            } else {
                delete componentAttributes.data;
            }
            break;
        case "onPreview":
            widgetUploadData.componentFunctions.onPreview = extractFunctionBody(value);
            if (widgetUploadData.componentFunctions.onPreview) {
                componentAttributes.onPreview = createWidgetComponentFunction(widgetUploadData.componentFunctions.onPreview, ["uploadFile"], false);
            } else {
                delete componentAttributes.onPreview;
            }
            break;
        case "onRemove":
            widgetUploadData.componentFunctions.onRemove = extractFunctionBody(value);
            if (widgetUploadData.componentFunctions.onRemove) {
                componentAttributes.onRemove = createWidgetComponentFunction(widgetUploadData.componentFunctions.onRemove, ["uploadFile", "uploadFiles"], false);
            } else {
                delete componentAttributes.onRemove;
            }
            break;
        case "onSuccess":
            widgetUploadData.componentFunctions.onSuccess = extractFunctionBody(value);
            if (widgetUploadData.componentFunctions.onSuccess) {
                componentAttributes.onSuccess = createWidgetComponentFunction(widgetUploadData.componentFunctions.onSuccess, ["response", "uploadFile", "uploadFiles"], false);
            } else {
                delete componentAttributes.onSuccess;
            }
            break;
        case "onError":
            widgetUploadData.componentFunctions.onError = extractFunctionBody(value);
            if (widgetUploadData.componentFunctions.onError) {
                componentAttributes.onError = createWidgetComponentFunction(widgetUploadData.componentFunctions.onError, ["error", "uploadFile", "uploadFiles"], false);
            } else {
                delete componentAttributes.onError;
            }
            break;
        case "onProgress":
            widgetUploadData.componentFunctions.onProgress = extractFunctionBody(value);
            if (widgetUploadData.componentFunctions.onProgress) {
                componentAttributes.onProgress = createWidgetComponentFunction(widgetUploadData.componentFunctions.onProgress, ["evt", "uploadFile", "uploadFiles"], false);
            } else {
                delete componentAttributes.onProgress;
            }
            break;
        case "onChange":
            widgetUploadData.componentFunctions.onChange = extractFunctionBody(value);
            if (widgetUploadData.componentFunctions.onChange) {
                componentAttributes.onChange = createWidgetComponentFunction(widgetUploadData.componentFunctions.onChange, ["uploadFile", "uploadFiles"], false);
            } else {
                delete componentAttributes.onChange;
            }
            break;
        case "onExceed":
            widgetUploadData.componentFunctions.onExceed = extractFunctionBody(value);
            if (widgetUploadData.componentFunctions.onExceed) {
                componentAttributes.onExceed = createWidgetComponentFunction(widgetUploadData.componentFunctions.onExceed, ["files", "uploadFiles"], false);
            } else {
                delete componentAttributes.onExceed;
            }
            break;
        case "beforeUpload":
            widgetUploadData.componentFunctions.beforeUpload = extractFunctionBody(value);
            if (widgetUploadData.componentFunctions.beforeUpload) {
                componentAttributes.beforeUpload = createWidgetComponentFunction(widgetUploadData.componentFunctions.beforeUpload, ["rawFile"]);
            } else {
                delete componentAttributes.beforeUpload;
            }
            break;
        case "beforeRemove":
            widgetUploadData.componentFunctions.beforeRemove = extractFunctionBody(value);
            if (widgetUploadData.componentFunctions.beforeRemove) {
                componentAttributes.beforeRemove = createWidgetComponentFunction(widgetUploadData.componentFunctions.beforeRemove, ["uploadFile", "uploadFiles"]);
            } else {
                delete componentAttributes.beforeRemove;
            }
            break;
        case "httpRequest":
            widgetUploadData.componentFunctions.httpRequest = extractFunctionBody(value);
            if (widgetUploadData.componentFunctions.httpRequest) {
                componentAttributes.httpRequest = createWidgetComponentFunction(widgetUploadData.componentFunctions.httpRequest, ["options"]);
            } else {
                delete componentAttributes.httpRequest;
            }
            break;
        case "onValidate":
            widgetUploadData.componentFunctions.validate = extractFunctionBody(value);
            break;
    }
    (widgetUploadData.settingData as any)[fileName] = value;
}
