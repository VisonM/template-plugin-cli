;

let fns = require('./fns');

let sessionId = +new Date();
let sessionKey = 'session_';
var cache = {
  session: {
    set (k, v, asyncCB) {
			return cache.set(sessionKey+k, v, -1*sessionId, asyncCB)
		},
    get (k, asyncCB) {
			return cache.get(sessionKey+k, asyncCB)
		},
  },
  /**
	 * setter
	 * @param {String} k      key
	 * @param {Object} v      value
	 * @param {Number} expire 过期时间，毫秒，为负数的时候表示为唯一session ID，为 true 表示保持上一次缓存时间
	 * @param {Function} asyncCB optional, 是否异步、异步回调方法
	 */
  set (k, v, expire, asyncCB) {
		if (fns.type(expire) == 'function') {
			asyncCB = expire
			expire = 0
		} else if (asyncCB && fns.type(asyncCB) != 'function') {
			asyncCB = noop
		}
		var data = {
			expr: 0,
			data: v
		}
		var expireTime
		/**
		 * 保持上次缓存时间
		 */
		if (expire === true) {
			var _cdata = wx.getStorageSync('_cache_' + k)
			// 上次没有缓存，本次也不更新
			if (!_cdata) return
			// 使用上次过期时间
			data.expr = _cdata.expr || 0
			expireTime = 1
		}
		if (!expireTime) {
			expire = expire || 0
			if (expire > 0) {
				var t = + new Date()
				expire = expire + t
			}
			data.expr = +expire
		}
		/**
		 * 根据异步方法决定同步、异步更新
		 */
		if (asyncCB) {
			wx.setStorage({
				key: '_cache_' + k,
				data: data,
				success: function () {
					asyncCB()
				},
				fail: function (e) {
					asyncCB(e || `set "${k}" fail`)
				}
			})
		} else {
			try{
        wx.setStorageSync('_cache_' + k, data)
      } catch (e) {
        console.log('setStorageSync fail')
      }
		}
	},
  /**
	 * getter
	 * @param {String} k      key
	 * @param {Function} asyncCB optional, 是否异步、异步回调方法
	 */
  get (k, asyncCB) {
		if (asyncCB) {
			if (fns.type(asyncCB) != 'function') asyncCB = noop
			var errMsg = `get "${k}" fail`
			wx.getStorage({
				key: '_cache_' + k,
				success: function (data) {
					if (data && data.data) {
						asyncCB(null, _resolve(k, data.data))
					} else {
						asyncCB(data ? data.errMsg || errMsg : errMsg)
					}
				},
				fail: function (e) {
					asyncCB(e || errMsg)
				}
			})
		} else {
			return _resolve(k, wx.getStorageSync('_cache_' + k))
		}
	},
};
function _resolve(k, v) {
	if (!v) return null
	// 永久存储
	if (!v.expr) return v.data
	else {
		if (v.expr < 0 && -1*v.expr == sessionId) {
			// session
		 	return v.data
		} else if (v.expr > 0 && new Date() < v.expr) {
			// 普通存储
			return v.data
		} 
		 	wx.removeStorage({
		 		key: k
		 	})
			return null
		
	}
}
function noop() {}
module.exports = cache;
