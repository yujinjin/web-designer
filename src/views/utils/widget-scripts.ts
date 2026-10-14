/**
 * @fileoverview 统一处理 Widget 动态脚本的函数体提取及运行函数包装。
 * @remarks 设置面板保存完整函数源码，componentFunctions 保存可序列化函数体，componentAttributes 仅在运行阶段持有 Function；本模块集中维护三者之间的转换边界。
 */

/**
 * @description 从设置面板保存的完整函数源码中提取函数体。
 * @param source 完整的普通函数或 async function 源码；空值表示未配置。
 * @returns 空配置返回 null，否则返回删除首行函数声明和末行右花括号后的内容。
 * @remarks 保持现有按行提取协议，不负责 JavaScript 语法校验；CRLF 输入会保留函数体内部的回车字符。
 */
export const extractFunctionBody = function (source: string | null | undefined): string | null {
    return source ? source.split("\n").slice(1, -1).join("\n") : null;
};

/**
 * @description 将已提取的脚本函数体包装为同步组件属性函数。
 * @param functionBody componentFunctions 中保存的函数体；空值表示未配置。
 * @param parameterNames 按第三方组件原生回调顺序注入的参数名。
 * @param returnResult 是否把脚本返回值继续返回给组件；事件型钩子可传 false。
 * @param additionalArguments 组件不会提供但脚本协议需要追加注入的运行上下文。
 * @returns 已配置时返回运行函数，否则返回 undefined。
 * @throws {SyntaxError} 脚本函数体语法无效时在首次调用生成函数时抛出。
 * @remarks 包装器固定使用创建时传入的函数体；脚本变更时设置同步会替换当前属性函数，只允许执行可信设计配置。
 */
export const createWidgetComponentFunction = function <T extends (...args: any[]) => any>(
    functionBody: string | null | undefined,
    parameterNames: readonly string[],
    returnResult = true,
    additionalArguments: readonly any[] = []
): T | undefined {
    if (!functionBody) {
        return undefined;
    }
    if (returnResult) {
        return function (...args: any[]) {
            return new Function(...parameterNames, functionBody)(...args, ...additionalArguments);
        } as T;
    }
    return function (...args: any[]) {
        new Function(...parameterNames, functionBody)(...args, ...additionalArguments);
    } as T;
};

/**
 * @description 将已提取的脚本函数体包装为异步组件属性函数。
 * @param functionBody componentFunctions 中保存的函数体；空值表示未配置。
 * @param parameterNames 按第三方组件原生回调顺序注入的参数名。
 * @returns 已配置时返回 Promise 形式的运行函数，否则返回 undefined。
 * @throws {SyntaxError} 脚本函数体语法无效时在首次调用生成函数时抛出。
 * @remarks 用于 beforeChange 等明确需要 Promise 包装的属性，脚本异常和拒绝会原样传播。
 */
export const createAsyncWidgetComponentFunction = function <T extends (...args: any[]) => Promise<any>>(functionBody: string | null | undefined, parameterNames: readonly string[]): T | undefined {
    if (!functionBody) {
        return undefined;
    }
    return async function (...args: any[]) {
        return new Function(...parameterNames, functionBody)(...args);
    } as T;
};
