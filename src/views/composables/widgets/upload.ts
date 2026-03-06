import { randomId } from "@yujinjin/utils";
import { type UploadFile, type UploadUserFile } from "element-plus";
import { type WidgetUploadData } from "../types";

export const WIDGET_UPLOAD = {
    code: "upload",
    name: "上传文件",
    description: "上传文件",
    icon: "icon-upload"
};

// 创建默认数据
export function useCreateDefaultData(): WidgetUploadData {
    const id = WIDGET_UPLOAD.code.replace(/-/g, "_") + "_" + randomId();
    return {
        id,
        code: WIDGET_UPLOAD.code,
        name: WIDGET_UPLOAD.name,
        isShow: true,
        defaultValue: null,
        propName: id,
        formAttributes: {
            label: WIDGET_UPLOAD.name,
            prop: id,
            required: false,
            labelPosition: "left"
        },
        componentAttributes: {
            accept: "#"
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
            defaultValue: null,
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
            data: `function async data(rawFile) {
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

// 获取上传组件属性值
export function useAttributes(widgetUploadData: WidgetUploadData, fileList: UploadUserFile[]): WidgetUploadData["componentAttributes"] {
    const functionAttributes: Record<string, any> = {};
    if (widgetUploadData.componentFunctions.onPreview) {
        functionAttributes.onPreview = function (uploadFile: UploadFile) {
            new Function("uploadFile", widgetUploadData.componentFunctions.onPreview as string)(uploadFile);
        };
    }
    if (widgetUploadData.componentFunctions.onRemove) {
        functionAttributes.onRemove = function (uploadFile: UploadFile, uploadFiles: UploadUserFile[]) {
            new Function("uploadFile", "uploadFiles", widgetUploadData.componentFunctions.onRemove as string)(uploadFile, uploadFiles);
        };
    }
    if (widgetUploadData.componentFunctions.onSuccess) {
        functionAttributes.onSuccess = function (response: any, uploadFile: UploadFile, uploadFiles: UploadUserFile[]) {
            new Function("response", "uploadFile", "uploadFiles", widgetUploadData.componentFunctions.onSuccess as string)(response, uploadFile, uploadFiles);
        };
    }
    if (widgetUploadData.componentFunctions.onError) {
        functionAttributes.onError = function (error: any, uploadFile: UploadFile, uploadFiles: UploadUserFile[]) {
            new Function("error", "uploadFile", "uploadFiles", widgetUploadData.componentFunctions.onError as string)(error, uploadFile, uploadFiles);
        };
    }
    if (widgetUploadData.componentFunctions.onProgress) {
        functionAttributes.onProgress = function (evt: any, uploadFile: UploadFile, uploadFiles: UploadUserFile[]) {
            new Function("evt", "uploadFile", "uploadFiles", widgetUploadData.componentFunctions.onProgress as string)(evt, uploadFile, uploadFiles);
        };
    }
    if (widgetUploadData.componentFunctions.onChange) {
        functionAttributes.onChange = function (uploadFile: UploadFile, uploadFiles: UploadUserFile[]) {
            new Function("uploadFile", "uploadFiles", widgetUploadData.componentFunctions.onChange as string)(uploadFile, uploadFiles);
        };
    }
    if (widgetUploadData.componentFunctions.onExceed) {
        functionAttributes.onExceed = function (files: UploadUserFile[], uploadFiles: UploadUserFile[]) {
            new Function("files", "uploadFiles", widgetUploadData.componentFunctions.onExceed as string)(files, uploadFiles);
        };
    }
    if (widgetUploadData.componentFunctions.beforeUpload) {
        functionAttributes.beforeUpload = function (rawFile: File) {
            return new Function("rawFile", widgetUploadData.componentFunctions.beforeUpload as string)(rawFile);
        };
    }
    if (widgetUploadData.componentFunctions.beforeRemove) {
        functionAttributes.beforeRemove = function (uploadFile: UploadFile, uploadFiles: UploadUserFile[]) {
            return new Function("uploadFile", "uploadFiles", widgetUploadData.componentFunctions.beforeRemove as string)(uploadFile, uploadFiles);
        };
    }
    return Object.assign({}, widgetUploadData.componentAttributes, functionAttributes);
}

// 处理事件值改变时处理
export function useSettingDataValueChange(widgetUploadData: WidgetUploadData, fileName: keyof WidgetUploadData["settingData"], value: any) {
    switch (fileName) {
        case "propName":
            widgetUploadData[fileName] = value;
            break;
        case "label":
        case "labelPosition":
            widgetUploadData.formAttributes[fileName] = value;
            break;
        case "control":
            widgetUploadData.componentAttributes.disabled = value.includes("disabled");
            widgetUploadData.isShow = value.includes("isShow");
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
            widgetUploadData.componentAttributes[fileName] = value;
            break;
        case "required":
        case "requiredMessage":
            break;
        case "data":
            widgetUploadData.componentFunctions.data = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onPreview":
            widgetUploadData.componentFunctions.onPreview = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onRemove":
            widgetUploadData.componentFunctions.onRemove = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onSuccess":
            widgetUploadData.componentFunctions.onSuccess = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onError":
            widgetUploadData.componentFunctions.onError = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onProgress":
            widgetUploadData.componentFunctions.onProgress = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onChange":
            widgetUploadData.componentFunctions.onChange = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onExceed":
            widgetUploadData.componentFunctions.onExceed = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "beforeUpload":
            widgetUploadData.componentFunctions.beforeUpload = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "beforeRemove":
            widgetUploadData.componentFunctions.beforeRemove = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "httpRequest":
            widgetUploadData.componentFunctions.httpRequest = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
        case "onValidate":
            widgetUploadData.componentFunctions.validate = value ? value.split("\n").slice(1, -1).join("\n") : null;
            break;
    }
    (widgetUploadData.settingData as any)[fileName] = value;
}
