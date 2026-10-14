/**
 * @fileoverview 创建24 栅格列宽与换行示例，供模板目录按需实例化。
 * @remarks 每次调用均通过注册工厂生成独立字段身份；仅定义配置和当前实例脚本，不持有 Vue 状态或共享可编辑节点。
 */
import { createTemplateField, createTemplateRow, options } from "../builders";
import { type WidgetData } from "@/views/types";

/**
 * @description 创建双列与三列均分栅格。
 * @returns 不同列数的行容器。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 双列和三列共用 24 栅格规则；子项均为普通组件，不增加嵌套行容器。
 */
export const createGridBalanced = function (): WidgetData[] {
    return [
        createTemplateRow("双列均分", [createTemplateField("text", "左列输入"), createTemplateField("text", "右列输入")]),
        createTemplateRow("三列均分", [
            createTemplateField("text", "第一列", { settings: { labelPosition: "top" } }),
            createTemplateField("text", "第二列", { settings: { labelPosition: "top" } }),
            createTemplateField("text", "第三列", { settings: { labelPosition: "top" } })
        ])
    ];
};

/**
 * @description 创建宽窄不等的两行栅格。
 * @returns 16/8 与 6/18 的列宽组合。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks 显式保留不等宽 spans，展示窄控件与长文本如何分配同一行宽度。
 */
export const createGridAsymmetric = function (): WidgetData[] {
    return [
        createTemplateRow(
            "宽窄组合",
            [createTemplateField("text", "宽列输入"), createTemplateField("input-number", "窄列数值", { settings: { labelPosition: "top", controlsPosition: "right" } })],
            [16, 8]
        ),
        createTemplateRow(
            "窄宽组合",
            [
                createTemplateField("switch", "开关", { defaultValue: true, settings: { labelPosition: "top" } }),
                createTemplateField("text", "宽列内容", { settings: { type: "textarea", rows: 2, labelPosition: "top" } })
            ],
            [6, 18]
        )
    ];
};

/**
 * @description 创建同一行容器内自动换行的栅格。
 * @returns 两个半宽字段及一个整行字段。
 * @throws {Error} 底层组件工厂或配置物化失败时向调用方传播，统一由模板注册表捕获。
 * @remarks spans 总和超过 24 时由同一容器自然换行，保留字段顺序和两层树限制。
 */
export const createGridWrapped = function (): WidgetData[] {
    return [
        createTemplateRow(
            "容器内换行",
            [
                createTemplateField("text", "第一项"),
                createTemplateField("select", "第二项", { settings: { options: options() } }),
                createTemplateField("text", "整行内容", { settings: { type: "textarea", rows: 2 } })
            ],
            [12, 12, 24]
        )
    ];
};
