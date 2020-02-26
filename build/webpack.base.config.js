const path = require('path');
const HappyPack = require('happypack');

const { resolve } = path;
const MinaRuntimePlugin = require('@tinajs/mina-runtime-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const WxMultiEntryPlugin = require('./WxMultiEntryPlugin');
/**
 * * used for measureing build time
 */
const smp = new SpeedMeasurePlugin();
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = ({
  isPro,
  isDisableMutil,
  isSplitRuntime = true,
  ignoreIndent,
  overFlow = false,
  isSplitCommon = true,
}) => ({
  output: {
    filename: '[name].js',
    publicPath: '/',
    globalObject: 'wx',
  },
  stats: {
    all: false,
    children: false,
    modules: true,
    maxModules: 0,
    errors: true,
    warnings: true,
    moduleTrace: true,
    errorDetails: true,
    // assets: true,
    builtAt: true,
  },
  mode: isPro ? 'production' : 'none',
  devtool: isPro ? false : 'inline-cheap-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: ['happypack/loader'],
      },
      {
        test: /\.json$/,
        type: 'javascript/auto', // issues https://github.com/webpack/webpack/issues/6586
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path]/[name].json',
            },
          },
          {
            loader: resolve(__dirname, './replace-url-loader.js'), // 独立分包专用
            options: {
              overFlow,
            },
          },
          {
            loader: resolve(__dirname, './remove-blank-loader.js'),
            options: {
              type: 'json',
              enable: isPro,
            },
          },
          {
            loader: 'webpack-comment-remover-loader',
          },
        ],
      },
      {
        test: /\.(w?)xml$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path]/[name].wxml',
            },
          },
          {
            loader: resolve(__dirname, './remove-blank-loader.js'),
            options: {
              enable: isPro,
              type: 'xml',
            },
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path]/[name].wxss',
            },
          },
        ]
          .concat(
            isPro
              ? [
                {
                  loader: 'postcss-loader',
                  options: {
                    plugins: [
                      require('cssnano')({
                        preset: [
                          'default',
                          {
                            calc: false,
                          },
                        ],
                      }),
                    ],
                  },
                },
              ]
              : [],
          )
          .concat([
            {
              loader: 'less-loader',
            },
          ]),
      },
    ],
  },
  plugins: [
    new HappyPack({
      // 3) re-add the loaders you replaced above in #1:
      loaders: ['babel-loader'],
    }),
  ]
    .concat(isSplitRuntime ? [new MinaRuntimePlugin()] : [])
    .concat(
      !isDisableMutil
        ? [
          new WxMultiEntryPlugin({
            ignoreIndependent: ignoreIndent,
          }),
        ]
        : [],
    )
    .concat(!isPro ? [new HardSourceWebpackPlugin()] : []), // https://github.com/mzgoddard/hard-source-webpack-plugin/issues/416
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
      // new UglifyJsPlugin({
      //   uglifyOptions: {
      //     compress: {
      //       drop_console: true
      //     }
      //   }
      // })
    ],
    ...(isSplitRuntime && {
      runtimeChunk: {
        name: 'runtime',
      },
    }),
    ...(isSplitCommon && {
      splitChunks: {
        chunks: 'all',
        name: 'common',
        minChunks: 2,
        minSize: 0,
      },
    }),
  },
  watchOptions: {
    ignored: /dist|manifest/,
    aggregateTimeout: 300,
  },
});
