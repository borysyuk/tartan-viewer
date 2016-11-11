'use strict';

var webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    library: 'app',
    libraryTarget: 'umd',
    filename: 'app.js',
    path: './dist'
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {test: /\.html$/, loader: 'raw'},
      {test: /\.json/, loader: 'json'}
    ]
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ]
};
