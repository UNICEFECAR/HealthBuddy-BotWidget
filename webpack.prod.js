const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');


module.exports = merge(common, {
    mode: 'production',
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
