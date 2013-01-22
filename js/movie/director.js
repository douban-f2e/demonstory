
define([
    'mo/lang',
    'dollar',
    'mo/network',
    'eventmaster'
], function(_, $, net, event){

    var _DEFAULTS = {
        story: [],
        stageStyle: ''
    };

    var observer = event();

    var director = {

        init: function(opt){
            _.config(this, opt, _DEFAULTS);
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

                    return observer.promise('ready');

                }).follow().done(function(win){

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

    function screen(text, duration){
        var box = director.curtain.find('.announce')
            .html(text)
            .addClass('active');
        setTimeout(function(){
            box.removeClass('active');
            setTimeout(function(){
                observer.fire('start');
            }, 400);
        }, duration || 1000);
        return observer.promise('start');
    }

    return director;

});
