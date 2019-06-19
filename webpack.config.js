const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env, argv) => {
    const isDev = argv.mode !== 'production';

    return {
        entry: './src/index.ts',
        resolve: {
            extensions: ['.ts', '.tsx', '.js']
        },
        devtool: isDev ? "source-map" : false,
        output: {
            filename: 'main.js',
            path: path.resolve(__dirname, 'dist')
        },
        module: {
            rules: [
                {
                    test: /\.s(a|c)ss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options:
                            {
                                url: false,
                                sourceMap: true
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options:
                            {
                                sourceMap: true
                            }
                        }
                    ]
                },
                { 
                    test: /\.tsx?$/, 
                    loader: 'awesome-typescript-loader'
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './src/index.html'
            }),
            new MiniCssExtractPlugin({
                filename: 'app.css'
            })
        ],
        mode: isDev ? 'development' : 'production'
    };
};