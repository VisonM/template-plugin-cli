import Message from './lib/message';
import queryParse from 'src/utils/queryParse';

const fns = require('./lib/fns.js');
const cache = require('./lib/cache');

// 扩展
const dispatcher = new Message();
let routeResolve;
let nameResolve;

function route({ type }) {
  // url: $page[?name=value]
  let timer = 0;
  let pending = false;
  return function innerRoute(url, config) {
    const parts = url.split(/\?/);
    let pagepath = parts[0];
    if (/^[\w\-]+$/.test(pagepath)) {
      pagepath = routeResolve(pagepath);
    }
    if (!pagepath) {
      throw new Error('Invalid path:', pagepath);
    }
    config = config || {};
    // append querystring
    config.url = pagepath + (parts[1] ? `?${parts[1]}` : '');

    if (pending) return;
    pending = true;
    clearTimeout(timer);
    /**
     * 2s内避免重复的跳转
     */
    timer = setTimeout(() => {
      pending = false;
    }, 2000);
    wx[type](config);
  };
}
function delegateRoute() {
  const _route = route({ type: 'navigateTo' });
  return function (e) {
    if (!e) return;
    const dataset = e.currentTarget.dataset;
    const before = dataset.before;
    const after = dataset.after;
    const url = dataset.url;
    const ctx = this;
    try {
      if (ctx && before && ctx[before]) ctx[before].call(ctx, e);
    } finally {
      if (!url) return;
      _route(url);
      if (ctx && after && ctx[after]) ctx[after].call(ctx, e);
    }
  };
}
function preload(url) {
  const name = getPageName(url);
  name && dispatcher.emit(`preload:${name}`, url, queryParse(url.split('?')[1]));
}

function getPageName(url) {
  const m = /^[\w\-]+(?=\?|$)/.exec(url);
  return m ? m[0] : nameResolve(url);
}

export const setRouteConfig = (value) => {
  if (fns.type(value) == 'string') {
    const PATH_REG = new RegExp(`^${value
      .replace(/^\/?/, '/?') // / => /?
      .replace(/[\.]/g, '\\.') // . => \.
      .replace('$page', '([\\w\\-]+)')}`); // $page => ([\w\-]+)
    routeResolve = function (name) {
      // make nagigateTo({url:'routeName'}) work
      return v.replace(/\$page/g, name);
    };
    nameResolve = function (url) {
      const m = PATH_REG.exec(url);
      return m ? m[1] : '';
    };
  } else {
    console.error('Illegal routes option:', v);
  }
};

export const componentRegister = (option) => {
  option.methods.$on = function () {
    return dispatcher.on(...arguments);
  };
  option.methods.$emit = function () {
    return dispatcher.emit(...arguments);
  };
  option.methods.$off = function () {
    return dispatcher.off(...arguments);
  };
  Component(option);
  return option;
};


export const PageRegister = (name, option) => {
  if (option.onPreload) {
    dispatcher.on(`preload:${name}`, (url, query) => {
      option.onPreload({ url, query });
    });
  }
  option.$preload = preload;
  option.$name = name;
  option.$session = cache.session;
  option.$route = route({ type: 'navigateTo' });
  option.$bindRoute = delegateRoute();
  option.$on = function () {
    return dispatcher.on(...arguments);
  };
  option.$emit = function () {
    return dispatcher.emit(...arguments);
  };
  option.$off = function () {
    return dispatcher.off(...arguments);
  };
  /**
   * setData wrapper, for component setData with prefix
   * @param {String} prefix prefix of component's data
   * @param {Object} data
   */
  option.$setData = function (prefix, data) {
    if (fns.type(prefix) == 'string') {
      const props = {};
      fns.objEach(data, (k, v) => {
        props[`${prefix}.${k}`] = v;
      });
      return this.setData(props);
    } else if (fns.type(prefix) == 'object') {
      return this.setData(prefix);
    }
  };
  /**
   * AOP life-cycle methods hook
   */
  option.onLoad = fns.wrapFun(option.onLoad, () => {
    option.$emit('onLoad');
  });
  // register page
  Page(option);
  return option;
};
