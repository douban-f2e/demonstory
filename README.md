
# DemonStory

豆瓣前端团队的2012尾牙节目

## 观看说明

* 想直接看的同学们可以访问下面这个网页，速度可能会慢（*更新：第三章会缺样式和图片*）：

    [http://douban-f2e.github.com/demonstory/](http://douban-f2e.github.com/demonstory/)

* 懂开发的同学们可以把这个仓库的gh-pages分支拖下来，用localhost之类的域名访问index.html

不管哪种方式请记得用chrome/safari的最新版（*更新：firefox不支持m4a音频，所以没法看…*），窗口宽度不小于1280，因为是糙猛快作品嘛，没在其他环境里做过测试。

一定要打开音箱或戴耳机！

第一章开头节奏很慢，原因见[这里](http://www.douban.com/people/Dexter_Yy/status/1092118753/)，不要误解为出错或网速慢…

![正常运行的截屏](http://img3.douban.com/view/note/large/public/p7966342.jpg)

## 开发过程

见[这里](http://www.douban.com/note/260703642/)

## 实现细节

见[这里](http://www.douban.com/note/261345067/)

## 如何开始开发

1. 安装ruby依赖：
    * `bundle install` [^1]
2. 安装node依赖：
    * `npm install` [^2]
3. 生成`dist/`目录：
    * `grunt`
4. 开发：
    * `grunt watch`

[^1]：[bundle](http://gembundler.com/)
[^2]：grunt-contrib-compass在grunt 0.3.x下使用可能需要修改一个地方：将node_modules/grunt-contrib-compass/tasks/compass.js中的38行改为 `var options = this.data.options;`

