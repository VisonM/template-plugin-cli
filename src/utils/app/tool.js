const tabPage = '@/pages/index/index@'
  + '@/pages/personal/personal@';
const tools = {
  tabPage,
  /**
   * 获取当前页面对象
   */
  getCurrentPage() {
    const pages = getCurrentPages();
    return pages[pages.length - 1];
  },
  /**
   * 是否是一级页面
   *
   * @param {String} url 链接（默认当前页）
   */
  isTabPage(url) {
    let handleUrl = url;

    if (!handleUrl) {
      try {
        handleUrl = tools.getCurrentPage().route;
      } catch (err) {
        console.log(err);
      }
    }

    return tabPage.indexOf(handleUrl) >= 0;
  },
}

module.exports = tools;