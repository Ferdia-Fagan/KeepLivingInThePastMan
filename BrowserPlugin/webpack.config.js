
const path = require('path');
const webpack = require('webpack');

const CopyPlugin = require("copy-webpack-plugin");


// const CopyWebpackPlugin = require('copy-webpack-plugin');
// const WebExtWebpackPlugin = require('./web-ext-webpack-plugin.js');

// const MergeIntoSingle = require('webpack-merge-and-include-globally');

// const uglifyjs = require("uglify-js");
// const CopyPlugin = require('copy-webpack-plugin');
// var UnminifiedWebpackPlugin = require('unminified-webpack-plugin');
// const ConcatPlugin = require('webpack-concat-plugin');

// const CopyPlugin = require("copy-webpack-plugin");

new webpack.SourceMapDevToolPlugin({
  filename: "[file].map"
}),

//const PATHS = {
//    src: path.join(__dirname, 'src'), //absolute path to RepoDir/src
//    dist: path.join(__dirname, 'extension') //absolute path to RepoDir/dist
//}

module.exports = {
  entry: {
    // 'background_scripts/background_scripts':  [
    //   './src/background_scripts/background.js',
    // ],

    // 'sidebar/AnnotateWebPage/AnnotateWebPageMenu': [
    //   './src/sidebar/AnnotateWebPage/AnnotateWebPageMenu.js'
    // ],

    // 'sidebar/Query/QueryUI': [
    //   './src/sidebar/Query/QueryUI.js'
    // ],

    // 'sidebar/AutoCollector/AutoCollectorMenu': [
    //   './src/sidebar/AutoCollector/AutoCollectorMenu.js'
    // ],

    'contentScripts/WebpageExtractionLayer': [
      './src/contentScripts/WebPageExtractionLayer.js'
    ]
 },

  // devtool: 'eval-source-map',
  devtool: "source-map",

  mode: 'production',

  optimization: {
    minimize: false
  },

  /* watch: true,

  watchOptions: {
    poll: 1000,
    ignored: './node_modules'
  }, */

  output: {
    path: path.join(__dirname, 'extension'),
    filename: '[name].js',
    library: 'extension'
  },

  // module: {
  //   rules: [
  //     {
  //       test: /\.m?js$/,
  //       exclude: /(node_modules|bower_components)/,
  //       use: {
  //         loader: 'babel-loader',
  //         options: {
  //           presets: ['@babel/preset-env'],
  //           presets: ['@babel/plugin-proposal-class-properties']
  //         }
  //       }
  //     }
  //   ]
  // },

  resolve: {
    modules: ['./src', './node_modules'],
    alias: {
      // cheerio: 'cheerio',
      litepicker: 'litepicker',
      'page-metadata-parser': 'page-metadata-parser'
    },
    fallback: { "url": false }
  },

  // module:{
  //   loaders:[{
  //       exclude:/node_modules/,
  //       loader:'babel',
  //   }]
  // },

    plugins: [
        new CopyPlugin({
            patterns: [
              {
                from: "src",
//                to: "extension"
                globOptions: {
                  dot: true,
                  ignore: ["**/contentScripts/WebPageExtractionLayer.js"],
                },
              },
            ],
        }),
    ],

//  plugins: [
//
//    // presets: ["@babel/preset-env"],
//    // require("@babel/plugin-proposal-class-properties"),
//    // { loose: false }
//    // new webpack.DefinePlugin({
//    //   'process.env.NODE_ENV': JSON.stringify('development'),
//    // }),
//  ],
  // presets: ["@babel/preset-env"]
};
   