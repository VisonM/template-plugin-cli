export default class ConnectList {
  static getList() {
    return this._connectList;
  }

  /**
   * 是否为空
   */
  static isListNull() {
    return !this._connectList.length;
  }

  /**
   * 增加监听项
   *
   * @param {ConnectData} connectObj
   */
  static add(connectObj) {
    const k = connectObj.randKey;
    this._connectMap[k] = connectObj;
    this._connectList.push(connectObj);

    return connectObj.randKey;
  }

  /**
   * 移除
   *
   * @param {number} randKey 监听项的key值
   */
  static remove(randKey) {
    delete this._connectMap[randKey];

    this._updateConnectList(this._connectMap);
  }

  /**
   * 移除当前页所有connect，在页面onUnload时调用
   *
   * @static
   * @public
   */
  static removePageAllConnect() {
    let isChange = false;

    this._connectList.forEach((item) => {
      if (item.isCurrentPage()) {
        isChange = true;
        delete this._connectMap[item.randKey];
      }
    });

    if (isChange) this._updateConnectList(this._connectMap);
  }

  /**
   * 更新_connectList
   *
   * @param {Array<ConnectData>} oMap
   */
  static _updateConnectList(oMap) {
    this._connectList = Object
      .keys(oMap)
      .map((key) => oMap[key]);
  }
}

ConnectList._connectMap = {}; // 存储所有ConnectData实例
ConnectList._connectList = []; // 将_connectMap转化为一个列表备份，方便遍历操作
