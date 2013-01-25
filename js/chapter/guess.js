
define([
    'mo/lang',
    'dollar',
    'eventmaster',
    'choreo',
    'movie/util',
    'movie/demon'
], function(_, $, event, choreo, util, demon) {

    var wait = util.wait,

        DESC = '本节目由豆瓣友邻广播，豆瓣读书，豆瓣电影，豆瓣音乐，豆瓣同城，豆瓣小组，豆瓣 FM及豆瓣更多赞助播出。豆瓣读书，带来雪姨与五点钟。豆瓣电影，让好电影来找你。豆瓣 FM，与好音乐不期而遇。上 fili, 与 502 也不期而遇。',

        TPL_JUDGE = '<div class="judge"><img width="96" height="96" src="/pics/guess/{ID}.jpg">{NAME}</div>',

        JUDGE_LIST = [
            { name: '卢十三', id: '13' },
            { name: '影子', id: 'yingzi' },
            { name: 'su37', id: 'su37' },
            { name: '流一手', id: 'liuyishou' },
            { name: '超哥', id: 'chaoge' },
            { name: 'tgnn', id: 'tgnn' },
        ];

    function initJudges(win) {
        var judges = {};

        JUDGE_LIST.forEach(function(item) {
            var dom = $(TPL_JUDGE.replace('{ID}', item.id).replace('{NAME}', item.name)).appendTo(win.document.body),
                demonItem = demon({
                    origin: dom,
                    className: 'demon-' + item.id,
                    window: win
                });

            demonItem.showBody().showHands().showLegs();

            judges[item.id] = {
                name: item.name,
                dom: dom,
                demon: demonItem
            };
        });

        return judges;
    }

    return {

        announce: function(screen) {

            return screen('“中国好条目”——我要上豆瓣猜', DESC, 1000);

        },

        main: function(win, promise) {
            var doc = win.document,
                piggy = $('<div></div>').appendTo(document.body),
                piggyAvatar = new Image(),
                piggyPromise = new event.Promise(),
                piggyDemon,
                judges = initJudges(win);

            piggyAvatar.src = '/pics/guess/piggy-avatar.jpg';
            piggyAvatar.width = 96;
            piggyAvatar.height = 96;
            piggyAvatar.onload = function() {
                piggyPromise.fire();
            };

            piggyPromise.done(function() {

                piggy
                    .append(piggyAvatar)
                    .css({
                        position: 'fixed',
                        top: ($(window).height() - piggyAvatar.height) / 2 + 'px',
                        right: -piggyAvatar.width + 'px'
                    });

                piggyDemon = demon({
                    origin: piggy,
                    className: 'demon-piggy',
                    window: win
                });

                piggyDemon.showBody().showHands().showLegs();

                return wait(200);

            }).follow().done(function() {

                piggyDemon.walk([ -160, 0 ], 1200);

                return wait(1200 + 200);

            }).follow().done(function() {

                piggyDemon.rotateHand('left', '130deg', 300);

                piggyDemon.speak('大家好，我是今天“我要上豆瓣猜”的主持人，猪头小秘书！', 2000, 9);

                piggyDemon.rotateHand('right', '-130deg', 500);

                return wait(2000 + 300);

            }).follow().done(function() {

                piggyDemon.rotateHand('left', '170deg', 200);

                piggyDemon.speak('旧的不去，新的不来，今儿我们启用全新的大舞台！', 2000, 9);

                return wait(2000 + 200);

            }).follow().done(function() {

                var action = choreo().play();

                piggyDemon.rotateHand('left', '130deg', 500, 'easeIn');

                action.actor($('#wrapper', doc)[0], {
                    transform: 'translateX(-1500px)'
                }, 1000, 'easeInOut').follow().done(function() {

                    var guessStyle = $('<link rel="stylesheet" href="../dist/css/chapter/guess-style.css">').appendTo($('head', doc)),
                        wrapper = $('#wrapper', doc);

                    wrapper
                        .attr('style', '')
                        .css('opacity', 0)
                        .html('\
                            <div id="bd">\
                                <div class="main">\
                                    <h1>欢迎，各位评委</h1>\
                                    <div class="guess3-list"></div>\
                                </div>\
                            </div>\
                        ');

                    var action = choreo().play();

                    action.actor(wrapper[0], {
                        opacity: 1
                    }, 300, 'easeInOut');

                });

                return wait(1500 + 200);

            }).follow().done(function() {

                piggyDemon.rotateHand('left', '20deg', 300, 'easeIn');
                piggyDemon.rotateHand('right', '-20deg', 500, 'easeIn');

                return wait(500 + 300);

            }).follow().done(function() {

                piggyDemon.walk([ -250, -100 ], 1200, 'easeInOut');

                wait(1200 + 500).done(function() {

                    piggyDemon.speak('接下来，我们隆重邀请敬爱的评委们，大家鼓掌～～～～', 1000, 12);

                });

                return wait(2800 + 400);

            }).follow().done(function() {

                piggyDemon.speak('第一位是兆维卢十三老湿，大家欢迎～', 800, 6);

                wait(700).done(function() {

                    var lu13 = judges['13'].demon;

                    lu13.rotateHand('right', '-60deg');
                    lu13.rotateHand('left', '-66deg');

                    lu13.walk([ 1200, -10 ], 3500);

                    wait(3500 + 300).done(function() {

                        lu13.rotateHand('left', '140deg', 500);
                        lu13.rotateHand('right', '-130deg', 440);

                        wait(600).done(function() {

                            lu13.speak('我是一名工程师，我喜欢用trello，所以我女朋友踹了我。', 2500, 12);

                            wait(2500 + 200).done(function() {

                                lu13.rotateHand('left', '30deg', 300);
                                lu13.rotateHand('right', '-32deg', 240);

                            });

                        });

                    });

                });

                return wait(800 + 3800 + 3000 + 800);

            }).follow().done(function() {

                piggyDemon.speak('接下来是芙蓉镇应支书～～', 2000, 8);

                wait(2000 + 200).done(function() {

                    var yingzi = judges['yingzi'].demon;

                    yingzi.walk([ 1060, -14 ], 3000);

                    wait(3000 + 200).done(function() {

                        yingzi.speak('喜欢一切雅俗共赏、能刷新认识的电影…文艺你伤不起', 2500, 10);

                    });

                });

                return wait(8400 + 200);

            }).follow().done(function() {

                piggyDemon.speak('下一位是根本就没有 su37 ？？！！', 2000, 8);

                wait(2000 + 200).done(function() {

                    var su37 = judges['su37'].demon;

                    su37.walk([ 860, -12 ], 2600);

                    wait(2600 + 200).done(function() {

                        su37.speak('为了方便大家记忆，从今年开始，以后每年我都是37岁，今后大家再也不用计算我多少岁啦，是不是好轻松的感觉！举手之劳，方便别人，方便自己，低碳环保，利国利民。', 4000, 12);

                        wait(5000 + 20).done(function() {

                            su37.rotateHand('right', '-56deg', 200);

                            wait(200 + 100).done(function() {

                                su37.speak('旁边两位靠这么近干嘛呀，激情四射呀！', 1500, 1);

                                wait(1500 + 200).done(function() {

                                    var lu13 = judges['13'].demon,
                                        yingzi = judges['yingzi'].demon;

                                    lu13.speak('不行啊？！', 1000, 12);

                                    wait(300).done(function() {

                                        yingzi.speak('不行啊？！', 800, 10);

                                    });

                                    wait(1500 + 200).done(function() {

                                        su37.speak('。。。', 800, 1);
                                        su37.rotateHand('right', '-28deg', 200);

                                    });

                                });

                            });

                        });

                    });

                });

                return wait(15000 + 1000);

            }).follow().done(function() {

                piggyDemon.speak('热烈有请豆瓣唯一高端人士，流一手！！！', 1400, 8);

                wait(1400 + 200).done(function() {

                    var liuyishou = judges['liuyishou'].demon;

                    liuyishou.walk([ 660, -13 ], 2000);

                    wait(2000 + 200).done(function() {

                        liuyishou.speak('重要的不是流一手，而是流一被子。', 2000, 12);

                    });

                });

                return wait(1600 + 2200 + 2000 + 200);

            }).follow().done(function() {

                piggyDemon.speak('接下来是酒仙桥超哥！！', 1400, 8);

                wait(1400 + 200).done(function() {

                    var chaoge = judges['chaoge'].demon;

                    chaoge.walk([ 460, -10 ], 1500);

                    wait(1500 + 200).done(function() {

                        chaoge.speak('为什么有人喜欢黑柴静和刘瑜。整天从傻逼那儿找智商优越感，有意思吗？', 2000, 12);

                    });

                });

                return wait(1600 + 1700 + 2000 + 200);

            }).follow().done(function() {

                piggyDemon.speak('最后一位评委老湿就是我们可爱的tgnn！！', 1400, 8);

                wait(1400 + 200).done(function() {

                    var tgnn = judges['tgnn'].demon;

                    tgnn.walk([ 260, -10 ], 1000);

                    wait(1000 + 200).done(function() {

                        tgnn.speak('理财投资褥羊毛，电器产品都知道，你们虽然too森破，照样能说一大套。', 2000, 2);

                    });

                });

                return wait(1600 + 1200 + 2000 + 200);

            })

            /* section#1 一代宗师 by lifei */
            .follow().done(function() {

            })
            /* end fo section#1 */

            /* section#2 FM by lifei */
            .follow().done(function() {

            })
            /* end fo section#2 */

            /* section#3 相册 by gonghao */
            .follow().done(function() {

            })
            /* end fo section#3 */

            /* section#4 猫 by zhaoguo */
            .follow().done(function() {

            })
            /* end fo section#4 */

            /* section#5 阿北 by gonghao */
            .follow().done(function() {

            })
            /* end fo section#5 */

            /* section#6 拖黑 by zhaoguo */
            .follow().done(function() {

            })
            /* end fo section#6 */

        },

        reset: function() {}

    };

});
