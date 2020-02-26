# 订阅消息的开发总结

> 订阅消息是为了避免频繁打扰用户而出的，替换模板消息的模式。所以，他的推送能力与权限是不如模板消息的。

### 使用

```javascript
 //参数说明 tmplIds:Array 微信后台申请订阅消息模板。一次调用最多可订阅3条消息，但是注意客户端的版本是否支持

 wxSubscribeMessage(){
    const tmplIds=['VcwUEMri507_gxg_XTWHxVSvT9kdIjHLt0TK0Tb4s7E',...]
    return new Promise((resolve,reject)=>{
      wx.requestSubscribeMessage({
        tmplIds,
        success (res) {
          //for(let key in tmplIds){
          //  if(res[key]==='accept'){
          //    console.log("已接受xxx权限")
          //  }else{
          //    console.log("拒绝了xxx权限")
          //  }
          //}
          resolve(res)
        },
        fail(e){
          reject(e)
        },
        complete(){
          //todo
        }
      })
    })
  },
```

```javascript
  // 有些需求，如发表评论也需要订阅消息，但这种场景不适宜频繁触发授权弹窗（也没必要），所以产品设置了一天触发一次的规则

  // 公共方法：
  getApp().globalData.timeLimitSubscribeMessage(templateId);
```

### 说明

> [文档链接](https://developers.weixin.qq.com/miniprogram/dev/api/open-api/subscribe-message/wx.requestSubscribeMessage.html)

1. 订阅消息分为1次订阅与长期订购，目前长期订阅只服务于特定的政府、金融、教育等少数类型小程序

2. 用户可以拒绝或者允许并勾选当前小程序不再弹出订阅提醒，则以后调用``wx.requestSubscribeMessage``都会返回当时用户的选择（允许或者拒绝），``不代表已永久接受推送``

3. 无法通过for循环等硬核手段来实现（必须是有手动点击按钮才弹窗），微信已对此类骚操作做处理。

4. 目前（2020-01-06）来说，有车以后的评论，签到等都是受影响的

5. 别想着能做到以前模板消息的效果,能做的就是更多的弹wx.requestSubscribeMessage...

### 注意

1. 服务端发送推送是中台那边处理的，服务器业务处理是直接发mq消息队列到那边的，无回调。所以有问题，找中台直接看日志就行。

2. 订阅消息``参数值内容限制`` 每项都要注意符合参数值要求，例如``类型限制，字数限制``，不然微信直接抛异常的。详见 https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/subscribe-message/subscribeMessage.send.html

3. 后端常见的错误
    1. 如果使用完次数, 微信官方接口,返回错误消息user refuse to accept the msg hint: [SDqora08824129]
    1. 如果用户主动拒绝消息, 微信官方接口,返回错误消息user refuse to accept the msg hint: [SDqora08824129]

4. 云开发可简单实现订阅消息推送，有意者试

```javascript
//templateSend云函数
const cloud = require('wx-server-sdk')
cloud.init()
exports.main = async (event, context) => {
  try {
    let { templateId,data } = event
    let { OPENID } = cloud.getWXContext()
    const result = await cloud.openapi.subscribeMessage.send({
      touser: OPENID,
      page: 'index',
      data,
      templateId
    })
    return result
  } catch (err) {
    console.log(err)
    return err
  }
}
//页面调用
wx.cloud.callFunction({
  // 需调用的云函数名
  name: 'templateSend',
  // 传给云函数的参数
  data: {
    templateId,
    data: {
      phrase1: {//phrase1为申请模板的参数值，可在后台模板id详情查看，例如为{{phrase1.DATA}}，微信说叫啥就是啥，别乱改参数名字，不然会报错，例如data.phrase1.value is empty
        value: '真品'
      },
      name2: {
        value: 'Vision_X'
      },
      thing3: {
        value: '大宝剑'
      }
    },
  },
  // 成功回调
  complete: (res)=>{
    console.log(res)
  }
})
```

### 可能会遇到的问题
1. 部分ios机型在激活输入法键盘的时候，直接去触发订阅消息授权，会导致键盘不会自动消失，目前发现有这个问题的机型：iphone7、iphoneX。估计是小程序自身的bug，目前可以调用wx.hideKeyboard接口来手动关闭键盘。