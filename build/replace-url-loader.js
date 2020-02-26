const { getOptions } = require("loader-utils");
const { resolve, dirname, relative } = require("path");
const replaceExt = (input, replaceText) => input.replace(/\.[^/.]+$/, replaceText);
function main(source) {
  const options = getOptions(this) || {};

  if (options.overFlow) {
    const isSelf = !!options.overFlow.paths.find(entriesPath => entriesPath === replaceExt(this.resourcePath, ""));
    const _source = JSON.parse(source);
    if (_source.usingComponents && !isSelf) {
      _source.usingComponents = Object.keys(_source.usingComponents).reduce((pre, key) => {
        const _componentPath = resolve(dirname(this.resourcePath), `${_source.usingComponents[key]}`);
        const isInOverflow = options.overFlow.paths.find(entriesPath => entriesPath === _componentPath);
        let realPath = "";
        if (isInOverflow) {
          const _newComponentPath = resolve(
            options.overFlow.dirname,
            "./" + relative(options.overFlow.dirname, isInOverflow).replace(/\.\.\//g, "_/")
          );
          realPath = relative(dirname(this.resourcePath), _newComponentPath);
        }
        return {
          ...pre,
          ...{
            [key]: realPath ? realPath : _source.usingComponents[key]
          }
        };
      }, {});
      return JSON.stringify(_source);
    }
  }
  return source;
}
module.exports = main;
