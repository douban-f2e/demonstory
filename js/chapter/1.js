
define([
    'mo/lang',
    'dollar',
    'eventmaster',
    'movie/util',
    'movie/demon'
], function(_, $, event, util, demon){

    var wait = util.wait;

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

            demon_home.showBody();
            wait(400).done(function(){

                demon_home.showEyes();
                return wait(400 + 1000);

            }).follow().done(function(){

                demon_home.rotateEye('90deg', 0);
                return demon_home.moveEye(0.6, 200);

            }).follow().done(function(){

                return wait(200);

            }).follow().done(function(){

                demon_home.showLegs();
                return wait(400 + 1000);

            }).follow().done(function(){

                return wait(200);

            }).follow().done(function(){

                demon_home.showHands();
                return wait(400 + 500);

            }).follow().done(function(){

                demon_home.rotateEye('-90deg', 400);
                demon_home.rotateHand('left', '150deg', 400);
                return demon_home.rotateHand('right', '-150deg', 400);

            }).follow().done(function(){

                demon_home.rotateHand('left', '50deg', 400);
                return demon_home.rotateHand('right', '-50deg', 400);

            }).follow().done(function(){

                demon_home.rotateHand('left', '150deg', 400);
                return demon_home.rotateHand('right', '-150deg', 400);

            }).follow().done(function(){

                return demon_home.jump(40, [], 800);

            }).follow().done(function(){

                return demon_home.jump(40, [], 800);

            }).follow().done(function(){

                return wait(200);

            }).follow().done(function(){

                return demon_home.moveEye(0, 200);

            }).follow().done(function(){

                util.showDemon(demon_update);
                return wait(200);

            }).follow().done(function(){

                demon_home.rotateEye('0deg', 0);
                return demon_home.moveEye(0.8, 400);

            }).follow().done(function(){

                demon_home.rotateHand('left', '50deg', 100);
                demon_home.rotateHand('right', '50deg', 100);

                return demon_home.walk([-100, 0], 1000, 'easeOut');

            }).follow().done(function(){

                return wait(500);

            }).follow().done(function(){

                wait(200).done(function(){
                    demon_home.walk([-50], 800, 'easeOut');
                });

                return demon_update.walk([-50], 2000, 'linear');

            }).follow().done(function(){

            });

            //setTimeout(function(){
                //promise.fire();
            //}, 3000);
            return promise;
        },

        reset: function(){
        
        }

    };

    

});
