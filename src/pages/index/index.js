import store from 'src/store';
import {
  getUserData
} from "src/store/actions"

Page({
  data: {},
  onLoad(option) {
    store.dispatch(getUserData()).then(() => {
      console.log(store.getState());
    });
  },
})