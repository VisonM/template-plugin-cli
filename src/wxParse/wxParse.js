/**
 * author: Di (微信小程序开发工程师)
 * organization: WeAppDev(微信小程序开发论坛)(http://weappdev.com)
 *               垂直微信小程序开发交流社区
 *
 * github地址: https://github.com/icindy/wxParse
 *
 * for: 微信小程序富文本解析
 * detail : http://weappdev.com/t/wxparse-alpha0-1-html-markdown/184
 */

/**
 * utils函数引入
 **/
import showdown from './showdown.js';
import HtmlToJson from './html2json.js';
/**
 * 配置及公有属性
 **/
var realWindowWidth = 0;
var realWindowHeight = 0;
wx.getSystemInfo({
  success: function (res) {
    realWindowWidth = res.windowWidth
    realWindowHeight = res.windowHeight
  }
})
/**
 * 主函数入口区
 **/
function wxParse(bindName = 'wxParseData', type='html', data='<div class="color:red;">数据不能为空</div>', target,imagePadding, carTextInfoList = [], bindData = {}) {
  var that = target;
  var transData = {};//存放转化后的数据
  if (type == 'html') {
    const htmlData = carTextInfoParse(data, carTextInfoList);

    transData = HtmlToJson.html2json(htmlData, bindName, that);
  } else if (type == 'md' || type == 'markdown') {
    var converter = new showdown.Converter();
    var html = converter.makeHtml(data);
    transData = HtmlToJson.html2json(html, bindName, that);
  }
  transData.view = {};
  transData.view.imagePadding = 0;
  if(typeof(imagePadding) != 'undefined'){
    transData.view.imagePadding = imagePadding
  }
  bindData[bindName] = transData;
  that.setData(bindData)
  that.wxParseImgLoad = wxParseImgLoad;
  that.wxParseImgTap = wxParseImgTap;
  // 帖子方法，避免资讯报错
  if (!that.blockTap) {
    that.blockTap = () => {};
  }
}

// 图片预览
function wxParseImgTap(e) {
  const { src } = e.currentTarget.dataset;
  const { previewImageUrls } = this.data;
  let curImg = '';

  if (!previewImageUrls || !previewImageUrls.length) return;

  const previewImages = previewImageUrls.map((img, index) => {
    const compressImg = getApp().globalData.wCommand(img.url, '690x');

    if (src.match(img.url)) {
      curImg = compressImg;
    }
    return compressImg;
  });

  if (curImg) {
    wx.previewImage({
      current: curImg, // 当前显示图片的http链接
      urls: previewImages, // 需要预览的图片http链接列表
    })
  }
}

/**
 * 图片视觉宽高计算函数区
 **/
function wxParseImgLoad(e) {
  var that = this;
  var tagFrom = e.target.dataset.from;
  var idx = e.target.dataset.idx;
  if (typeof (tagFrom) != 'undefined' && tagFrom.length > 0) {
    calMoreImageInfo(e, idx, that, tagFrom)
  }
}
// 假循环获取计算图片视觉最佳宽高
function calMoreImageInfo(e, idx, that, bindName) {
  var temData = that.data[bindName];
  if (!temData || temData.images.length == 0) {
    return;
  }
  var temImages = temData.images;
  //因为无法获取view宽度 需要自定义padding进行计算，稍后处理
  var recal = wxAutoImageCal(e.detail.width, e.detail.height,that,bindName);
  // temImages[idx].width = recal.imageWidth;
  // temImages[idx].height = recal.imageheight;
  // temData.images = temImages;
  // var bindData = {};
  // bindData[bindName] = temData;
  // that.setData(bindData);
  var index = temImages[idx].index
  var key = `${bindName}`
  for (var i of index.split('.')) key+=`.nodes[${i}]`
  var keyW = key + '.width'
  var keyH = key + '.height'
  that.setData({
    [keyW]: recal.imageWidth,
    [keyH]: recal.imageheight,
  })
}

// 计算视觉优先的图片宽高
function wxAutoImageCal(originalWidth, originalHeight,that,bindName) {
  //获取图片的原始长宽
  var windowWidth = 0, windowHeight = 0;
  var autoWidth = 0, autoHeight = 0;
  var results = {};
  var padding = that.data[bindName].view.imagePadding;
  windowWidth = realWindowWidth-2*padding;
  windowHeight = realWindowHeight;
  //判断按照那种方式进行缩放
  // console.log("windowWidth" + windowWidth);
  if (originalWidth > windowWidth) {//在图片width大于手机屏幕width时候
    autoWidth = windowWidth;
    // console.log("autoWidth" + autoWidth);
    autoHeight = (autoWidth * originalHeight) / originalWidth;
    // console.log("autoHeight" + autoHeight);
    results.imageWidth = autoWidth;
    results.imageheight = autoHeight;
  } else {//否则展示原来的数据
    results.imageWidth = originalWidth;
    results.imageheight = originalHeight;
  }
  return results;
}

function wxParseTemArray(temArrayName,bindNameReg,total,that){
  var array = [];
  var temData = that.data;
  var obj = null;
  for(var i = 0; i < total; i++){
    var simArr = temData[bindNameReg+i].nodes;
    array.push(simArr);
  }

  temArrayName = temArrayName || 'wxParseTemArray';
  obj = JSON.parse('{"'+ temArrayName +'":""}');
  obj[temArrayName] = array;
  that.setData(obj);
}

/**
 * 车系文字跳转信息处理
 **/
function carTextInfoParse(content, carTextInfoList) {
  let contentHtml = content;

  if (!carTextInfoList.length) {
    return contentHtml;
  }

  const carSeriesNames = [];

  // 按车系名称长→短排序
  carTextInfoList.sort((prev, next) => next.car_series_name.length - prev.car_series_name.length)

  carTextInfoList.forEach(({ car_series_id = '', car_series_name = '', ext_param_list = [] }, index) => {
    if (!car_series_name) return;

    const regName = car_series_name.replace(/\(/, '\\(').replace(/\)/, '\\)');
    const reg = new RegExp(`(>[^<]*)(${regName})([^>]*<)`);
    
    // 替换模板
    contentHtml = contentHtml.replace(reg, (match, $1, $2, $3) => {
      const paramLen = ext_param_list.length;
      const location = paramLen ? 1 : 2;
      const hasReplace = carSeriesNames.some(curName => curName.match(car_series_name));
      let matchHtml = `<span class="material-car-text"><span style="color:#427EF8" car_series_id="${car_series_id}" location="${location}" redirect_type="401" redirect_target="${car_series_id}">${$2}</span>`;

      // 已匹配过则直接返回
      if (hasReplace) {
        return match;
      };

      carSeriesNames.push(car_series_name);
      // 主要高亮额外入口
      if (paramLen) {
        ext_param_list.forEach(({ redirect_type = '',  redirect_target = '',  name = '图库' }, paramIndex) => {
          const paramstart = paramIndex === 0 ? '（<span ' : '<span '
          const paramEnd = paramIndex + 1 === paramLen ? '</span>）' : '&nbsp;|&nbsp;</span>'
          const paramHtml = `style="color:#427EF8" car_page_type="${paramIndex}" car_series_id="${car_series_id}" redirect_type="${redirect_type}" redirect_target="${redirect_target}">${name}`;

          matchHtml += (paramstart + paramHtml + paramEnd);
        })
      }
      return `${$1}${matchHtml}</span>${$3}`;
    })
  })

  return contentHtml;
}

/**
 * 配置emojis
 *
 */

function emojisInit(reg='',baseSrc="/wxParse/emojis/",emojis){
   HtmlToJson.emojisInit(reg,baseSrc,emojis);
}

module.exports = {
  wxParse: wxParse,
  wxParseTemArray:wxParseTemArray,
  emojisInit:emojisInit
}


