
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

        sfx: {
            walking: 'walking.mp3'
        },

        announce: function(screen, sfx){
            return screen('首页', DESC, 500, sfx.walking);
        },

        main: function(win, promise, sfx, root){
            var doc = win.document,
                nav_elms = $('.nav-items li a', doc),
                topbar_elms = $('.global-nav-items ul li a', doc),
                demon_book = demon({
                    origin: topbar_elms[1],
                    className: 'demon-book', 
                    window: win
                }),
                demon_movie = demon({
                    origin: topbar_elms[2],
                    className: 'demon-movie', 
                    window: win
                }),
                demon_music = demon({
                    origin: topbar_elms[3],
                    className: 'demon-music', 
                    window: win
                }),
                demon_read = demon({
                    origin: topbar_elms[6],
                    className: 'demon-read', 
                    window: win
                }),
                demon_group = demon({
                    origin: topbar_elms[5],
                    className: 'demon-group', 
                    window: win
                }),
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
                }),
                demon_hood = demon({
                    origin: nav_elms[4], 
                    className: 'demon-hood', 
                    window: win
                }),
                demon_dongxi = demon({
                    origin: $('.notify-mod', doc)[0], 
                    className: 'demon-dongxi', 
                    window: win
                });

            demon_update.showBody();
            wait(400 + 1000).done(function(){

                demon_update.speak('要有光！', 2000, 6, sfx.walking);
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

                demon_update.speak('不好意思，入戏太深了……', 1000, 6);
                return demon_update.squintEye(1400);

            }).follow().done(function(){

                return util.showDemon(demon_suit);

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

                demon_update.rotateHand('left', '0deg', 400);
                demon_update.rotateHand('right', '60deg', 400);
                return wait(500);

            }).follow().done(function(){

                return demon_update.speak('知不知道我是谁？', 1500, 6);

            }).follow().done(function(){

                demon_suit.rotateEye('-160deg', 800);
                return demon_suit.walk([50, 0], 800);

            }).follow().done(function(){

                return demon_suit.speak('莫非你爸是李刚？', 2000, 9);

            }).follow().done(function(){

                return wait(500);

            }).follow().done(function(){

                demon_update.rotateHand('left', '50deg', 400);
                demon_update.rotateHand('right', '-50deg', 400);
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

            //}).follow().done(function(){

                //demon_update.rotateEye('90deg', 0);
                //demon_update.moveEye(-0.8, 400);
                //return demon_update.rotateHand('right', '90deg', 400);

            }).follow().done(function(){

                util.showDemon(demon_home);
                return wait(400);

            }).follow().done(function(){

                demon_update.moveEye(-0.8, 400);
                return demon_update.rotateEye('0deg', 400);

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

                return wait(500);

            }).follow().done(function(){

                return demon_home.speak('阿广哥，不要总怨别人', 1000, 6);

            }).follow().done(function(){

                return wait(500);

            }).follow().done(function(){

                return demon_home.speak('要怪就怪你对新用户太不友好，还把老用户的视野局限在小圈子里，首页换成我，才能让更多的优质内容暴露给更多的用户……', 4000, 6);

            }).follow().done(function(){

                return util.showDemon(demon_read);

            }).follow().done(function(){

                demon_home.moveEye(0.6, 0);
                demon_home.rotateEye('180deg', 400);

                return demon_read.speak('口桀口桀口桀！', 600, 6);

            }).follow().done(function(){

                return demon_read.jump(40, [0, 53], 800);

            }).follow().done(function(){

                return demon_read.speak('谈论『优质内容』，怎能少了我大豆瓣阅读呢。', 1200, 6);

            }).follow().done(function(){

                demon_read.moveEye(0.8, 200);

                return demon_read.walk([100, 0], 1000, 'linear');

            }).follow().done(function(){

                return demon_read.speak('我说广哥啊，年纪大了不能老是打打杀杀，首页这种位置，放心交给我们年轻人罢', 2500, 6);

            }).follow().done(function(){

                demon_update.rotateHand('left', '20deg', 400);
                demon_update.rotateHand('right', '-20deg', 400);

                demon_update.squintEye(1400).done(function(){
                    demon_update.moveEye(0.8, 0);
                    demon_update.rotateEye('180deg', 0);
                });
                demon_update.speak('小阅阅，一边玩去', 1000, 5);

                return util.showDemon(demon_group);

            }).follow().done(function(){

                demon_read.moveEye(0.6, 0);
                demon_read.rotateEye('180deg', 400).done(function(){
                    demon_read.walk([120, 0], 1000, 'easeIn');
                });

                return demon_group.jump(40, [100, 53], 1000);

            }).follow().done(function(){

                return wait(1000);

            }).follow().done(function(){

                return demon_group.speak('彭任飞说像我这样的老牌社区产品才应该是首页！', 2000, 7);

            }).follow().done(function(){

                demon_read.squintEye(1400).done(function(){
                    demon_read.moveEye(0.8, 0);
                    demon_read.rotateEye('180deg', 0);
                });
                demon_read.speak('囧', 1000, 3);

                demon_home.squintEye(1400).done(function(){
                    demon_home.moveEye(0.8, 0);
                    demon_home.rotateEye('180deg', 0);
                });
                return demon_home.speak('你不是最近刚加入『黑又硬』了吗', 1000, 5);

            }).follow().done(function(){

                util.showDemon(demon_book).done(function(){
                    demon_book.move([0, 53], 400);
                });

                wait(200).done(function(){
                    return util.showDemon(demon_movie);
                }).follow().done(function(){
                    demon_movie.move([0, 53], 400);
                }).follow().done(function(){
                    return demon_movie.walk([30, 0], 400);
                });

                return wait(500).done(function(){
                    return util.showDemon(demon_music);
                }).follow().done(function(){
                    demon_update.speak('啊这难道是！', 1000, 7);
                    return demon_music.move([0, 53], 400);
                }).follow().done(function(){
                    return demon_music.walk([40, 0], 400);
                });

            }).follow().done(function(){

                return wait(600);

            }).follow().done(function(){

                return demon_read.speak('……传说中的三忍！', 1000, 6);

            }).follow().done(function(){

                return util.showDemon(demon_dongxi).done(function(){

                    var fn = arguments.callee;

                    demon_dongxi.rotateHand('left', '60deg', 200).done(function(){
                        return demon_dongxi.rotateHand('left', '150deg', 200);
                    }).follow().done(function(){
                        return demon_dongxi.rotateHand('left', '60deg', 200);
                    }).follow().done(function(){
                        return demon_dongxi.rotateHand('left', '150deg', 200);
                    });

                    demon_dongxi.rotateHand('right', '-30deg', 200).done(function(){
                        return demon_dongxi.rotateHand('right', '-50deg', 200);
                    }).follow().done(function(){
                        return demon_dongxi.rotateHand('right', '-30deg', 200);
                    }).follow().done(function(){
                        return demon_dongxi.rotateHand('right', '-50deg', 200);
                    });

                    demon_dongxi.rotateEye('-30deg', 400).done(function(){
                        demon_dongxi.rotateEye('-160deg', 400);
                    });

                    return demon_dongxi.jump(40, [], 805).done(function(){
                        if (jump_count++ < 10) {
                            return fn();
                        } else {
                            jump_count = 0;
                            return wait(200);
                        }
                    }).follow();

                });

            }).follow().done(function(){

                demon_update.rotateEye('40deg', 400);
                demon_home.rotateEye('20deg', 400);
                demon_read.rotateEye('20deg', 400);
                demon_group.moveEye(0.8, 0);
                demon_group.rotateEye('0deg', 400);
                return demon_suit.rotateEye('0deg', 400);

            }).follow().done(function(){

                demon_suit.walk([-100, 0], 1000);

                return demon_read.speak('这胖子是谁？', 1000, 7);

            }).follow().done(function(){

                return demon_home.speak('『移动』的『东西』，阿北新宠，师承tgm。', 2000, 5);

            }).follow().done(function(){

                return util.showDemon(demon_hood);

            }).follow().done(function(){

                demon_update.rotateEye('-10deg', 200);
                demon_update.walk([-20, 0], 400);

                demon_read.rotateEye('-10deg', 200);
                return demon_read.speak('是不是人有点多了……', 1200, 7);

            }).follow().done(function(){

                demon_home.rotateEye('-10deg', 200);
                return demon_home.speak('这是『MVP』艾里克罗的产品，颇具天资，有很强的『外部性』', 2000, 5);

            }).follow().done(function(){

                demon_update.moveEye(0, 0);
                return demon_update.speak('看来……今天有一场苦战…………', 2000, 5);

            }).follow().done(function(){

                return demon_suit.speak('午睡没指望了', 2000, 9);

            }).follow().done(function(){

                return wait(500);

            }).follow().done(function(){

                demon_home.walk([100, 0], 800);
                demon_read.walk([70, 0], 800);
                demon_hood.walk([-40, 0], 800);
                demon_group.walk([240, 0], 800);
                demon_book.walk([440, 0], 800);
                demon_movie.walk([440, 0], 800);
                demon_music.walk([440, 0], 800);
                demon_dongxi.walk([-200, -80], 800);

                return wait(500);

            }).follow().done(function(){

                promise.fire(); // 结束，进入下一章节

            });

            return promise;
        },

        reset: function(){
        
        }

    };

});
