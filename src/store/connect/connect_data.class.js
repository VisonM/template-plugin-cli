import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';

/**
 * @class
 * @public
 */
export default class ConnectData {
  /**
    * @param {Object} context 调用的上下文
    * @param {Array<string>} dataList 绑定的key值为数组项，eg：connect(this, ['someKey'])
    * @param {Array<object>} dataList 绑定的key值为Object.key，
    *   并在store变化时触发Object.fn，eg：connect(this, [{key: 'someKey', fn: someFn}])
   */
  constructor(vm, dataList) {
    this._vm = vm;
    this._dataList = dataList;
    this._dataMap = {};
    this._route = getApp().globalData.getCurrentPage().route;
    this.randKey = parseInt(Math.random() * (10 ** 8), 10);
  }

  /**
   * 对比store中state的变化，并改变view的data
   *
   * @param {Object} state
   */
  compare(state) {
    // 非本页不处理
    // if (!this.isCurrentPage()) return;

    const data = {};
    const list = this._getList(this._dataList);

    list.forEach((key) => {
      const fn = this._dataList[key];

      const val = state[key];
      const oldVal = this._dataMap[key];
      if (!isEqual(val, oldVal)) {
        this._dataMap[key] = cloneDeep(val);

        if (fn) {
          fn.call(this._vm, val, oldVal);
        } else {
          data[key] = val;
        }
      }
    });

    if (Object.keys(data).length) this._vm.setData(data);
  }

  _getList(list) {
    return Object.prototype.toString.call(list) === '[object Array]'
      ? this._dataList
      : Object.keys(this._dataList);
  }

  /**
   * 当前页是否为data所在页面
   */
  isCurrentPage() {
    const p = getApp().globalData.getCurrentPage();

    if (!p) return false;

    return p.route === this._route;
  }
}
