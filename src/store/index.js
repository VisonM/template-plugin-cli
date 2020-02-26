import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import connect from 'src/store/connect/connect';
import reducers from './reducers';

const store = createStore(reducers, applyMiddleware(thunk));

/**
 * 将指定state绑定到view的data上
 *
 * @usage 1、store.connect(this, ['dataA', 'dataB']) // 自动绑定setData
 *        2、store.connect(this, {
 *          dataA: () => {...}
 *          dataB: () => {...}
 *        })
 * @returns {Function} 解除绑定方法。⚠️注意：内部做了在页面onUnload时解除当前页面所有connect的操作，
 *                     但原则上最好还是手动解除，因为relaunch的时候非当前tab页是不会触发onUnload的
 * @public
 */
store.connect = connect(store);

export default store;
