const path = require('path');
const merge = require('webpack-merge');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpackNormalConfig = require('./webpack.normal.config.js');
const webpackIndentConfig = require('./webpack.indent.config.js');
const BaseConfig = require('./webpack.base.config');

function getInjection() {
  let serverType;

  if (process.env.API_ENV === 'production') {
    serverType = JSON.stringify('');
  } else if (process.env.API_ENV === 'release') {
    serverType = JSON.stringify('releaseapi/');
  } else if (process.env.API_ENV === 'test') {
    serverType = JSON.stringify('testapi/');
  } else {
    serverType = JSON.stringify('testapi/');
  }

  return {
    serverType,
    isPro: process.env.API_ENV === 'production' || process.env.API_ENV === 'release',
  };
}
const isPro = process.env.NODE_ENV !== 'development';

module.exports = (env) => webpackNormalConfig({
  isPro,
  commonConfig: {
    resolve: {
      modules: ['src', 'node_modules'],
      alias: {
        src: path.resolve(__dirname, '../src'),
        classes: path.resolve(__dirname, '../src/classes'),
        components: path.resolve(__dirname, '../src/components'),
      },
    },

    plugins: [
      new CopyPlugin([
        {
          from: 'sitemap.json',
          to: 'sitemap.json',
        },
        {
          from: 'wxs',
          to: 'wxs',
          ignore: ['*.less', '*.js'],
        },
        {
          from: 'components/template',
          to: 'components/template',
        },
        { from: 'images', to: 'images' },
        { from: 'wxParse', to: 'wxParse', ignore: ['*.less', '*.js'] },
        { from: 'wxs', to: 'promotion_pages/_/wxs', ignore: ['*.less', '*.js'] },
      ]),
      new webpack.DefinePlugin({
        INJECTION_FROM_WEBPACK: getInjection(),
      }),
    ],
  },
}).concat(
  webpackIndentConfig({
    isPro,
    commonConfig: {
      resolve: {
        modules: ['src', 'node_modules'],
        alias: {
          src: path.resolve(__dirname, '../src'),
          classes: path.resolve(__dirname, '../src/classes'),
          components: path.resolve(__dirname, '../src/components'),
        },
      },
      plugins: [
        new webpack.DefinePlugin({
          INJECTION_FROM_WEBPACK: getInjection(),
        }),
      ],
    },
  }),
);
