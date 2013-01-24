
define([
    'mo/lang',
    'dollar',
    'eventmaster',
    'movie/util',
    'movie/demon'
], function(_, $, event, util, demon){

    var wait = util.wait,

        DESC = "我们的第一个故事就发生在今年，那是一个晴朗慵懒的午后，工程师们都去BHG抢盒饭了，豆瓣的首页沉浸在改版后一片宁静祥和的气氛中……", 

        jump_count = 0;

    return {

        announce: function(screen){
            return screen('首页', DESC, 1000);
        },

        main: function(win, promise){
            var doc = win.document,
                nav_elms = $('.nav-items li a', doc),
                demon_update = demon({
                    origin: nav_elms[1], 
                    className: 'demon-update', 
                    window: win
                }),
                demon_suit = demon({
                    origin: $('.guess-item .pic a', doc)[0], 
                    className: 'demon-suit', 
                    window: win
                }),
                demon_home = demon({
                    origin: nav_elms[0], 
                    className: 'demon-home', 
                    window: win
                });

            demon_update.showBody();
            wait(400 + 1000).done(function(){

                demon_update.speak('要有光！', 2000, 6);
                return wait(1300);

            }).follow().done(function(){

                demon_update.showEyes();
                return wait(400 + 1500);

            }).follow().done(function(){

                demon_update.rotateEye('90deg', 0);
                return demon_update.moveEye(0.6, 200);
                
            }).follow().done(function(){

                return wait(800);

            }).follow().done(function(){

                demon_update.speak('要有脚！', 2000, 6);
                return wait(1300);

            }).follow().done(function(){

                demon_update.showLegs();
                return wait(400 + 1200);

            }).follow().done(function(){

                return demon_update.rotateEye('130deg', 400);

            }).follow().done(function(){

                return wait(800);

            }).follow().done(function(){

                demon_update.speak('组成躯干和手臂！', 2500, 6);
                return wait(1500);

            }).follow().done(function(){

                demon_update.showHands();
                return wait(400 + 1200);

            }).follow().done(function(){

                demon_update.rotateEye('-90deg', 400);

                demon_update.speak('我来组成头部！！！', 1000, 6);

                demon_update.rotateHand('left', '150deg', 400);
                return demon_update.rotateHand('right', '-150deg', 400);

            }).follow().done(function(){

                demon_update.rotateHand('left', '50deg', 400);
                return demon_update.rotateHand('right', '-50deg', 400);

            }).follow().done(function(){

                demon_update.rotateHand('left', '150deg', 400);
                return demon_update.rotateHand('right', '-150deg', 400);

            }).follow().done(function(){

                demon_update.speak('不好意思，入戏太深了……', 1400, 6);
                return demon_update.squintEye(1400);

            }).follow().done(function(){

                return util.showDemon(demon_suit);

            //}).follow().done(function(){

                //return demon_suit.walk([-200, 50], 1000);

            //}).follow().done(function(){

                //return demon_suit.walk([150, 0], 700);

            }).follow().done(function(){

                demon_suit.rotateEye('-90deg', 0);
                demon_suit.moveEye(0.6, 200).done(function(){
                    demon_suit.rotateEye('-140deg', 400);
                });

                demon_update.rotateHand('left', '50deg', 400);
                demon_update.rotateHand('right', '-50deg', 400);
                demon_update.moveEye(0.6, 0);
                demon_update.rotateEye('40deg', 400);

                return demon_suit.speak('吵死了吵死了', 1500, 9);

            }).follow().done(function(){

                return demon_suit.speak('还让不让人睡午觉？', 1500, 9);

            }).follow().done(function(){

                return wait(500);

            }).follow().done(function(){

                return demon_update.speak('矮油', 1500, 6);

            }).follow().done(function(){

                return demon_update.speak('小小一张条目封面，日均UV超不过10K', 2500, 6);

            }).follow().done(function(){

                return demon_update.speak('吵到你又怎么了', 1500, 6);

            }).follow().done(function(){

                return wait(500);

            }).follow().done(function(){

                return demon_update.speak('你知不知道我是谁？', 1500, 6);

            }).follow().done(function(){

                demon_suit.rotateEye('-160deg', 800);
                return demon_suit.walk([50, 0], 800);

            }).follow().done(function(){

                return demon_suit.speak('莫非你爸是李刚？', 2000, 9);

            }).follow().done(function(){

                return wait(500);

            }).follow().done(function(){

                return demon_update.moveEye(0, 200);

            }).follow().done(function(){

                return wait(500);

            }).follow().done(function(){


                return demon_update.speak('大爷我本住在豆瓣导航的最左边', 2000, 6);

            }).follow().done(function(){

                return wait(500);

            }).follow().done(function(){

                return demon_update.walk([-70, 0], 1200, 'linear');

            }).follow().done(function(){

                return wait(500);

            }).follow().done(function(){

                return demon_update.speak('默认作首页', 1400, 6);

            }).follow().done(function(){

                return wait(300);

            }).follow().done(function(){

                return demon_update.speak('生活乐无边', 1400, 6);

            }).follow().done(function(){

                return wait(500);

            }).follow().done(function(){

                return demon_update.walk([100, 0], 1000, 'linear');

            }).follow().done(function(){

                return demon_update.speak('谁知那阿北，他蛮横不留情', 2600, 6);

            }).follow().done(function(){

                return wait(300);

            }).follow().done(function(){

                return demon_update.speak('勾结算法目无天，占我首页夺我名', 3000, 6);

            }).follow().done(function(){

                return wait(300);

            }).follow().done(function(){

                return demon_update.speak('用户骂他瞎折腾，反被他去掉“回旧版”', 3000, 6);

            }).follow().done(function(){

                return wait(300);

            }).follow().done(function(){

                return demon_update.speak('强奸了一百遍啊', 700, 6);

            }).follow().done(function(){

                demon_update.speak('一百遍！……', 600, 6);
                return wait(200);

            }).follow().done(function(){

                demon_update.rotateEye('90deg', 0);
                demon_update.moveEye(-0.8, 400);
                return demon_update.rotateHand('right', '90deg', 400);

            }).follow().done(function(){

                //var fn = arguments.callee;

                //demon_home.rotateHand('left', '60deg', 200).done(function(){
                    //return demon_home.rotateHand('left', '150deg', 200);
                //}).follow().done(function(){
                    //return demon_home.rotateHand('left', '60deg', 200);
                //}).follow().done(function(){
                    //return demon_home.rotateHand('left', '150deg', 200);
                //});

                //demon_home.rotateHand('right', '-30deg', 200).done(function(){
                    //return demon_home.rotateHand('right', '-50deg', 200);
                //}).follow().done(function(){
                    //return demon_home.rotateHand('right', '-30deg', 200);
                //}).follow().done(function(){
                    //return demon_home.rotateHand('right', '-50deg', 200);
                //});

                //demon_home.rotateEye('-30deg', 400).done(function(){
                    //demon_home.rotateEye('-160deg', 400);
                //});

                //return demon_home.jump(40, [], 805).done(function(){
                    //if (jump_count++ < 2) {
                        //return fn();
                    //} else {
                        //jump_count = 0;
                        //return wait(200);
                    //}
                //}).follow();

            //}).follow().done(function(){

                util.showDemon(demon_home);
                return wait(400);

            }).follow().done(function(){

                return demon_update.rotateEye('-360deg', 400);

            }).follow().done(function(){

                demon_update.rotateHand('left', '-50deg', 100);
                demon_update.rotateHand('right', '-50deg', 100);

                return demon_update.jump(30, [50, 0], 400, 'easeOut');

            }).follow().done(function(){

                return demon_update.walk([60, 0], 600, 'easeOut');

            }).follow().done(function(){

                return wait(500);

            }).follow().done(function(){

                wait(200).done(function(){
                    return demon_update.walk([50], 800, 'easeOut');
                });

                return demon_home.walk([50], 2000, 'linear');

            }).follow().done(function(){

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
