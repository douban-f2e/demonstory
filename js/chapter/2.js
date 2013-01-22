
define([
    'mo/lang',
    'dollar',
    'eventmaster',
    '../demon'
], function(_, $, event, demon){

    return {

        announce: function(screen){
            return screen('第一幕', 1000);
        },

        main: function(win, promise){
            var doc = win.document,
                nav_elms = $('.nav-items li a', doc),
                demon_home = demon({
                    origin: nav_elms[0], 
                    className: 'nav-link', 
                    body: doc.body 
                }),
                demon_update = demon({
                    origin: nav_elms[1], 
                    className: 'nav-link', 
                    body: doc.body 
                });

            demon_home.wake().done(function(){
                return demon_home.walk({ 
                    left: '-100px' 
                }, 1000, 'linear');
            }).follow().done(function(){
                return wait(200);
            }).follow().done(function(){
                return demon_update.wake();
            }).follow().done(function(){
                return demon_update.walk({ 
                    left: '-50px' 
                }, 2000, 'easeOutBack');
            });

            //setTimeout(function(){
                //promise.fire();
            //}, 3000);
            return promise;
        },

        reset: function(){
        
        }

    };

    function wait(duration, fn){
        var promise = new event.Promise();
        if (fn) {
            fn();
        }
        setTimeout(function(){
            promise.resolve();
        }, duration);
        return promise;
    }

});

