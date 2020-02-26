
import { isTabPage, goBackHome } from 'src/utils/app/tool';
import store from '../../store';
import { getNavBarHeight, getPillSpace } from './navbar-util';

const app = getApp();

Component({
  properties: {
    color: {
      type: String,
      value: '#000',
    },
    background: {
      type: String,
      value: '#fff',
      observer(newVal) {
        const whiteColorList = ['#fff', '#ffffff', 'white'];
        const isWhite = whiteColorList.some((i) => i === newVal);
        wx.setNavigationBarColor({
          frontColor: isWhite ? '#000000' : '#ffffff',
          backgroundColor: isWhite ? '#ffffff' : '#000000',
        });
      },
    },
    hideTitle: {
      type: Boolean,
      value: false,
    },
    title: {
      type: String,
      value: '有车群空间',
    },
    hideShare: {
      type: Boolean,
      value: false,
    },
    hideHome: {
      type: Boolean,
      value: false,
    },
    hideNav: {
      type: Boolean,
      value: false,
    },
    customBack: {
      type: Boolean,
      value: false,
    },
    showMessageSetting: {
      type: Boolean,
      value: false,
    },
    showModify: {
      type: Boolean,
      value: false,
    },
    showSwitchZone: {
      type: Boolean,
      value: true,
    },
    showStoreSearch: {
      type: Boolean,
      value: false,
    },
    showStoreHome: {
      type: Boolean,
      value: false,
    },
    shareData: Object, // 分享埋点参数
  },
  data: {
    statusBarHeight: store.getState().systemInfo.statusBarHeight,
    navbarPaddingRight: getPillSpace(),
    isIndex: false, // 是否首页
  },
  lifetimes: {
    attached() {
      const pageList = getCurrentPages();
      const isIndex = pageList[pageList.length - 1].route.includes('pages/index/index');

      this.setData({
        hideNavBack: pageList.length === 1,
        isIndex,
        navbarHeight: getNavBarHeight() - this.data.statusBarHeight,
        isTabPage: isTabPage(),
      });
    },

    detached() {
      if (this.removeMessageListener) {
        this.removeMessageListener();
      }

      if (this.storeDisconnect) {
        this.storeDisconnect();
      }
    },
  },
  pageLifetimes: {
    show() {
    },
  },
  methods: {
    navigateToHome() {
      goBackHome();
    },
    navBack() {
      if (this.data.customBack) {
        this.triggerEvent('back');
        return;
      }
      wx.navigateBack();
    },
    onShareClick() {
    },
    /* 跳转其他小程序事件  成功、失败 */
    navigatorSuccess(e) {
      const { appid, source } = e.currentTarget.dataset;
    },
    navigatorFail(e) {
      const { appid, source } = e.currentTarget.dataset;
     
    },
    switchZone() {
      this.setData({
        zonePanelVisible: true,
      });
    },

    goToMessageSetting() {
      wx.navigateTo({
        url: '/personal_pages_message_center/pages/setting/setting',
      });
    },
    goToModify() {
      this.triggerEvent('modify');
    },
    goToStoreSearchPage() {
      this.triggerEvent('search');
    },
    navigateToStoreHome() {
      wx.switchTab({
        url: '/pages/prestige_store/prestige_store',
      });
    },
    onUserShare() {
      this.triggerEvent('share');
    },
  },
});
