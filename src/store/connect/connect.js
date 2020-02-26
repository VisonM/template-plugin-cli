import ConnectData from './connect_data.class';
import ConnectList from './connect_list.class';

let _unSubscribe = null;

export default (store) => (context, dataList) => {
  // 增加监听data项（randKey是取消监听的id）
  const randKey = ConnectList.add(new ConnectData(context, dataList));

  // 先执行一次
  handleConnectData(store, ConnectList.getList());

  // 再监听(全局唯一的subscribe)
  if (!_unSubscribe) {
    _unSubscribe = store.subscribe(
      () => handleConnectData(store, ConnectList.getList()),
    );
  }

  const p = getApp().globalData.getCurrentPage();
  const onUnloadFunc = p.onUnload;
  // 在页面退出后，自动解除与data的绑定
  p.onUnload = () => {
    onUnloadFunc.apply(this);
    ConnectList.removePageAllConnect();
  };

  return () => disconnect(randKey);
};

/**
 * 将redux值自动绑定到data
 *
 * @param {Object} store
 * @param {Array<ConnectData>} list
 * @private
 */
function handleConnectData(store, list) {
  const state = store.getState();

  list.forEach((connectData) => {
    connectData.compare(state);
  });
}

/**
 * 解除与view data的绑定
 *
 * @param {number} randKey
 * @private
 */
function disconnect(randKey) {
  ConnectList.remove(randKey);

  if (ConnectList.isListNull()) {
    // 如果不存在数据绑定则取消store的变化监听
    _unSubscribe();
  }
}
