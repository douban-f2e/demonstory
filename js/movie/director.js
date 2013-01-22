
define([
    'mo/lang',
    'dollar',
    'mo/network',
    'mo/template',
    'eventmaster'
], function(_, $, net, tpl, event){

    var TPL_ANNOUNCE = '<h6>第{%= order %}幕</h6><h2>{%= title %}</h2><div class="desc">{%= desc %}</div>',
        
        CHN_NUM = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'],
        DEFAULTS = {
            story: [],
            stageStyle: ''
        },

        observer = event();

    var director = {

        init: function(opt){
            _.config(this, opt, DEFAULTS);
            this.currentChapter = 0;
            this.curtain = $('.curtain');
            this.stage = $('#stage');
        },

        next: function(){
            if (this.lock) {
                return false;
            }
            var chapter = this.story[this.currentChapter++];
            if (!chapter) {
                this.currentChapter--;
                return false;
            }
            this.lock = true;

            require([chapter.script], function(script){

                script.announce(screen).done(function(){

                    director.stage.bind('load', function(){
                        var win = this.contentWindow;
                        net.getStyle.call(win, director.stageStyle);
                        net.getStyle.call(win, chapter.style);
                        setTimeout(function(){
                            observer.fire('ready', [win]);
                        }, 200);
                    }).attr('src', chapter.stage);

                });

                observer.when('ready', 'announceHidden').done(function(win){

                    director.curtain.addClass('folded');
                    setTimeout(function(){
                        observer.fire('go', [win]);
                    }, 1000);

                    return observer.promise('go');

                }).follow().done(function(win){

                    return script.main(win, observer.promise('end'));

                }).follow().done(function(){

                    director.curtain.removeClass('folded');
                    director.lock = false;

                });

            });

        },

        prev: function(){

        }
    
    };

    function screen(title, desc, duration){
        var box = director.curtain.find('.announce')
            .html(tpl.convertTpl(TPL_ANNOUNCE, {
                order: CHN_NUM[director.currentChapter - 1],
                title: title,
                desc: desc
            }))
            .addClass('active');
        observer.when('ready', 'announceEnd').then(function(){
            box.removeClass('active');
            setTimeout(function(){
               observer.fire('announceHidden');
            }, 500);
        });
        setTimeout(function(){
            observer.fire('announceEnd');
        }, duration || 1000);
        return observer.promise('announceEnd');
    }

    return director;

});
