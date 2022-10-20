/*
 * @创建者: yujinjin9@126.com
 * @创建时间: 2022-10-18 16:58:30
 * @最后修改作者: yujinjin9@126.com
 * @最后修改时间: 2022-10-19 15:46:22
 * @项目的路径: \web-designer\edit\types\widget.d.ts
 * @描述: 组件命名空间
 */
export namespace Widget {
    /** 组件配置数据 */
    interface ComponentData {
        /** 值 */
        value: string;

        /** 字体尺寸 */
        size: string | number;

        /** 字体颜色 */
        color: string;

        /** 高度 */
        height: string | number;

        /** 宽度 */
        width: string | number;

        /** 链接地址 */
        linkUrl?: string;

        /** 备注说明 */
        remark: string;
    }

    /** 按钮组件配置数据 */
    interface ButtonData extends ComponentData {
        /** 对齐方式 */
        align: string;

        /** 背景颜色 */
        bgColor: string;

        /** 边框 */
        border: string;

        /** 按钮圆角 */
        borderRadius: string;

        /** 按钮的类型，call:拨打电话 */
        type: string;
    }

    /** 图片组件配置数据 */
    interface ImageData extends ComponentData {
        /** 边框 */
        border: string;

        /** 按钮圆角 */
        borderRadius: string;
    }

    /** 组件案例 */
    interface TemplateCase {
        /** 编码（唯一） */
        readonly code: string;

        /** 案例名称 */
        readonly name: string;

        /** 示意图 */
        readonly diagram: string;

        /** 案例配置数据 */
        readonly data: TemplateData;
    }

    /** 组件模板配置 */
    interface Template {
        /** 编码（唯一） */
        readonly code: string;

        /** 组件名称 */
        readonly name: string;

        /** icon */
        readonly icon: string;

        /** 预览绑定动态组件名称 */
        readonly previewComponentName: string;

        /** 案例列表 */
        caseList: Array<TemplateCase>;
    }

    /** 组件实例 */
    interface ComponentInstance {
        /** 组件实例ID */
        id: string;

        /** 编码（唯一） */
        code: string;

        /** 组件名称 */
        name: string;

        /** 预览绑定动态组件名称 */
        previewComponentName: string;

        /** 案例编码（这里没什么用，只作为涌余字段追溯用） */
        caseCode: string;

        /** 案例名字（这里没什么用，只作为涌余字段追溯用） */
        caseName: string;

        /** 案例示意图（这里没什么用，只作为涌余字段追溯用） */
        caseDiagram: string;

        /** 组件配置数据 */
        data: TemplateData;
    }
}

// export = Widget;
