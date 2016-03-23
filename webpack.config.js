'use strict';

var path = require('path');
var webpack = require('webpack');

var env = process.env.NODE_ENV;
var config = {
    entry: path.join(__dirname, 'src', 'main.ts'),
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'build')
    },
    devtool: 'cheap-module-eval-source-map',
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
    },
    module: {
        loaders: [
            {test: /\.ts$/, loader: 'ts-loader'}
        ]
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(env)
        })
    ]
};

// Production specific settings
if (env === 'production') {
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin()
    );
    config.output = {
        filename: 'bundle.min.js',
        path: path.join(__dirname, 'build')
    };
}

module.exports = config;
