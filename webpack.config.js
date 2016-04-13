'use strict';

var path = require('path');
var webpack = require('webpack');
var GitSHAPlugin = require('git-sha-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');

var env = process.env.NODE_ENV;
var config = {
    entry: path.join(__dirname, 'src', 'main.ts'),
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
        }),
        new GitSHAPlugin({shaLength: 7}),
        new HtmlWebpackPlugin({
            title: 'Router Hijack',
            filename: 'index.html'
        })
    ]
};

// Development specific settings
if (env === 'development') {
    config.devtool = 'source-map';
    config.output = {
        filename: 'bundle-dev.js',
        path: path.join(__dirname, 'dist', 'dev')
    };
}

// production specific settings
if (env === 'production') {
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin()
    );
    config.plugins.push(
        new CleanWebpackPlugin(path.join('dist', 'prod'))
    )
    config.output = {
        filename: 'bundle-[chunkgitsha].min.js',
        path: path.join(__dirname, 'dist', 'prod')
    };
}

module.exports = config;
