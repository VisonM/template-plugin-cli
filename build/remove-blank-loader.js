const { getOptions } = require('loader-utils');
function main(source) {
  const options = getOptions(this) || {};
  if (!options.enable) {
    return source;
  }
  if (options.type === 'json') {
    const _source = JSON.stringify(JSON.parse(source));
    return _source;
  }
  if (options.type === 'xml') {
    var pd = require('pretty-data').pd;
    return pd
      .xmlmin(source)
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029');
  }
  return source.replace(/\s/g, '');
}
module.exports = main;
