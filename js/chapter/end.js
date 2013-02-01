
define([
    'mo/lang',
    'dollar',
    'eventmaster',
    'movie/util',
    'movie/demon'
], function(_, $, event, util, demon){

    var wait = util.wait,

        DESC = "无趣的生活的从那一次点击开始改变...", 

        jump_count = 0;

    return {

        announce: function(screen){
            return screen('豆瓣改变生活', DESC, 2500);
        },

        main: function(win, promise){
                win.xxxxx();
        },

        reset: function(){
        }

    };

    

});
