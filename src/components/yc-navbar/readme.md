# 顶栏组件

## 基础用法

```html
<yc-navbar title="有车以后"></yc-navbar>
```

## 参数

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| color | string | 标题字体颜色 |
| background | string | 标题栏背景色 |
| hideTitle | bool | 隐藏标题栏，此时可以使用```slot```自定义标题位置的行为，```slot```默认放置在标题位置，居中布局
| title | string | 页面标题
| hideShare | bool | 隐藏分享
| hideHome | bool | 隐藏主页
| showMessageSetting | bool | 是否显示消息设置
| customBack | bool | 自定义返回行为，点击返回会触发```back```事件