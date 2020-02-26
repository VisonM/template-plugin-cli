import isEqual from 'lodash/isEqual';
import { combineReducers } from 'redux';



function systemInfo(state = {}) {
  if (!isEqual(state, {})) {
    return { ...state };
  }
  return wx.getSystemInfoSync();
}





const reducers = combineReducers({
  systemInfo,
});

export default reducers;
