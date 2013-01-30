
define([
    'mo/lang',
    'dollar',
    'mo/network',
    'mo/template',
    'buzz',
    'eventmaster'
], function(_, $, net, tpl, buzz, event){

    var TPL_ANNOUNCE = '<h6>第{%= order %}幕</h6><h2>{%= title %}</h2><div class="desc">{%= desc %}</div>',
        
        CHN_NUM = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'],
        DEFAULTS = {
            observer: event(),
            story: [],
            imageRoot: '',
            mediaRoot: '',
            stageStyle: ''
        },

        observer;

    var director = {

        init: function(opt){
            _.config(this, opt, DEFAULTS);
            this.currentChapter = 0;
            this.curtain = $('.curtain');
            this.stage = $('#stage');
            observer = opt.observer;
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

                var sfx_queue = [],
                    sfx_lib = {};
                if (script.sfx) {
                    Object.keys(script.sfx).forEach(function(name){
                        var promise = new event.Promise();
                        var sound = sfx_lib[name] = new buzz.sound(director.mediaRoot + this[name]);
                        sound.load();
                        sound.bindOnce('canplay', promise.pipe.resolve);
                        sfx_queue.push(promise);
                    }, script.sfx);
                }
                if (!sfx_queue.length) {
                    sfx_queue.push(new event.Promise().resolve());
                }

                event.when.apply(event, sfx_queue).done(function(){

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

                    return script.announce(screen, sfx_lib).done(function(){

                        director.curtain.addClass('folded');
                        setTimeout(function(){
                            observer.fire('go', [win]);
                        }, 1000);

                        return observer.promise('go');

                    }).follow();

                }).follow().done(function(win){

                    return script.main(win, observer.promise('end'), sfx_lib, {
                        image: director.imageRoot,
                        media: director.mediaRoot
                    });

                }).follow().done(function(){

                    director.curtain.removeClass('folded');
                    director.lock = false;

                });

            });

        },

        prev: function(){

        }
    
    };

    function screen(title, desc, duration, src, vol){
        var sound,
            box = director.curtain.find('.announce')
            .html(tpl.convertTpl(TPL_ANNOUNCE, {
                order: CHN_NUM[director.currentChapter - 1],
                title: title,
                desc: desc
            }))
            .addClass('active');
        if (typeof src === 'string' || Array.isArray(src)) {
            sound = new buzz.sound(src);
        } else {
            sound = src;
        }
        if (sound) {
            if (vol) {
                sound.setVolume(vol);
            }
            sound.play();
        }
        setTimeout(function(){
            if (sound && !sound.isEnded()) {
                sound.pause();
            }
            box.removeClass('active');
            setTimeout(function(){
               observer.fire('announceHidden');
            }, 500);
        }, duration || 1000);
        return observer.promise('announceHidden');
    }

    return director;

});
