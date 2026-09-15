/**
 * @fileoverview 验证 Widget 动态脚本从完整源码到函数体及运行函数的统一转换规则。
 */
import { describe, expect, it } from "vitest";
import { createAsyncWidgetComponentFunction, createWidgetComponentFunction, extractFunctionBody } from "@/views/composables/widget-script-utils";

describe("widget script utils", () => {
    it("从普通函数和异步函数源码中提取多行函数体", () => {
        expect(extractFunctionBody("function change(value) {\n    return value + 1;\n}")).toBe("    return value + 1;");
        expect(extractFunctionBody("async function load() {\r\n    return true;\r\n}")).toBe("    return true;\r");
    });

    it("空脚本统一转换为 null", () => {
        expect(extractFunctionBody(null)).toBeNull();
        expect(extractFunctionBody(undefined)).toBeNull();
        expect(extractFunctionBody("")).toBeNull();
    });

    it("按指定参数和附加上下文创建同步运行函数", () => {
        const runtimeFunction = createWidgetComponentFunction<(value: number) => number>("return value + offset;", ["value", "offset"], true, [2]);

        expect(runtimeFunction?.(3)).toBe(5);
    });

    it("为异步属性脚本创建 Promise 运行函数", async () => {
        const runtimeFunction = createAsyncWidgetComponentFunction<() => Promise<boolean>>("return true;", []);

        await expect(runtimeFunction?.()).resolves.toBe(true);
    });
});
