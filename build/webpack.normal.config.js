const BaseConfig = require("./webpack.base.config");
const webpack = require("webpack");
const merge = require("webpack-merge");
const path = require("path");
const webpackConfig = ({ isPro, commonConfig }) => [
  merge(
    BaseConfig({ isPro, isDisableMutil: false, ignoreIndent: true, isSplitCommon: true }),
    {
      entry: "./app.js",
      context: path.resolve(__dirname, "../src"),
      output: {
        path: path.resolve(__dirname, "../dist")
      }
    },
    commonConfig
  )
];

module.exports = webpackConfig;
