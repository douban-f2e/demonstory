
define([
    'mo/lang',
    'dollar',
    'eventmaster',
    'movie/util',
    'movie/camera',
    'movie/demon'
], function(_, $, event, util, camera, demon){

    var wait = util.wait,
        PREVIEW_DURATION = 10,
        preview_mode = false,
        //preview_mode = true,
        jump_count = 0;

    return {

        sfx: {
            odyssey: 'intro/2001spaceodyssey.mp3',
            suit_1: 'intro/suit_1.m4a',
            suit_2: 'intro/suit_2.m4a',
            update_1: 'intro/update_1.m4a',
            update_2: 'intro/update_2.m4a',
            update_3: 'intro/update_3.m4a',
            update_4: 'intro/update_4.m4a',
            suit_3: 'intro/suit_3.m4a',
            update_5: 'intro/update_5.m4a',
            update_6: 'intro/update_6.m4a',
            update_7: 'intro/update_7.m4a',
            update_8: 'intro/update_8.m4a',
            update_9: 'intro/update_9.m4a',
            home_1: 'intro/home_1.m4a',
            home_2: 'intro/home_2.m4a',
            read_1: 'intro/read_1.m4a',
            read_2: 'intro/read_2.m4a',
            read_3: 'intro/read_3.m4a',
            update_10: 'intro/update_10.m4a',
            group_1: 'intro/group_1.m4a',
            home_3: 'intro/home_3.m4a',
            update_11: 'intro/update_11.m4a',
            home_4: 'intro/home_4.m4a',
            read_4: 'intro/read_4.m4a',
            home_5: 'intro/home_5.m4a',
            read_5: 'intro/read_5.m4a',
            home_6: 'intro/home_6.m4a',
            update_12: 'intro/update_12.m4a',
            suit_4: 'intro/suit_4.m4a'
        },

        announce: function(screen, sfx){
            if (!preview_mode) {
                sfx.odyssey.play();
            }
            return screen('2012', "", 
                preview_mode ? PREVIEW_DURATION : 19000);
        },

        main: function(win, promise, sfx, root){
            var doc = win.document,
                screen = camera(win),
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

            util.preview_mode = screen.preview_mode = demon_dongxi.preview_mode = demon_hood.preview_mode = demon_group.preview_mode = demon_update.preview_mode = demon_suit.preview_mode = demon_home.preview_mode = demon_read.preview_mode = preview_mode;

            wait(7800).done(function(){

                demon_update.showBody();
                return wait(4500);

            }).follow().done(function(){

                return screen.pan({
                    elem: demon_update.me[0],
                    offset: {
                        top: -240
                    },
                    zoom: 2,
                    duration: 4000
                });

            }).follow().done(function(){

                $(doc.body).append('<span></span>');

                return wait(800);

            }).follow().done(function(){

                demon_update.showEyes();
                return wait(2200);

            }).follow().done(function(){

                demon_update.rotateEye('-90deg', 0);
                return demon_update.moveEye(0.6, 800);

            }).follow().done(function(){

                return wait(1700);

            }).follow().done(function(){

                return demon_update.rotateEye('130deg', 800);
                
            }).follow().done(function(){

                return wait(2000);

            }).follow().done(function(){

                return demon_update.rotateEye('90deg', 500);

            }).follow().done(function(){

                return wait(1000);

            }).follow().done(function(){

                demon_update.showLegs();
                return wait(4500);

            }).follow().done(function(){

                demon_update.showHands();
                return wait(2000);

            }).follow().done(function(){

                demon_update.rotateHand('left', '0deg', 0);
                demon_update.rotateHand('right', '0deg', 0);

                return demon_update.moveEye(-0.8, 800);

            }).follow().done(function(){

                demon_update.rotateHand('left', '170deg', 3000);
                return demon_update.rotateHand('right', '-170deg', 3000);

            }).follow().done(function(){

                return wait(1000);

            }).follow().done(function(){

                demon_update.rotateHand('left', '60deg', 1000);
                return demon_update.rotateHand('right', '-60deg', 1000);

            }).follow().done(function(){

                var fn = arguments.callee;

                demon_update.rotateHand('left', '60deg', 1000).done(function(){
                    return demon_update.rotateHand('left', '150deg', 1000);
                }).follow().done(function(){
                    return demon_update.rotateHand('left', '60deg', 1000);
                }).follow().done(function(){
                    return demon_update.rotateHand('left', '150deg', 1000);
                });

                demon_update.rotateHand('right', '-60deg', 1000).done(function(){
                    return demon_update.rotateHand('right', '-150deg', 1000);
                }).follow().done(function(){
                    return demon_update.rotateHand('right', '-60deg', 1000);
                }).follow().done(function(){
                    return demon_update.rotateHand('right', '-150deg', 1000);
                });

                return demon_update.jump(20, [], 2000).done(function(){
                    if (jump_count++ < 9) {
                        if (jump_count == 5) {
                            screen.pan({
                                elem: demon_update.me[0],
                                offset: {
                                    top: -240
                                },
                                zoom: 1,
                                duration: 8000
                            }).done(function(){
                                $(doc.body).append('<span></span>');
                            });
                        }
                        return fn();
                    } else {
                        jump_count = 0;
                        return wait(1000);
                    }
                }).follow();

            }).follow().done(function(){

                jump_count = 0;
                demon_update.squintEye(2000);
                return wait(10);

            }).follow().done(function(){

                var fn = arguments.callee;

                demon_update.rotateHand('left', '60deg', 400).done(function(){
                    return demon_update.rotateHand('left', '150deg', 400);
                }).follow().done(function(){
                    return demon_update.rotateHand('left', '60deg', 400);
                }).follow().done(function(){
                    return demon_update.rotateHand('left', '150deg', 400);
                });

                demon_update.rotateHand('right', '-60deg', 400).done(function(){
                    return demon_update.rotateHand('right', '-150deg', 400);
                }).follow().done(function(){
                    return demon_update.rotateHand('right', '-60deg', 400);
                }).follow().done(function(){
                    return demon_update.rotateHand('right', '-150deg', 400);
                });

                return wait(800).done(function(){
                    if (jump_count++ < 2) {
                        return fn();
                    } else {
                        jump_count = 0;
                        return wait(400);
                    }
                }).follow();

            }).follow().done(function(){

                util.showDemon(demon_suit);
                return wait(400 * 4);

            }).follow().done(function(){

                //util.preview_mode = screen.preview_mode = demon_dongxi.preview_mode = demon_hood.preview_mode = demon_group.preview_mode = demon_update.preview_mode = demon_suit.preview_mode = demon_home.preview_mode = demon_read.preview_mode = preview_mode = false;

                demon_update.moveEye(0.6, 0);
                demon_update.rotateEye('40deg', 600);

                demon_suit.rotateEye('-90deg', 0);
                demon_suit.moveEye(0.6, 200).done(function(){
                    demon_suit.rotateEye('-140deg', 400);
                });

                return demon_suit.speak('吵死了吵死了', 1600, 9, sfx.suit_1);

            }).follow().done(function(){

                return demon_suit.speak('还让不让人睡觉？', 1700, 9, sfx.suit_2);

            }).follow().done(function(){

                return wait(500);

            }).follow().done(function(){

                demon_update.rotateHand('left', '50deg', 400);
                demon_update.rotateHand('right', '-50deg', 400);

                return demon_update.speak('矮油', 1000, 6, sfx.update_1);

            }).follow().done(function(){

                return demon_update.speak('小小一张条目封面，日均UV超不过10K', 5800, 6, sfx.update_2);

            }).follow().done(function(){

                return demon_update.speak('吵到你又怎么了', 1600, 6, sfx.update_3);

            }).follow().done(function(){

                demon_update.rotateHand('left', '0deg', 400);
                demon_update.rotateHand('right', '60deg', 400);
                return wait(500);

            }).follow().done(function(){

                return demon_update.speak('知不知道我是谁？', 1700, 6, sfx.update_4);

            }).follow().done(function(){

                demon_suit.rotateEye('-160deg', 800);
                return demon_suit.walk([50, 0], 800);

            }).follow().done(function(){

                return demon_suit.speak('莫非你爸是李刚？', 2000, 9, sfx.suit_3);

            }).follow().done(function(){

                return wait(500);

            }).follow().done(function(){

                demon_update.rotateHand('left', '50deg', 400);
                demon_update.rotateHand('right', '-50deg', 400);
                return demon_update.moveEye(0, 200);

            }).follow().done(function(){

                return wait(500);

            }).follow().done(function(){

                return demon_update.speak('大爷我本住在豆瓣导航的最左边', 4100, 6, sfx.update_5);

            }).follow().done(function(){

                return demon_update.walk([-70, 0], 1200, 'linear');

            }).follow().done(function(){

                return wait(500);

            }).follow().done(function(){

                return demon_update.speak('默认作首页', 1500, 6, sfx.update_6);

            }).follow().done(function(){

                return wait(300);

            }).follow().done(function(){

                return demon_update.speak('生活乐无边', 1900, 6, sfx.update_7);

            }).follow().done(function(){

                return demon_update.walk([100, 0], 1000, 'linear');

            }).follow().done(function(){

                return demon_update.speak('谁知那阿北，他蛮横不留情', 3800, 6, sfx.update_8);

            }).follow().done(function(){

                return wait(300);

            }).follow().done(function(){

                return demon_update.speak('勾结算法目无天，占我首页夺我名', 4600, 6, sfx.update_9);

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

                return demon_home.speak('阿广哥，不要总怨别人', 2100, 6, sfx.home_1);

            }).follow().done(function(){

                return demon_home.speak('要怪就怪你对新用户太不友好，还把老用户的视野局限在小圈子里，首页换成我，才能让更多的优质内容暴露给更多的用户……', 9000, 6, sfx.home_2);

            }).follow().done(function(){

                return util.showDemon(demon_read);

            }).follow().done(function(){

                demon_home.moveEye(0.6, 0);
                demon_home.rotateEye('180deg', 400);

                return demon_read.speak('口桀口桀口桀！', 2000, 6, sfx.read_1);

            }).follow().done(function(){

                return demon_read.jump(40, [0, 53], 800);

            }).follow().done(function(){

                return demon_read.speak('谈论『优质内容』，怎能少了我大豆瓣阅读呢。', 3800, 6, sfx.read_2);

            }).follow().done(function(){

                demon_read.moveEye(0.8, 200);

                return demon_read.walk([100, 0], 1000, 'linear');

            }).follow().done(function(){

                return demon_read.speak('我说广哥啊，年纪大了不能老是打打杀杀，首页这种风险这么高的位置，还是交给我们年轻人去拼罢', 6900, 6, sfx.read_3);

            }).follow().done(function(){

                demon_update.rotateHand('left', '20deg', 400);
                demon_update.rotateHand('right', '-20deg', 400);

                demon_update.squintEye(1400).done(function(){
                    demon_update.moveEye(0.8, 0);
                    demon_update.rotateEye('180deg', 0);
                });
                demon_update.speak('小阅阅，一边玩去', 2000, 5, sfx.update_10);

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

                return demon_group.speak('彭任飞说像我这样的老牌社区产品才应该是首页！', 4200, 7, sfx.group_1);

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
                return demon_home.speak('你不是最近刚加入『黑又硬』了吗', 2000, 5, sfx.home_3);

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
                    demon_update.speak('啊这难道是！', 1000, 7, sfx.update_11);
                    return demon_music.move([0, 53], 400);
                }).follow().done(function(){
                    return demon_music.walk([40, 0], 400);
                });

            }).follow().done(function(){

                return wait(600);

            }).follow().done(function(){

                return demon_home.speak('……就是他们！传说中的三忍！', 2800, 6, sfx.home_4);

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

                return demon_read.speak('这胖子哪来的？', 1000, 7, sfx.read_4);

            }).follow().done(function(){

                return demon_home.speak('『移动』的『东西』，阿北新宠，师承tgm。', 5100, 5, sfx.home_5);

            }).follow().done(function(){

                return util.showDemon(demon_hood);

            }).follow().done(function(){

                demon_update.rotateEye('-10deg', 200);
                demon_update.walk([-20, 0], 400);

                demon_read.rotateEye('-10deg', 200);
                return demon_read.speak('是不是人有点多了……', 2000, 7, sfx.read_5);

            }).follow().done(function(){

                demon_home.rotateEye('-10deg', 200);
                return demon_home.speak('这是『MVP』艾里克罗的产品，颇具天资，有很强的『外部性』', 6500, 5, sfx.home_6);

            }).follow().done(function(){

                demon_update.moveEye(0, 0);
                return demon_update.speak('…………', 700, 5);

            }).follow().done(function(){

                return demon_update.speak('看来今天有场苦战…………', 2000, 5, sfx.update_12);

            }).follow().done(function(){

                return demon_suit.speak('午睡没指望了', 2500, 9, sfx.suit_4);

            }).follow().done(function(){

                return wait(500);

            }).follow().done(function(){

                demon_home.walk([100, 0], 600);
                demon_read.walk([70, 0], 600);
                demon_hood.walk([-40, 0], 600);
                demon_group.walk([240, 0], 600);
                demon_book.walk([440, 0], 600);
                demon_movie.walk([440, 0], 600);
                demon_music.walk([440, 0], 600);
                demon_dongxi.walk([-200, -80], 600);

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
