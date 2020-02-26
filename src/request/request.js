import {
  cname
} from './app-info';

/* 正服是空字符串，测服是 testapi/ */
export const servertype = INJECTION_FROM_WEBPACK.serverType;

const oldHost = `https://api.s.suv666.com/${servertype}`;

const verString = '4.12.0';
// 最前一位是UI版本，中间一位是产品迭代版本，最后一位是开发迭代版本

export const c_ver = computeVersion(verString);

function computeVersion(version) {
  const verArr = version.split('.');

  return verArr[0] * 1e5 + verArr[1] * 1e3 + verArr[2] * 1;
}

function showToast(text) {
  if (text) {
    wx.showToast({
      title: text,
      icon: 'none',
      duration: 1500,
    });
  }
}


function ajax(url, data) {
  return new Promise((resolve, reject) => {
    if (typeof data === 'object') {
      data = JSON.stringify(data);
    }
    const postJson = {
      ctype: 4,
      cname,
      c_ver,
      data,
    };
    const header = {
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    };

    let myHost = oldHost;
    const apiUrl = `${myHost.replace(/\/$/, '')}/${url.replace(/^\//, '')}`

    wx.request({
      url: apiUrl,
      data: postJson,
      method: 'post',
      header,
      success(res) {
        console.log(res)
        resolve(res)
      },
      fail(res) {
        reject(res);
        showToast('网络超时', url);
      },
    });
  });
}

export {
  ajax
};