export function toast(title, options = { icon: 'none' }) {
  wx.showToast({
    title,
    ...options,
  });
}

