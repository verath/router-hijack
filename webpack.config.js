'use strict';

var path = require('path');
var child_process = require('child_process');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');


function parseGitRevision() {
    var revParse = '';
    try {
        revParse = child_process.execSync('git rev-parse HEAD');
    } catch (e) {
        console.warn('Could not parse git revision!');
    }
    return revParse.toString().trim();
}

var env = process.env.NODE_ENV;
var config = {
    entry: {
        app: path.join(__dirname, 'src', 'main.ts'),
        netgear_wgt624v3: path.join(__dirname, 'src', 'exploit', 'netgear_WGT624v3.ts')
    },
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
        new HtmlWebpackPlugin({
            chunks: ['app'],
            title: 'Router Hijack',
            filename: 'index.html',
            hash: true
        })
    ]
};

// Development specific settings
if (env === 'development') {
    config.devtool = 'source-map';
    config.output = {
        filename: '[name].js',
        path: path.join(__dirname, 'dist', 'dev')
    };
}

// production specific settings
if (env === 'production') {
    var gitRevision = parseGitRevision();

    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}})
    );
    config.plugins.push(
        new webpack.BannerPlugin('Router Hijack - rev ' + gitRevision)
    );
    config.plugins.push(
        new CleanWebpackPlugin(path.join('dist', 'prod'))
    );
    config.output = {
        filename: '[name].js',
        path: path.join(__dirname, 'dist', 'prod')
    };
}

module.exports = config;
