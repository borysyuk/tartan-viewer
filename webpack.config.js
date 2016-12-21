'use strict';

var webpack = require('webpack');

module.exports = {
  entry: {
    app: './src/index.js',
    lunr: './src/modules/lunr.js'
  },
  output: {
    library: 'app',
    libraryTarget: 'umd',
    filename: '[name].js',
    path: './dist'
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {test: /\.html$/, loader: 'raw'},
      {test: /\.json/, loader: 'json'},
      // Evaluate every @package.js and bundle pre-calculated exports
      // as a value. This allows to omit package.json file(s) from bundle.
      {test: /[\\/]@package\.js$/, loaders: ['raw', 'val']}
    ]
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ]
};
