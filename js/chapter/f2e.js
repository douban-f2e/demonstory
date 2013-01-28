define([
    'mo/lang',
    'dollar',
    'eventmaster',
    'movie/util',
    'movie/demon'
], function(_, $, event, util, demon){

    var wait = util.wait,
        DESC = "豆瓣前端的故事",
        jump_count = 0;

    return {

        announce: function(screen){
            return screen('导航链接的诞生', DESC, 1000);
        },

        main: function(win, promise){
            var doc = win.document,
                nav_elms = $('.nav-items li a', doc),
                demon_home = demon({
                    origin: nav_elms[0], 
                    className: 'nav-link', 
                    window: win
                }),
                demon_update = demon({
                    origin: nav_elms[1], 
                    className: 'nav-link', 
                    window: win
                });

            demon_home.showBody();
            wait(400).done(function(){

                demon_home.showEyes();
                return wait(400 + 1000);

            }).follow().done(function(){

                demon_home.rotateEye('90deg', 0);
                return demon_home.moveEye(0.6, 200);

            }).follow().done(function(){

                //return wait(200);
                return demon_home.speak('要有脚！', 800, 6);

            }).follow().done(function(){

                demon_home.showLegs();
                return wait(400 + 400);

            }).follow().done(function(){

                return demon_home.rotateEye('130deg', 400);

            }).follow().done(function(){

                //return wait(200);
                return demon_home.speak('要有手！', 800, 9);

            }).follow().done(function(){

                demon_home.showHands();
                return wait(400 + 500);

            }).follow().done(function(){

                demon_home.speak('木哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈！！！', 
                    1000, 7);

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

                var fn = arguments.callee;

                demon_home.rotateHand('left', '60deg', 200).done(function(){
                    return demon_home.rotateHand('left', '150deg', 200);
                }).follow().done(function(){
                    return demon_home.rotateHand('left', '60deg', 200);
                }).follow().done(function(){
                    return demon_home.rotateHand('left', '150deg', 200);
                });

                demon_home.rotateHand('right', '-30deg', 200).done(function(){
                    return demon_home.rotateHand('right', '-50deg', 200);
                }).follow().done(function(){
                    return demon_home.rotateHand('right', '-30deg', 200);
                }).follow().done(function(){
                    return demon_home.rotateHand('right', '-50deg', 200);
                });

                demon_home.rotateEye('-30deg', 400).done(function(){
                    demon_home.rotateEye('-160deg', 400);
                });

                return demon_home.jump(40, [], 805).done(function(){
                    if (jump_count++ < 2) {
                        return fn();
                    } else {
                        jump_count = 0;
                        return wait(200);
                    }
                }).follow();

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

                return demon_home.jump(30, [-50, 0], 400, 'easeOut');

            }).follow().done(function(){

                return demon_home.walk([-60, 0], 600, 'easeOut');

            }).follow().done(function(){

                return wait(500);

            }).follow().done(function(){

                wait(200).done(function(){
                    return demon_home.walk([-50], 800, 'easeOut');
                });

                return demon_update.walk([-50], 2000, 'linear');

            }).follow().done(function(){

                demon_home.squintEye();
                return wait(3000);

            }).follow().done(function(){

                //promise.fire(); // 结束，进入下一章节

            });

            return promise;
        },

        reset: function(){
        
        }

    };

});
