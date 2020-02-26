// fork from https://juejin.im/post/5d00aa5e5188255a57151c8a#heading-2 and modify something to match requirements.
const MultiEntryPlugin = require("webpack/lib/MultiEntryPlugin");
const { relative } = require("path");
const getEntries = require("./getEntries");
class WxMultiEntryPlugin {
  constructor(options) {
    this.entries = {};
    if (options) {
      this.ignoreIndependent = options.ignoreIndependent;
    }
    this.getChangedFiles = this.getChangedFiles.bind(this);
  }
  getChangedFiles(compiler) {
    const { watchFileSystem } = compiler;
    const watcher = watchFileSystem.watcher || watchFileSystem.wfs.watcher;
    return Object.keys(watcher.mtimes);
  }
  applyEntry(compiler) {
    const { context } = compiler.options;
    Object.keys(this.entries).forEach(key => {
      new MultiEntryPlugin(context, this.entries[key].map(_entry => `./${relative(context, _entry)}`), key).apply(
        compiler
      );
    });
  }
  // apply 是每一个插件的入口
  apply(compiler) {
    const { context, entry } = compiler.options;
    // 找到所有的入口文件，存放在 entries 里面
    try {
      this.entries = getEntries(context, entry, context, this.ignoreIndependent);
    } catch (e) {
      if (typeof entry !== "string") {
        throw "WxMultiEntryPlugin : entry配置不是字符串";
      }
    }

    // 这里订阅了 compiler 的 entryOption 事件，当事件发生时，就会执行回调里的代码
    compiler.hooks.entryOption.tap("WxMultiEntryPlugin", () => {
      this.applyEntry(compiler);
      // 返回 true 告诉 webpack 内置插件就不要处理入口文件了，因为这里已经处理了
      return true;
    });
    // 监听 watchRun 事件
    compiler.hooks.watchRun.tap("WxMultiEntryPlugin", _compiler => {
      const changedFiles = this.getChangedFiles(_compiler);
      changedFiles.forEach(file => {
        if (file.indexOf(".json") !== -1) {
          console.log("watch:has json file change", file);
          const { context, entry } = _compiler.options;
          this.entries = getEntries(context, entry, context, this.ignoreIndependent);
        }
      });
      this.applyEntry(_compiler);
    });
  }
}

module.exports = WxMultiEntryPlugin;
