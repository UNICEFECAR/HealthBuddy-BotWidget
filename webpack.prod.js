const webpack = require('webpack');
const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');


module.exports = merge(common, {
    mode: 'production',
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ],
    optimization: {
        minimizer: [new TerserPlugin({
            cache: true,
            sourceMap: false,
            extractComments: false,
            terserOptions: {
                output: {
                    comments: false,
                },
                warnings: false
            },
        })],
    },
    stats: 'errors-only'
});
