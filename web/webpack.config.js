const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env, process) => {
  const isDev = process.mode === "development";

  const _plugins = [
    new MiniCssExtractPlugin({
      filename: "[name].css"
    }),
    new CssMinimizerPlugin(),
    new CleanWebpackPlugin()
  ];

  const config = {
    entry: {
      'app': "./app.js",
      'main' : "./main.scss"
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "./dist"),
      publicPath: "/dist/"
    },
    resolve: {
      modules: [ path.resolve(__dirname, "node_modules") ]
    },
    cache: {
      type: 'filesystem'
    },
    optimization: {
      minimize: !isDev,
      minimizer: [new TerserPlugin()]
    },
    devtool: isDev ? 'source-map' : false,
    watch: false,
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                url: false
              }
            },
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: [
                    require('autoprefixer')({
                      'overrideBrowserslist':  "defaults and supports es6-module"
                    }),
                    require('postcss-inline-svg')({
                      paths: [ path.resolve(__dirname, './src/images') ],
                      options: {
                        removeFill: true,
                        removeStroke: true
                      }
                    }),
                    require('postcss-svgo')
                  ]
                }
              }
            },
            "sass-loader"
          ]
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            'thread-loader',
            {
              loader: 'babel-loader',
              options: {
                cacheCompression: false,
                cacheDirectory: true,            
                plugins: [
                  "@babel/plugin-transform-optional-chaining",
                  "@babel/plugin-transform-nullish-coalescing-operator",
                  "@babel/plugin-transform-runtime"
                ]
              }
            }
          ]
        }
      ]
    },
    plugins: _plugins
  };

  return config;
};