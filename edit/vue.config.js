const path = require("path");
const webpack = require("webpack");
const Alphabet = require("alphabetjs");
const chalk = require("chalk");
console.log(chalk.bgBlueBright("--------------------------------------------------"));
console.log(chalk.blue(Alphabet("desingner", "planar")));
console.log(chalk.bgBlueBright("--------------------------------------------------"));
const pkg = require("./package.json");
function pathResolve(dir) {
    return path.resolve(process.cwd(), ".", dir);
}

module.exports = {
    publicPath: "./",
    productionSourceMap: false,
    lintOnSave: true,
    pages: {
        index: {
            entry: "src/main.ts",
            template: "src/index.html",
            favicon: "src/assets/images/favicon.ico",
            filename: "index.html"
        }
    },
    configureWebpack: {
        resolve: {
            alias: {
                "@": pathResolve("src"),
                "@api": pathResolve("src/api"),
                "@imgs": pathResolve("src/assets/images"),
                "@style": pathResolve("src/assets/style"), // 样式
                "@components": pathResolve("src/components") // 组件
            }
        },
        output: {
            library: `${pkg.name}-[name]`,
            libraryTarget: "umd", // 把微应用打包成 umd 库格式
            jsonpFunction: `webpackJsonp_${pkg.name}`,
            globalObject: "window"
        }
    },
    chainWebpack: config => {
        config.module.rule("vue").use("vue-loader");

        config.module
            .rule("images")
            .test(/\.(png|jpe?g|gif|ico)(\?.*)?$/)
            .exclude.add(pathResolve("src/assets/static"))
            .end()
            .use("url-loader")
            .loader("url-loader")
            .tap(options => Object.assign(options, { limit: 10240 }))
            .end();

        config.module
            .rule("static-images")
            .test(/\.(png|jpe?g|gif|ico)(\?.*)?$/)
            .include.add(pathResolve("src/assets/static"))
            .end()
            .use("url-loader")
            .loader("url-loader")
            .end();

        config.module
            .rule("fonts")
            .test(/.(ttf|otf|eot|woff|woff2)$/)
            .use("url-loader")
            .loader("url-loader")
            .tap(options => {
                options = {
                    // limit: 10000,
                    name: "/static/fonts/[name].[ext]"
                };
                return options;
            })
            .end();

        config.plugin("define").tap(options => {
            // DefinePlugin注入全局变量
            options[0]["process.env"]["VUE_APP_BUILD_TIME"] = new Date().getTime();
            options[0]["process.env"]["VUE_APP_NAME"] = JSON.stringify(pkg.name);
            options[0]["process.env"]["VUE_APP_VERSION"] = JSON.stringify(pkg.version);
            return options;
        });

        // 自动分析重用的模块并且打包成单独的文件
        config.plugin("provide").use(webpack.ProvidePlugin, [
            {
                config: [pathResolve("src/config.ts"), "default"],
                logs: [pathResolve("src/services/logs.ts"), "default"]
            }
        ]);
    },
    devServer: {
        // proxy: "",
        // before: app => {
        //     // 启用mock
        //     // mock.init(app)
        // },
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        disableHostCheck: true, // 禁用服务检查
        hot: false,
        port: process.env.VUE_APP_PORT,
        open: true,
        overlay: {
            warnings: false,
            errors: true
        }
    }
};
