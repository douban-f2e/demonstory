## 如何开始开发

1. 安装ruby依赖： 
    * `gem install animation --pre`
    * `gem install ceaser-easing`
    * `gem install animate-sass`
2. 安装node依赖：
    * `npm install`
        * grunt-contrib-compass在grunt 0.3.x下使用可能需要修改一个地方：将node_modules/grunt-contrib-compass/tasks/compass.js中的38行改为 `var options = this.data.options;`
3. 测试：
    * `grunt compass`
    * `grunt watch`

