# HTML

- 不要使用任何大写标签
- 组件参数请勿使用驼峰命名，请统一使用```kebab```规则
- 请使用2个空格的缩进
- 嵌套元素缩进2个空格
- 属性请使用双引号

## 属性顺序

- ```class```
- ```id```, ```name```
- ```事件绑定```
- ```data-*```
- ```src```, ```for```, ```type```, ```value```

## 布尔属性

- 如非必要，不要声明值

## 尽可能减少元素数量

# CSS

- 请使用2个空格的缩进
- 分组多个选择器的时候，每个选择器单独占一行
- 样式声明起始大括号前增加个空格
- 样式声明结束大括号单独占一行
- 属性```:```后留一个空格
- 逗号分隔的属性值在每个逗号后面增加一个空格
- 十六进制颜色值请使用小写
- 十六进制颜色值尽量用缩写，例如```#fff```代替```#ffffff```
- 请使用双引号
- 对于赋值0的元素，请不要使用单位，例如: ```margin: 0```，而非```margin: 0px;```

## 样式声明顺序

1. 位置
1. 盒模型
1. 文字排版
1. 外观
1. 其它

## 属性简写

尽可能的减少属性简写，例如:
```css
/* Bad example */
.element {
  margin: 0 0 10px;
  background: red;
  background: url("image.jpg");
  border-radius: 3px 3px 0 0;
}

/* Good example */
.element {
  margin-bottom: 10px;
  background-color: red;
  background-image: url("image.jpg");
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
}
/*  */
```

## 注释

注释是由人来编写和维护的。确保你的代码具备良好的描述性，注释完善，易于被他人理解使用。良好的注释可以清晰的描述上下文或者用途，请勿重复代码中显而易见的内容例如：
```css
/* Bad example */
/* Modal header */
.modal-header {
  ...
}

/* Good example */
/* Wrapping element for .modal-title and .modal-close */
.modal-header {
  ...
}
```

## 类名

- 类名使用小写和横线分隔（不要用下划线或者驼峰），横线用于相关类的进一步分类，例如： ```.btn```和```.btn-danger```
- 类名不要过度精简，比如```.btn```可以比较好的表达button，但是```.b```不明表达任何有效信息
- 类名要尽可能简短
- 请使用有意义的名字，结构良好的和目的性强的名字优于展示性的名字。例如：```.important```优于```.red```，```.article-title```优于```.title```
- 类名前缀应基于最近的父元素或者基类

## 选择器

- 优先使用类名，而非标签名以获得更好的渲染性能
- 选择器要尽可能短，争取限制在3个以内，例如：```.article-title .username {...}```
- **只**在必要时候，把类作用域限定在最近的父类下

## 样式组织

- 按组件组织样式代码块
- 开发一致的注释结构
- 使用多个样式文件的时候，尽量按组件划分