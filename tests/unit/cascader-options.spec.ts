import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseCascaderOptionsJson, validateCascaderOptions } from "@/views/composables/widgets/cascader";

describe("cascader options", () => {
    it("级联选项解析与组件适配由同一模块维护", () => {
        expect(existsSync(new URL("../../src/views/composables/cascader-data-source.ts", import.meta.url))).toBe(false);
    });

    it("解析包含换行和缩进的本地完整树", () => {
        const result = parseCascaderOptionsJson(`[
    {
        "label": "浙江省",
        "value": "330000",
        "children": [
            { "label": "杭州市", "value": 330100, "disabled": true }
        ]
    }
]`);

        expect(result).toEqual({
            ok: true,
            data: [
                {
                    label: "浙江省",
                    value: "330000",
                    children: [{ label: "杭州市", value: 330100, disabled: true }]
                }
            ]
        });
    });

    it("拒绝非法 JSON、非数组根节点和无效递归节点", () => {
        expect(parseCascaderOptionsJson('[\n  { "label": "浙江省",\n]')).toMatchObject({ ok: false, path: "$" });
        expect(parseCascaderOptionsJson('{ "label": "浙江省", "value": "330000" }')).toEqual({
            ok: false,
            message: "级联选项根节点必须是数组",
            path: "$"
        });
        expect(
            validateCascaderOptions([
                {
                    label: "浙江省",
                    value: "330000",
                    children: [{ label: "杭州市" }]
                }
            ])
        ).toEqual({
            ok: false,
            message: "节点值必须是字符串或数字",
            path: "$[0].children[0].value"
        });
        expect(validateCascaderOptions([{ label: "浙江省", value: "330000", children: {} }])).toEqual({
            ok: false,
            message: "节点 children 必须是数组",
            path: "$[0].children"
        });
    });

    it("校验可选状态字段的类型", () => {
        expect(validateCascaderOptions([{ label: "浙江省", value: "330000", disabled: "false" }])).toEqual({
            ok: false,
            message: "节点 disabled 必须是布尔值",
            path: "$[0].disabled"
        });
        expect(validateCascaderOptions([{ label: "浙江省", value: "330000", leaf: 1 }])).toEqual({
            ok: false,
            message: "节点 leaf 必须是布尔值",
            path: "$[0].leaf"
        });
    });
});
