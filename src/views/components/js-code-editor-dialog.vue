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
import { onMounted, onUnmounted, ref, nextTick } from "vue";
import * as monacoEditor from "monaco-editor";

const props = defineProps({
    value: {
        type: String,
        default: ""
    }
});

// 编辑器示例
let editorInstance: monacoEditor.editor.IStandaloneCodeEditor | null = null;

const emits = defineEmits(["close", "save"]);

// 弹窗显示状态
const dialogVisible = ref<boolean>(true);

// 编辑器容器
const codeEditorRef = ref<HTMLDivElement>();

// 弹窗关闭
const dialogClosed = function () {
    emits("close");
};

const save = function () {
    const code = editorInstance?.getValue() || "";
    emits("save", code);
    dialogVisible.value = false;
};

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
    let codeValue = props.value;

    // 方法2：拦截编辑操作，阻止在只读范围编辑
    editorInstance.onDidChangeModelContent(e => {
        // 如果正在恢复过程中，直接返回，避免无限递归
        if (isRestoring) {
            return;
        }
        const model = editorInstance!.getModel()!;
        // 获取当前模型的所有内容行
        const currentLines = model.getValue().split("\n");
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
