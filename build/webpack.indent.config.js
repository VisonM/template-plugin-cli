const merge = require("webpack-merge");
const BaseConfig = require("./webpack.base.config");
const { resolve, dirname, relative } = require("path");
const appJsonPath = resolve(__dirname, "../src/app.json");
const getIndentEntries = require("./getEntries");
const appJson = require(appJsonPath);
const { subPackages = [] } = appJson;
const entries = {};
// 处理主包外的组件
const overFlow = {};
subPackages.forEach(subPackage => {
  const { independent, pages, root } = subPackage;
  if (independent) {
    const _dirname = resolve(dirname(appJsonPath), "./" + root);
    pages.forEach(page => {
      entries[root] = {
        ...entries[root],
        ...getIndentEntries(_dirname, `./${page}`, _dirname, true)
      };
    });

    Object.keys(entries[root]).map(key => {
      // key相对于独立分包的context
      // 找出超出context的部分
      const entriesPath = resolve(_dirname, key);
      const relToAppRoot = relative(_dirname, entriesPath);
      if (~relToAppRoot.indexOf("../")) {
        // 相对于context生成,反着来
        entries[root][key.replace(/\.\.\//g, "_/")] = entries[root][key];
        delete entries[root][key];
        if (!overFlow[root]) {
          overFlow[root] = {};
          overFlow[root].dirname = _dirname;
          overFlow[root].paths = [];
        }
        overFlow[root].paths.push(entriesPath);
      }
    });
  }
});

const webpackConfigs = ({ isPro, commonConfig }) =>
  Object.keys(entries).map(key => {
    return merge(
      BaseConfig({ isPro, isSplitCommon: true, isDisableMutil: true, overFlow: overFlow[key], isSplitRuntime: true }),
      {
        entry: entries[key],
        context: resolve(dirname(appJsonPath), `./${key}`),
        output: {
          path: resolve(__dirname, `../dist/${key}`),
          jsonpFunction: `webpackJsonp_${key}`
        }
      },
      commonConfig
    );
  });
module.exports = webpackConfigs;
