const path = require('path')
const webpack = require('webpack')
const bablepolyfill = require('babel-polyfill');
const HtmlWebPackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
    entry: ['babel-polyfill', './src/client/index.js'],
    mode: 'development',
    devtool: 'source-map',
    devServer: {
        writeToDisk: true
    },
    output: {
        libraryTarget: 'var',
        library: 'TravelAPI'
    },
    stats: 'verbose',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            },
            {
                test: /\.s[ac]ss$/,
                use: [ 'style-loader', 'css-loader', 'sass-loader']
            },
            {
                test: /\.(png|svg|jpg|gif)$/i,
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]',
                }
            }
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: './src/client/views/index.html',
            filename: './index.html',
        }),
        new CleanWebpackPlugin({
            dry: true,
            verbose: true,
            cleanStaleWebpackAssets: true,
            protectWebpackAssets: false
        })
    ]
}