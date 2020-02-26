const undef = void 0;
function hasOwn(obj, prop) {
  return obj && obj.hasOwnProperty && obj.hasOwnProperty(prop);
}
const fns = {
  type(obj) {
    if (obj === null) return 'null';
    else if (obj === undef) return 'undefined';
    const m = /\[object (\w+)\]/.exec(Object.prototype.toString.call(obj));
    return m ? m[1].toLowerCase() : '';
  },
  objEach(obj, fn) {
    if (!obj) return;
    for (const key in obj) {
      if (hasOwn(obj, key)) {
        if (fn(key, obj[key]) === false) break;
      }
    }
  },
  wrapFun(pre, wrapper) {
    return function () {
      try {
        wrapper && wrapper.apply(this, arguments);
      } finally {
        pre && pre.apply(this, arguments);
      }
    };
  },
};

module.exports = fns;
