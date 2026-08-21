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
