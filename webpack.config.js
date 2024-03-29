const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
    const isDev = argv.mode !== "production";

    return {
        devtool: isDev ? "source-map" : false,
        entry: "./src/index.tsx",
        externals: {
            // lodash: "_",
        },
        mode: isDev ? "development" : "production",
        module: {
            rules: [
                {
                    test: /\.s(a|c)ss$/,
                    include: path.resolve(__dirname, "src/css"),
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader",
                            options:
                            {
                                url: false,
                                sourceMap: true
                            }
                        },
                        {
                            loader: "sass-loader",
                            options:
                            {
                                sourceMap: true
                            }
                        }
                    ]
                },
                {
                    test: /\.(t|j)sx?$/,
                    include: path.resolve(__dirname, "src"),
                    exclude: [
                        /\bnode-modules\b/,
                        /\bdeprecated\b/,
                    ],
                    use: [
                        "babel-loader",
                        "awesome-typescript-loader",
                    ]
                },
            ]
        },
        optimization: {
            minimizer: [
                new TerserPlugin({
                    extractComments: false,
                    terserOptions: {
                        compress: {
                            toplevel: true,
                            unsafe: true,
                        },
                        output: {
                            comments: false
                        }
                    }
                })
            ],
            splitChunks: {
                cacheGroups: {
                    styles: {
                        name: "styles",
                        test: /\.css$/,
                        chunks: "all",
                        enforce: true,
                    },
                },
            },
        },
        output: {
            filename: "main.js",
            path: path.resolve(__dirname, "dist")
        },
        performance: {
            hints: false
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: "./src/index.html"
            }),
            new MiniCssExtractPlugin({
                filename: "app.css"
            }),
            new CopyPlugin([
                { from: "assets", to: "assets" }
            ])
        ],
        resolve: {
            alias: {
                "react": "preact/compat",
                "react-dom/test-utils": "preact/test-utils",
                "react-dom": "preact/compat",
            },
            extensions: [".ts", ".tsx", ".js", ".scss"]
        }
    };
};