const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const Webpack = require('webpack');

module.exports = (env, argv) => {
    const isDev = argv.mode !== 'production';
    
    return {
        devtool: isDev ? "source-map" : false,
        entry: './src/index.tsx',
        mode: isDev ? 'development' : 'production',
        module: {
            rules: [
                {
                    test: /\.s(a|c)ss$/,
                    include: path.resolve(__dirname, 'src'),
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
                    test: /\.tsx$/,
                    include: path.resolve(__dirname, 'src'),
                    use: [
                        { 
                            loader: 'babel-loader', 
                            options: 
                            {
                                presets: ['@babel/preset-env'],
                                plugins: ["@babel/plugin-proposal-class-properties"]
                                //plugins: isDev ? ["transform-react-jsx-source"] : []
                            }
                        },
                        'awesome-typescript-loader',
                        //'babel-loader'
                    ]
                },
            ]
        },
        optimization: {
            splitChunks: {
                cacheGroups: {
                    styles: {
                        name: 'styles',
                        test: /\.css$/,
                        chunks: 'all',
                        enforce: true,
                    },
                },
            },
        },
        output: {
            filename: 'main.js',
            path: path.resolve(__dirname, 'dist')
        },
        performance: {
            hints: false
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './src/index.html'
            }),
            new MiniCssExtractPlugin({
                filename: 'app.css'
            })
        ],
        resolve: {
            extensions: ['.ts', '.tsx', '.js']
        }
    };
};