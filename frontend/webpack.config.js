const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const outputPath = path.resolve(__dirname, 'public');

module.exports = {
    context: __dirname,
    devtool: 'sourcemap',
    entry:   {
        mainPage: './src/mainPage.js'
    },
    output:  {
        path:       outputPath,
        filename:   '_mainPage.js',
        publicPath: ''
    },
    module:  {
        rules: [
            {
                test: /\.css$/,
                use:  ExtractTextPlugin.extract({
                    use: 'css-loader'
                })
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin({
            filename:  '_[name].css',
            allChunks: true
        }),
        new CleanWebpackPlugin(['public'], {
            dry: false
        }),
        new HtmlWebpackPlugin({
            filename: '_mainPage.html',
            template: path.resolve(__dirname, 'src', 'mainPage.html'),
            favicon:  path.resolve(__dirname, 'src', '_logo.png'),
            hash:     true
        })
    ]
};