<template>
    <el-dialog v-model="dialogVisible" title="编写JavaScript事件代码" append-to-body destroy-on-close width="900px" class="html-editor-dialog" @closed="dialogClosed">
        <div ref="codeEditorRef" class="code-editor"></div>
        <template #footer>
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="save">应用</el-button>
        </template>
    </el-dialog>
</template>
<script setup lang="ts">
/**
 * @fileoverview JavaScript 脚本编辑弹窗，在 Monaco 中保护函数声明与闭合行并提交完整源码。
 * @remarks 弹窗只编辑源码，不在此执行用户脚本；应用和关闭分别通知父组件，Monaco 实例随弹窗组件卸载释放。
 */
import { onMounted, onUnmounted, ref, nextTick } from "vue";
import * as monacoEditor from "monaco-editor";

/**
 * @description 父级提供的完整函数源码，只用于初始化本次编辑会话。
 * @remarks 输入包含函数声明、函数体和闭合行；保存仍提交完整源码，由组件适配器提取运行函数体。
 */
const props = defineProps({
    /** 当前脚本初始完整源码；未提供时为空字符串。 */
    value: {
        type: String,
        default: ""
    }
});

/**
 * @description 当前弹窗持有的 Monaco 编辑器实例。
 * @remarks 使用普通变量保存第三方实例，避免 Vue 深度代理；组件卸载时统一 dispose。
 */
let editorInstance: monacoEditor.editor.IStandaloneCodeEditor | null = null;

// save 提交完整源码；close 通知父级移除当前弹窗实例。
const emits = defineEmits(["close", "save"]);

// 弹窗显示状态
const dialogVisible = ref<boolean>(true);

// 编辑器容器
const codeEditorRef = ref<HTMLDivElement>();

/**
 * @description 在弹窗关闭动画结束后通知父组件结束编辑会话。
 * @returns 无返回值；发出 close 事件。
 * @remarks 不在点击关闭时立即移除编辑器，先让 Dialog 完成关闭流程。
 */
const dialogClosed = function () {
    emits("close");
};

/**
 * @description 读取当前编辑源码并请求父级应用，然后关闭弹窗。
 * @returns 无返回值；先发出 save，再切换本地显示状态。
 * @remarks 编辑器尚不存在时沿用空源码回退；此处不编译或执行脚本。
 */
const save = function () {
    // 读取本次编辑结果，父级负责配置写入和函数体转换。
    const code = editorInstance?.getValue() || "";
    emits("save", code);
    dialogVisible.value = false;
};

/**
 * @description 等待编辑容器渲染完成后创建 Monaco，并注册首末行恢复规则。
 * @remarks nextTick 保证容器存在；用户只编辑函数体，修改声明或闭合行时恢复最近合法全文，保护既有脚本参数协议。
 */
onMounted(async function () {
    await nextTick();
    if (editorInstance) {
        return;
    }
    editorInstance = monacoEditor.editor.create(codeEditorRef.value!, {
        value: props.value,
        language: "javascript",
        automaticLayout: true, // 自适应容器宽高
        theme: "vs-dark", // 官方自带三种主题vs, hc-black, or vs-dark
        fontSize: 14,
        tabSize: 4,
        minimap: {
            enabled: false // 关闭小地图
        },
        scrollBeyondLastLine: false, // 禁止滚动到最后一行之外
        readOnly: false // 全局只读关闭，靠自定义范围控制
    });

    // 配置只读范围
    // const lines = props.value.split("\n");
    // 使用装饰视觉标记只读范围（添加背景色）
    // editorInstance.createDecorationsCollection([
    //     {
    //         range: new monacoEditor.Range(1, 1, 1, lines[0].length),
    //         options: {
    //             isWholeLine: true,
    //             className: "readonly-decoration",
    //             glyphMarginClassName: "readonly-glyph"
    //         }
    //     }
    // ]);

    // 防止无限递归的标志
    let isRestoring = false;
    // 最近一次未破坏首末行的完整源码，作为恢复基线而不是总回到初始值。
    let codeValue = props.value;

    /**
     * @description 在内容变更后检测函数边界是否被编辑，并恢复最近合法全文。
     * @remarks setValue 会再次触发此事件，必须先设置恢复标记跳过递归；边界检测使用变更区间和当前行数，未命中时更新恢复基线。
     */
    editorInstance.onDidChangeModelContent(e => {
        // 如果正在恢复过程中，直接返回，避免无限递归
        if (isRestoring) {
            return;
        }
        // 当前编辑器模型与本次实例一致，恢复写入也在同一个模型上完成。
        const model = editorInstance!.getModel()!;
        // 获取当前模型的所有内容行
        const currentLines = model.getValue().split("\n");
        // 一次编辑可能含多个变更区间，任一区间触碰边界就恢复整份合法源码。
        const editRanges = e.changes;
        // 检查是否修改了只读范围
        const isReadOnlyModified = editRanges.some(change => {
            // 检查是否修改了第一行（function 声明行）
            if (change.range.startLineNumber === 1 || change.range.endLineNumber === 1) {
                return true;
            }
            // 检查是否修改了最后一行（闭合 } 行）
            if (change.range.startLineNumber === currentLines.length || change.range.endLineNumber === currentLines.length) {
                return true;
            }
            return false;
        });

        // 如果修改了只读范围，恢复原样
        if (isReadOnlyModified) {
            isRestoring = true;
            model.setValue(codeValue);
            isRestoring = false;
        } else {
            codeValue = model.getValue();
        }
    });

    // 自动定位光标到可编辑区域 + 聚焦编辑器
    editorInstance.setPosition({ lineNumber: 2, column: 5 });
    editorInstance.focus();
});

/**
 * @description 释放 Monaco 编辑器及其关联模型监听资源。
 * @remarks destroy-on-close 不替代第三方实例清理；设置面板切换或弹窗移除均需要执行 dispose。
 */
onUnmounted(() => {
    if (editorInstance) {
        editorInstance.dispose();
    }
});
</script>
<style lang="scss" scoped>
.code-editor {
    height: 400px;
}
</style>
