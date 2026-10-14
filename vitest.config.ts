import path from "node:path";
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
    plugins: [vue()],
    test: {
        environment: "node",
        include: ["tests/unit/**/*.spec.ts", "tests/unit/**/*.test.ts"],
        globals: false
    },
    resolve: {
        alias: {
            // Monaco 是浏览器专用包且没有根入口；组件单测替代编辑器边界前仍需可解析的模块路径。
            "monaco-editor": path.resolve(__dirname, "node_modules/monaco-editor/esm/vs/editor/editor.api.js"),
            "@": path.resolve(__dirname, "src"),
            "@views": path.resolve(__dirname, "src/views"),
            "@components": path.resolve(__dirname, "src/components"),
            "@style": path.resolve(__dirname, "src/assets/style"),
            "@imgs": path.resolve(__dirname, "src/assets/images"),
            "@api": path.resolve(__dirname, "src/api"),
            "/#": path.resolve(__dirname, "types")
        }
    }
});
