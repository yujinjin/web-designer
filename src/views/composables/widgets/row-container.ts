import { randomId } from "@yujinjin/utils";
import { type Mutable } from "/#/global.d";
import { type WidgetRowContainerData } from "../types";

export const WIDGET_ROW_CONTAINER = {
    code: "row-container",
    name: "行容器",
    description: "用于按 24 栅格横向排列多个普通组件",
    icon: "icon-layout"
};

export function useCreateDefaultData(): WidgetRowContainerData {
    const id = WIDGET_ROW_CONTAINER.code.replace(/-/g, "_") + "_" + randomId();
    return {
        id: id,
        code: WIDGET_ROW_CONTAINER.code,
        name: WIDGET_ROW_CONTAINER.name,
        isShow: true,
        defaultValue: null,
        propName: null,
        widgets: [],
        settingData: {
            name: WIDGET_ROW_CONTAINER.name,
            gutter: 0,
            justify: "start",
            align: "top",
            enableSpanConfig: false,
            spans: []
        }
    };
}

export function useSettingDataValueChange(data: WidgetRowContainerData, fileName: keyof WidgetRowContainerData["settingData"], value: any) {
    switch (fileName) {
        case "name":
            (data as Mutable<WidgetRowContainerData>).name = value || WIDGET_ROW_CONTAINER.name;
            break;
        case "gutter":
            data.settingData.gutter = Number.isFinite(Number(value)) ? Number(value) : 0;
            break;
        case "justify":
        case "align":
        case "enableSpanConfig":
        case "spans":
            break;
    }
    (data.settingData as any)[fileName] = value;
}
