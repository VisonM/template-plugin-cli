import store from '../../store';

const app = getApp();

export function setNavigationBarColor(vm, config) {
  wx.setNavigationBarColor({ animation: true, ...config });
}

export function getNavBarHeight() {
  const { system, statusBarHeight } = store.getState().systemInfo;
  const pillPadding = system.indexOf('Android') !== -1 ? 8 : 4;
  const pillHeight = 32;
  return pillHeight + (pillPadding * 2) + statusBarHeight;
}

export function getPillSpace() {
  const { system } = store.getState().systemInfo;
  const pillSpace = system.indexOf('Android') !== -1 ? 95 + (10 * 2) : 87 + (7 * 2);
  return pillSpace;
}

export function getWindowHeight() {
  const { screenHeight } = store.getState().systemInfo;
  return screenHeight - getNavBarHeight();
}

export function determineTabPage(url) {
  let urlCopy = url;
  if (!urlCopy) {
    const pageList = getCurrentPages().slice(0);
    urlCopy = pageList[pageList.length - 1].route;
  }
  urlCopy = urlCopy.replace(/^\//, '');
  return app.globalData.tabPage.indexOf(urlCopy) > -1;
}
