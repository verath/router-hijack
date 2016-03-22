'use strict';

var webpack = require('webpack');

var env = process.env.NODE_ENV;
var config = {
    module: {
        loaders: [
            // Run .js files trough babel
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader'
            }
        ]
    },
    output: {
        filename: 'bundle.js',
        path: './built'
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(env)
        })
    ]
};

if(env === 'production') {
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin()
    )
}

module.exports = config;
