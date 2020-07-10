const webpack = require('webpack');
const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    output: {
        sourceMapFilename: "bundle.js.map"
    },
    devtool: "source-map",
    plugins: [
        new webpack.SourceMapDevToolPlugin({
            filename: 'bundle.js.map',
            exclude: './src/scripts/bot.js'
        })
    ],
    optimization: {
        minimize: false
    },
});
