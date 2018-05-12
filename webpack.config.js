const path = require('path');
const fs = require('fs');
module.exports = {
  entry: function() {
    var files = fs.readdirSync('./js/entry/');
    var result = {};
    for (var i = 0; i < files.length; i++) {
      var filename = files[i];
      if (filename.endsWith('.js')) {
        eval("result." + filename.substr(0, filename.length - 3) + " = './js/entry/" + filename + "'");
      } else {
        continue;
      }
    }
    return result;
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './js/bundles')
  },
  module: {
    rules: [{
      test: /.jsx?$/,
      include: [
        path.resolve(__dirname, 'src')
      ],
      exclude: [
        path.resolve(__dirname, 'node_modules'),
        path.resolve(__dirname, 'bower_components')
      ],
      loader: 'babel-loader',
      query: {
        presets: ['es2015']
      }
    }]
  },
  resolve: {
    extensions: ['.json', '.js', '.jsx', '.css']
  },
  devtool: 'source-map',
  devServer: {
    publicPath: path.join('/dist/')
  }
};