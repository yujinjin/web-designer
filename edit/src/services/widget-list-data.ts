/*
 * @创建者: yujinjin9@126.com
 * @创建时间: 2022-10-18 17:57:28
 * @最后修改作者: yujinjin9@126.com
 * @最后修改时间: 2022-10-20 09:48:14
 * @项目的路径: \web-designer\edit\src\services\widget-list-data.ts
 * @描述: 组件列表数据
 */
import { Widget } from "/#/widget";

export default [
    {
        code: "button",
        name: "按钮",
        icon: "icon-button",
        previewComponentName: "button",
        caseList: [
            {
                code: "button_1",
                name: "基本样式1",
                diagram: require("@imgs/widget/button/button_1.jpg"),
                data: {
                    value: "提交"
                } as Widget.ButtonData
            },
            {
                code: "button_2",
                name: "基本样式2",
                diagram: require("@imgs/widget/button/button_2.png"),
                data: {
                    value: "查看"
                } as Widget.ButtonData
            }
        ]
    },
    {
        code: "image",
        name: "图片",
        icon: "icon-images",
        previewComponentName: "image",
        caseList: [
            {
                code: "image_1",
                name: "图片展示",
                diagram: require("@imgs/widget/image/image_1.jpg"),
                data: {
                    value: "图片地址"
                } as Widget.ImageData
            }
        ]
    }
];
