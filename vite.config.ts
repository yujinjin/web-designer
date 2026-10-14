import path from "node:path";
// import { type PluginOption, defineConfig } from "vite";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import svgLoader from "vite-svg-loader";
import monacoEditorPlugin from "vite-plugin-monaco-editor";
// import createSvgSpritePlugin from "vite-plugin-svg-sprite";

// console.info("monacoEditorPlugin:", isCDN);

export default defineConfig(({ command }) => {
    // 仅区分 Vite 开发服务和静态构建，不再维护自定义部署环境模式。
    const isDev = command === "serve";

    const PROJECT_CONTENT_PATH = isDev ? "/" : "/pc-form/";

    return {
        base: PROJECT_CONTENT_PATH,
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
        },
        define: {
            VITE_APP_BUILD_TIME: new Date().getTime(),
            VITE_APP_PROJECT_CONTENT_PATH: JSON.stringify(PROJECT_CONTENT_PATH)
        },
        // 配置monaco-editor
        // optimizeDeps: {
        //     include: ["monaco-editor"]
        // },
        // plugins,
        plugins: [
            vue(),
            vueJsx(),
            // createSvgSpritePlugin({
            //     symbolId: "icon-[name]"
            // })
            svgLoader({
                defaultImport: "component"
            }),
            // @ts-ignore
            monacoEditorPlugin.default({
                languageWorkers: ["editorWorkerService", "json", "css", "html", "typescript"],
                publicPath: "monacoeditorwork",
                // base 是部署 URL 前缀，不是磁盘目录；避免插件默认生成 dist/pc-form/monacoeditorwork 导致部署后路径重复。
                customDistPath: (root: string, outDir: string) => path.resolve(root, outDir, "monacoeditorwork")
            })
        ],
        esbuild: {
            drop: isDev ? [] : ["console", "debugger"]
        },
        server: {
            host: true,
            port: 8081,
            proxy: {
                // '/api': 'http://localhost:4567'
            },
            warmup: {
                clientFiles: ["./src/views/**/*.vue"]
            }
        },
        build: {
            rollupOptions: {
                output: {
                    entryFileNames: "assets/js/[name]-[hash].js",
                    chunkFileNames: "assets/js/[name]-[hash].js",
                    assetFileNames: assetInfo => {
                        if (assetInfo.names[0]?.endsWith(".css")) {
                            return "assets/style/[name]-[hash].[ext]";
                        } else if (/\.(eot|svg|ttf|woff|woff2)$/.test(assetInfo.names[0])) {
                            return "assets/fonts/[name]-[hash].[ext]";
                        } else if (/\.(png|jpg|jpeg|gif|webp|bmp|svga|apng|tif)$/.test(assetInfo.names[0])) {
                            return "assets/images/[name]-[hash].[ext]";
                        }
                        return "assets/[ext]/[name]-[hash].[ext]";
                    }
                    // 由 Rollup 按依赖关系自动分包；手动拆分 Vue、Element Plus 和 CMS 组件会形成分包循环，导致初始化时访问尚未创建的 ref 内部类。
                }
            }
        }
        // worker: {
        //     rollupOptions: {
        //         output: {
        //             chunkFileNames: "assets/js/monaco-editor/worker-[name]-[hash].js"
        //         }
        //     }
        // }
    };
});
