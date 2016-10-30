'use strict';

var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    library: 'app',
    libraryTarget: 'umd',
    filename: 'js/app.js',
    path: './dist'
  },
  devtool: 'source-map',
  module: {
    loaders: [
      { test: /\.html$/, loader: 'raw' },
      { test: /\.json/, loader: 'json' },
      {
        test: /\.css/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
      },
      {
        test: /\.less/,
        loader: ExtractTextPlugin.extract(
          'style-loader', 'css-loader!less-loader')
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)(\?.*)?$/,
        loader: 'file?name=fonts/[name].[ext]'
      },
      {
        test: /\.(jpg|jpeg|gif|png|svg)(\?.*)?$/,
        loader: 'file?name=images/[name].[ext]'
      }
    ]
  },
  plugins:  [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    new ExtractTextPlugin('app.css')
  ]
};
