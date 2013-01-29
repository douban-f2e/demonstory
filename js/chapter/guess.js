
define([
    'mo/lang',
    'dollar',
    'eventmaster',
    'choreo',
    'movie/util',
    'movie/camera',
    'movie/demon'
], function(_, $, event, choreo, util, camera, demon) {

    var wait = util.wait,

        DESC = '本节目由豆瓣友邻广播，豆瓣读书，豆瓣电影，豆瓣音乐，豆瓣同城，豆瓣小组，豆瓣 FM及豆瓣更多赞助播出。豆瓣读书，带来雪姨与五点钟。豆瓣电影，让好电影来找你。豆瓣 FM，与好音乐不期而遇。上 fili, 与 502 也不期而遇。',

        JUDGE_LIST = [
            { name: '卢十三', id: 'lu13' },
            { name: '影子', id: 'yingzi' },
            { name: 'su37', id: 'su37' },
            { name: '超哥', id: 'chaoge' },
            { name: '老卡', id: 'laoka' }
        ];

    function initJudges(win) {
        var doc = win.document,
            judges = {},
            materials = $('#materials', doc);

        materials.show();

        JUDGE_LIST.forEach(function(item) {
            var dom = $('#judge-' + item.id, doc),
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

        materials.hide();

        return judges;
    }

    return {

        sfx: {
            intro: '/media/guess/intro.mp3',
            'piggy/intro': '/media/guess/piggy/1.m4a',
            'piggy/intro-lu13': '/media/guess/piggy/2lu13.m4a',
            'piggy/intro-yingzi': '/media/guess/piggy/3yingzi.m4a',
            'piggy/intro-su37': '/media/guess/piggy/4su37.m4a',
            'piggy/intro-chaoge': '/media/guess/piggy/5chaoge.m4a',
            'piggy/section-1': '/media/guess/piggy/7yidaizongshi.m4a',
            'piggy/section-2': '/media/guess/piggy/8normal-fm.m4a',
            'piggy/section-3': '/media/guess/piggy/9xiangce.m4a',
            'piggy/section-4': '/media/guess/piggy/10xiayiwei.m4a',
            'piggy/section-4-1': '/media/guess/piggy/11houtai.m4a',
            'piggy/section-5': '/media/guess/piggy/12riji.m4a',
            'piggy/section-6': '/media/guess/piggy/13lichengpeng.m4a',
            'piggy/end': '/media/guess/piggy/14run.m4a',
            'lu13/intro': '/media/guess/lu13/1.m4a',
            'lu13/intro-1': '/media/guess/lu13/2he1.m4a',
            'lu13/section-1': '/media/guess/lu13/3zongshi.m4a',
            'lu13/section-2': '/media/guess/lu13/4he-fm.m4a',
            'lu13/section-2-1': '/media/guess/lu13/5he-pro-fm.m4a',
            'lu13/section-4': '/media/guess/lu13/6mao.m4a',
            'lu13/section-5': '/media/guess/lu13/8he-riji.m4a',
            'yingzi/intro': '/media/guess/yingzi/1.m4a',
            'yingzi/section-1': '/media/guess/yingzi/2zongshi.m4a',
            'yingzi/section-3': '/media/guess/yingzi/3xiangce.m4a',
            'yingzi/section-4': '/media/guess/yingzi/4he-mao.m4a',
            'su37/intro': '/media/guess/su37/1.m4a',
            'su37/intro-1': '/media/guess/su37/2.m4a',
            'su37/section-1': '/media/guess/su37/3zongshi.m4a',
            'su37/section-2': '/media/guess/su37/4fm-ad.m4a',
            'su37/section-3': '/media/guess/su37/5xiangce.m4a',
            'su37/section-3-1': '/media/guess/su37/5xiangce-2.m4a',
            'su37/section-5': '/media/guess/su37/6riji.m4a',
            'su37/section-6': '/media/guess/su37/7paolu.m4a',
            'mao/section-4-1': '/media/guess/mao/1.m4a',
            'mao/section-4-2': '/media/guess/mao/2xiachang.m4a',
            'ka/section-6-1': '/media/guess/ka/1.m4a',
            'ka/section-6-2': '/media/guess/ka/2.m4a',
            'fm/fm_normal': '/media/guess/fm/fm_normal.mp3',
            'fm/fm_ad': '/media/guess/fm/fm_ad.mp3',
            'fm/fm_pro': '/media/guess/fm/fm_pro.mp3'
        },

        announce: function(screen, sfx) {

            return screen('“中国好条目”——我要上豆瓣猜', DESC, 1000, sfx.intro);

        },

        main: function(win, promise, sfx) {
            var doc = win.document,
                screen = camera(win),
                piggy = $('#host-piggy', doc),
                piggyPromise = new event.Promise(),
                piggyDemon,
                materials = $('#materials', doc),
                sectionDemons = {},
                judges = initJudges(win),
                viewportWidth = win.innerWidth;


            piggyPromise.done(function() {

                materials.show();

                piggy.css({
                    position: 'fixed',
                    top: ($(window).height() - 96) / 2 + 'px',
                    right: -96 + 'px'
                });

                piggyDemon = demon({
                    origin: piggy,
                    className: 'demon-piggy',
                    window: win
                });

                materials.hide();

                piggyDemon.showBody().showHands().showLegs();

                return wait(200);

            }).follow().done(function() {

                piggyDemon.walk([ -160, 0 ], 1200);

                return wait(1200 + 200);

            }).follow().done(function() {

                piggyDemon.rotateHand('left', '130deg', 300);

                piggyDemon.speak('大家好，我是今天“我要上豆瓣猜”的主持人，猪头小秘书！', 2000, 9, sfx['piggy/intro']);

                piggyDemon.rotateHand('right', '-130deg', 500);

                return wait(2000 + 300);

            }).follow().done(function() {

                piggyDemon.rotateHand('left', '170deg', 200);

                piggyDemon.speak('旧的不去，新的不来，今儿我们启用全新的大舞台！', 2000, 9, sfx['piggy/intro']);

                return wait(2000 + 200);

            }).follow().done(function() {

                var action = choreo().play();

                piggyDemon.rotateHand('left', '130deg', 500, 'easeIn');

                action.actor($('#wrapper', doc)[0], {
                    transform: 'translateX(-1500px)'
                }, 1000, 'easeInOut').follow().done(function() {

                    var wrapper = $('#wrapper', doc);

                    wrapper
                        .attr('style', '')
                        .css('opacity', 0)
                        .html('');

                    materials.show();

                    $('.wyssy-item-con', materials).each(function() {
                        var dom = $(this),
                            index = dom.data('section'),
                            sectionDemon;

                        dom.css('visibility', 'hidden');

                        sectionDemon = demon({
                            origin: dom,
                            className: 'demon-section',
                            window: win
                        });

                        sectionDemon.showBody().showHands().showLegs();

                        sectionDemon.me.css({
                            left: -sectionDemon.me.width() - 20 + 'px',
                            top: '110px',
                            visibility: 'visible'
                        });

                        sectionDemons[index] = sectionDemon;
                    });

                    materials.hide();

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

                piggyDemon.walk([ -140, -100 ], 1200, 'easeInOut');

                wait(1200 + 500).done(function() {

                    piggyDemon.speak('来到现场的评委有～', 1000, 12, sfx['piggy/intro-lu13']);

                });

                return wait(2800 + 400);

            }).follow().done(function() {

                piggyDemon.speak('第一位是兆维卢十三老湿，大家欢迎～', 800, 6, sfx['piggy/intro-lu13']);

                wait(700).done(function() {

                    var lu13 = judges['lu13'].demon;

                    lu13.rotateHand('right', '-60deg');
                    lu13.rotateHand('left', '-66deg');

                    lu13.walk([ 1200, -10 ], 3500);

                    wait(3500 + 300).done(function() {

                        lu13.rotateHand('left', '140deg', 500);
                        lu13.rotateHand('right', '-130deg', 440);

                        wait(600).done(function() {

                            lu13.speak('我是一名工程师，我喜欢用trello，所以我女朋友踹了我。', 2500, 12, sfx['lu13/intro']);

                            wait(2500 + 200).done(function() {

                                lu13.rotateHand('left', '30deg', 300);
                                lu13.rotateHand('right', '-32deg', 240);

                            });

                        });

                    });

                });

                return wait(800 + 3800 + 3000 + 800);

            }).follow().done(function() {

                piggyDemon.speak('接下来是芙蓉镇影支书～～', 2000, 8, sfx['piggy/intro-yingzi']);

                wait(2000 + 200).done(function() {

                    var yingzi = judges['yingzi'].demon;

                    yingzi.walk([ 1060, -14 ], 3000);

                    wait(3000 + 200).done(function() {

                        yingzi.speak('喜欢一切雅俗共赏、能刷新认识的电影…文艺你伤不起', 2500, 10, sfx['yingzi/intro']);

                    });

                });

                return wait(8400 + 200);

            }).follow().done(function() {

                piggyDemon.speak('下一位是根本就没有 su37 ？？！！', 2000, 8, sfx['piggy/intro-su37']);

                wait(2000 + 200).done(function() {

                    var su37 = judges['su37'].demon;

                    su37.walk([ 820, -12 ], 2600);

                    wait(2600 + 200).done(function() {

                        su37.speak('为了方便大家记忆，从今年开始，以后每年我都是37岁，今后大家再也不用计算我多少岁啦，是不是好轻松的感觉！举手之劳，方便别人，方便自己，低碳环保，利国利民。', 4000, 12, sfx['su37/intro']);

                        wait(5000 + 20).done(function() {

                            su37.rotateHand('right', '-56deg', 200);

                            wait(200 + 100).done(function() {

                                su37.speak('旁边两位靠这么近干嘛呀，激情四射呀！', 1500, 11, sfx['su37/intro-1']);

                                wait(1500 + 200).done(function() {

                                    var lu13 = judges['lu13'].demon,
                                        yingzi = judges['yingzi'].demon;

                                    lu13.speak('不行啊？！', 1000, 12, sfx['lu13/intro-1']);

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

                piggyDemon.speak('接下来是酒仙桥超哥！！', 1400, 8, sfx['piggy/intro-chaoge']);

                wait(1400 + 200).done(function() {

                    var chaoge = judges['chaoge'].demon;

                    chaoge.walk([ 550, -10 ], 1500);

                    wait(1500 + 200).done(function() {

                        chaoge.speak('为什么有人喜欢黑柴静和刘瑜。整天从傻逼那儿找智商优越感，有意思吗？', 2000, 12);

                    });

                });

                return wait(1600 + 1700 + 2000 + 200);

            })

            /* section#1 一代宗师 by lifei */
            .follow().done(function() {

                // return wait(0);

                var sectionDemon = sectionDemons[1],
                    chaoge = judges['chaoge'].demon,
                    su37 = judges['su37'].demon,
                    yingzi = judges['yingzi'].demon,
                    lu13 = judges['lu13'].demon,
                    sectionPromise = new event.Promise();

                piggyDemon.speak('欢迎第一位选手入场，饱受争议电影条目“一代宗师”！', 5000, 12, sfx['piggy/section-1']);

                sectionDemon.me.css('top', '140px');

                wait(5000 + 200).done(function() {

                    sectionDemon.walk([ (viewportWidth - sectionDemon.me.width()) / 2 + sectionDemon.me.width(), 0 ], 3000);
                    wait(3000).done(function() {

                        lu13.speak('骚！', 1200, 12, sfx['lu13/intro-1']);
                        return wait(1200 + 800);

                    }).follow().done(function() {

                        yingzi.speak('我。没。看。懂。这。个。武。术。家。出。轨。未。遂。的。片。子。呀。。。', 9000, 12, sfx['yingzi/section-1']);
                        return wait(9000 + 800);

                    }).follow().done(function() {

                        su37.speak('故事都讲不周全，还拍个啥电影？只会摆格调的话，应该去搞展览，比如”带墨镜的人”之类的主题展应该更适合他。', 14000, 12, sfx['su37/section-1']);
                        return wait(14000 + 800);

                    }).follow().done(function() {

                        chaoge.speak('hold住就是胜利', 2000, 12);
                        return wait(2000 + 800);

                    });
                    return wait(3000 + 2000 + 9800 + 14800 + 2800 + 200);
                }).follow().done(function() {
                    sectionDemon.walk([ viewportWidth + sectionDemon.me.width() + 20, 30 ], 3000, 'easeIn');
                    sectionPromise.fire();
                });

                return sectionPromise;
            })
            /* end fo section#1 */

            /* section#2 FM by lifei */
            .follow().done(function() {

                var proDemon = sectionDemons['fm-pro'],
                    normalDemon = sectionDemons['fm-normal'],
                    adDemon = sectionDemons['fm-ad'],
                    chaoge = judges['chaoge'].demon,
                    su37 = judges['su37'].demon,
                    yingzi = judges['yingzi'].demon,
                    lu13 = judges['lu13'].demon,
                    sectionPromise = new event.Promise();

                piggyDemon.speak('有请下一位选手入场，歌曲“Put Your Records On“', 4000, 12, sfx['piggy/section-2']);

                wait(4000 + 200).done(function() {
                    normalDemon.walk([ (viewportWidth - normalDemon.me.width()) / 2 + normalDemon.me.width(), 0 ], 10000);
                    normalDemon.sound(sfx['fm/fm_normal'], 10000, 100);

                    wait(13000).done(function() {

                        chaoge.speak('才 64k，还不如广告音质好！', 5000, 10);
                        lu13.speak('才 64k，还不如广告音质好！', 5000, 10, sfx['lu13/section-2']);
                        su37.speak('才 64k，还不如广告音质好！', 5000, 10);
                        yingzi.speak('才 64k，还不如广告音质好！', 5000, 10);

                    });
                    return wait(18000 + 800);

                }).follow().done(function() {
                    normalDemon.walk([ viewportWidth + normalDemon.me.width() + 20, 30 ], 3000, 'easeIn');
                    normalDemon.speak('嘤嘤嘤嘤', 1500, 6);
                    return wait(3000 + 200);

                }).follow().done(function() {
                    adDemon.walk([ (viewportWidth - adDemon.me.width()) / 2 + adDemon.me.width(), 0 ], 4000);
                    adDemon.sound(sfx['fm/fm_ad'], 8000, 100);
                    wait(8000).done(function() {

                        chaoge.speak('负分，滚粗啊！', 1500, 10);
                        lu13.speak('负分，滚粗啊！', 1500, 10);
                        su37.speak('负分，滚粗啊！', 1500, 10);
                        yingzi.speak('负分，滚粗啊！', 1500, 10);

                    });

                    return wait(10000 + 800);

                }).follow().done(function() {
                    proDemon.walk([ (viewportWidth - proDemon.me.width()) / 2 + proDemon.me.width(), 0 ], 10000);
                    proDemon.sound(sfx['fm/fm_pro'], 20000, 100);
                    wait(5000).done(function() {
                        proDemon.speak('Pro登场，广告还不速速退场！', 3000, 3);
                        adDemon.speak('灰溜溜的逃走', 3000, 3);
                        adDemon.walk([ viewportWidth + adDemon.me.width() + 20, 30 ], 3000, 'easeIn');
                        return wait(15000 + 200);
                    }).follow().done(function() {
                        proDemon.speak('更纯洁的音质，无广告的体验', 1500, 10);
                        return wait(1500 + 200);
                    }).follow().done(function() {
                        chaoge.speak('赞，高端大气上档次！', 3500, 10);
                        lu13.speak('赞，高端大气上档次！', 3500, 10, sfx['lu13/section-2-1']);
                        su37.speak('赞，高端大气上档次！', 3500, 10);
                        yingzi.speak('赞，高端大气上档次！', 3500, 10);
                    });

                    return wait(25500 + 200);
                }).follow().done(function() {
                    proDemon.walk([ viewportWidth + proDemon.me.width() + 20, 30 ], 3000, 'easeIn');
                    return wait(3000 + 200);

                }).follow().done(function() {
                    // section end
                    sectionPromise.fire();

                });
                return sectionPromise;

            })
            /* end fo section#2 */

            /* section#3 相册 by gonghao */
            .follow().done(function() {

                // return wait(0);

                var sectionDemon = sectionDemons[3],
                    chaoge = judges['chaoge'].demon,
                    su37 = judges['su37'].demon,
                    yingzi = judges['yingzi'].demon,
                    lu13 = judges['lu13'].demon,
                    sectionPromise = new event.Promise();

                piggyDemon.speak('欢迎下一位选手入场，这位选手的名字叫『有容乃大』。。。', 1500, 12, sfx['piggy/section-3']);

                wait(1500 + 200).done(function() {

                    sectionDemon.walk([ (viewportWidth - sectionDemon.me.width()) / 2 + sectionDemon.me.width(), 0 ], 5000);

                    wait(1000).done(function() {

                        su37.speak('想：远了点儿，走近了爷仔细看看', 1000, 12, sfx['su37/section-3']);

                        return wait(1000 + 800);

                    }).follow().done(function() {

                        chaoge.speak('想：这也能黑柴静？！', 1000, 12);

                        return wait(1000 + 300);

                    }).follow().done(function() {

                        yingzi.speak('想：嗯，给力！', 500, 10);

                        lu13.speak('想：大爱X大呀！', 600, 12, sfx['lu13/section-3']);

                        return wait(800 + 200);

                    });

                    return wait(5000 + 200);

                }).follow().done(function() {

                    var action = choreo().play();

                    action.actor($('#db-global-nav', doc)[0], {
                        opacity: 0.5
                    }, 200);

                    action.actor($('#db-nav-sns', doc)[0], {
                        opacity: 0.5
                    }, 200);

                    wait(200).done(function() {

                        $('#pause', doc)
                            .css({
                                position: 'absolute',
                                top: '20px',
                                right: '20px'
                            })
                            .appendTo(doc.body);

                        return wait(500);

                    }).follow().done(function() {

                        screen.pan({
                            elem: $('.pic', sectionDemon.me),
                            zoom: 2,
                            offset: {
                                top: -60
                            },
                            duration: 800
                        });

                        return wait(800 + 200);

                    }).follow().done(function() {

                        var mouse = $('#mouse', doc)
                                .css({
                                    position: 'absolute',
                                    top: '170px',
                                    left: '290px',
                                    zIndex: '1'
                                }).appendTo(doc.body),

                            action = choreo().play();

                        action.actor(mouse[0], {
                            top: '170px',
                            left: '490px'
                        }, 500, 'easeOut');

                        return wait(500 + 200);

                    }).follow().done(function() {

                        var saveAs = $('#save-as', doc)
                                .css({
                                    position: 'absolute',
                                    top: '50px',
                                    left: '430px',
                                    opacity: 0
                                }).appendTo(doc.body),

                            action = choreo().play();

                        action.actor(saveAs[0], {
                            opacity: 1
                        }, 300, 'easeIn');

                        return wait(300 + 200);

                    }).follow().done(function() {

                        var saveAsDialog = $('#save-as-dlg', doc)
                                .css({
                                    position: 'absolute',
                                    top: '95px',
                                    left: '370px',
                                    opacity: 0
                                }).appendTo(doc.body),

                            action = choreo().play();

                        $('#mouse', doc).css('zIndex', 0);

                        action.actor(saveAsDialog[0], {
                            opacity: 1
                        }, 300, 'easeInOut');

                        return wait(300 + 800);

                    }).follow().done(function() {

                        $('#mouse', doc).remove();
                        $('#save-as', doc).remove();

                        var saveAsDialog = $('#save-as-dlg', doc),
                            action = choreo().play();

                        action.actor(saveAsDialog[0], {
                            opacity: 0
                        }, 200, 'easeIn');

                        action.follow().done(function() {
                            saveAsDialog.remove();
                        });

                        return wait(200 + 500);

                    }).follow().done(function() {

                        screen.reset(500);

                        return wait(500 + 200);

                    }).follow().done(function() {

                        var action = choreo().play();

                        action.actor($('#pause', doc)[0], {
                            opacity: 0
                        }, 200, 'easeIn');

                        action.actor($('#db-global-nav', doc)[0], {
                            opacity: 1
                        }, 200);

                        action.actor($('#db-nav-sns', doc)[0], {
                            opacity: 1
                        }, 200);

                        action.follow().done(function() {
                            $('#pause', doc).remove();
                        });

                        return wait(200 + 200);

                    }).follow().done(function() {

                        $('#pause', doc).remove();

                        lu13.speak('不符合社区指导规则。。。嘿嘿嘿。', 2000, 12);
                        yingzi.speak('不符合社区指导规则。。。嘿嘿嘿。', 2000, 11);
                        su37.speak('不符合社区指导规则。。。嘿嘿嘿。', 2000, 12, sfx['su37/section-3-1']);
                        chaoge.speak('不符合社区指导规则。。。嘿嘿嘿。', 2000, 12);

                        return wait(2000 + 200);

                    }).follow().done(function() {

                        var sectionDemon = sectionDemons[3];

                        sectionDemon.walk([ viewportWidth + sectionDemon.me.width() + 20, 30 ], 3000, 'easeIn');

                        return wait(3000 + 200);

                    }).follow().done(function() {

                        // section end
                        sectionPromise.fire();

                    });

                });

                return sectionPromise;

            })
            /* end fo section#3 */

            /* section#4 猫 by zhaoguo */
            .follow().done(function() {

                // return wait(0);

                var sectionDemon = sectionDemons[4],
                    chaoge = judges['chaoge'].demon,
                    su37 = judges['su37'].demon,
                    yingzi = judges['yingzi'].demon,
                    lu13 = judges['lu13'].demon,
                    sectionPromise = new event.Promise();

                piggyDemon.speak('欢迎下一位选手', 1500, 12, sfx['piggy/section-4']);

                wait(1500 + 200).done(function() {

                    sectionDemon.walk([ (viewportWidth - sectionDemon.me.width()) / 2 + sectionDemon.me.width(), 0 ], 2000);

                    return wait(1500 + 400);

                }).follow().done(function(){

                        sectionDemon.speak('四大音乐剧之首，《猫》中文版可以在豆瓣购票了，喵~',2500,6, sfx['mao/section-4-1']);

                    return wait(2500 + 200);

                }).follow().done(function() {

                    lu13.speak('保安呢，怎么回事，谁把票贩子放进来了，赶出去！', 2000, 12, sfx['lu13/section-4']);

                    wait(2000).done(function(){

                        yingzi.speak('赶出去！！！', 1000, 12, sfx['lu13/section-4']);
                        su37.speak('赶出去！！！', 1000, 12);

                        wait(1000 + 200).done(function(){
                            chaoge.speak('额。。。。。。', 1000, 12);
                        });

                    });

                    return wait(2000 + 2000 + 300);

                }).follow().done(function() {

                    sectionDemon.speak('喵了个咪的，你们这些土了吧唧的XX，不知道我是内定的吗，白白了您内~',2500,6, sfx['mao/section-4-2']);

                    wait(2000).done(function(){
                        sectionDemon.walk([-( viewportWidth + sectionDemon.me.width() - 20), 30 ], 2000, 'easeIn');
                    });

                    return wait(3000 + 300);

                }).follow().done(function() {

                    piggyDemon.speak('好吧，有后台我们惹不起~~', 1500, 9, sfx['piggy/section-4-1']);
                    lu13.speak('。。。。。。',900,12);
                    su37.speak('。。。。。。',900,12);
                    chaoge.speak('。。。。。。',900,12);
                    yingzi.speak('。。。。。。',900,12);

                    return wait( 1500 + 300 );

                }).follow().done(function() {

                    // section end
                    sectionPromise.fire();

                });

                return sectionPromise;

            })
            /* end fo section#4 */

            /* section#5 阿北 by gonghao */
            .follow().done(function() {

                // return wait(0);

                var sectionDemon = sectionDemons[5],
                    chaoge = judges['chaoge'].demon,
                    su37 = judges['su37'].demon,
                    yingzi = judges['yingzi'].demon,
                    lu13 = judges['lu13'].demon,
                    sectionPromise = new event.Promise();

                piggyDemon.speak('有请下一位选手入场，这位选手是一篇日记的名字叫『21天精通精益创业』，大家欢迎！', 2500, 12, sfx['piggy/section-5']);

                sectionDemon.me.css('top', '140px');

                wait(2500 + 200).done(function() {

                    sectionDemon.walk([ (viewportWidth - sectionDemon.me.width()) / 2 + sectionDemon.me.width(), 0 ], 5000);

                    wait(3000).done(function() {

                        chaoge.speak('想：月『精』日记又出现了！', 1500, 10);
                        su37.speak('想：月『精』日记又出现了！', 1500, 12, sfx['su37/section-5']);
                        lu13.speak('想：月『精』日记又出现了！', 1500, 12);

                    });

                    return wait(5000 + 200);

                }).follow().done(function() {

                    screen.pan({
                        elem: $('.ahbei-like', sectionDemon.me),
                        zoom: 2.6,
                        duration: 800
                    });

                    return wait(800 + 200);

                }).follow().done(function() {

                    var ahbeiLike = $('.ahbei-like', sectionDemon.me),
                        shiningDuration = 300,
                        shiningTimes = 5,
                        i = 0;

                    ahbeiLike.css('color', 'red');

                    for (; i < shiningTimes; i++) {

                        var fn = (function(count) {
                            if (count % 2 === 0) {
                                return function() {
                                    ahbeiLike.attr('style', '');
                                };
                            }

                            return function() {
                                ahbeiLike.css('color', 'red');
                            };
                        })(i);

                        wait((shiningDuration + 1) * i).done(fn);
                    }

                    return wait((shiningDuration + 1) * shiningTimes + 300);

                }).follow().done(function() {

                    screen.reset(800);

                    return wait(800 + 200);

                }).follow().done(function() {

                    lu13.speak('通过！！！', 2000, 1, sfx['lu13/section-5']);
                    yingzi.speak('通过！！！', 2000, 11);
                    su37.speak('通过！！！', 2000, 12);
                    chaoge.speak('通过！！！', 2000, 12);

                    return wait(2000 + 200);

                }).follow().done(function() {

                    sectionDemon.walk([ viewportWidth + sectionDemon.me.width() + 20, 30 ], 3000, 'easeIn');

                    return wait(3000 + 200);

                }).follow().done(function() {

                    sectionPromise.fire();

                });

                return sectionPromise;

            })
            /* end fo section#5 */

            /* section#6 拖黑 by zhaoguo */
            .follow().done(function() {

                // return wait(0);

                var sectionDemon = sectionDemons[6],
                    chaoge = judges['chaoge'].demon,
                    su37 = judges['su37'].demon,
                    yingzi = judges['yingzi'].demon,
                    lu13 = judges['lu13'].demon,
                    laoka = judges['laoka'].demon,
                    sectionPromise = new event.Promise();

                piggyDemon.speak('下一位看起来很有文化的样子嘛，欢迎~', 1500, 9, sfx['piggy/section-6']);

                wait(1500 + 200).done(function() {

                    sectionDemon.walk([ (viewportWidth - sectionDemon.me.width()) / 2 + sectionDemon.me.width(), 0 ], 2000);

                    return wait(1500 + 400);

                }).follow().done(function(){

                    sectionDemon.speak('一个人的粗话，却有可能是另一个人的抒情诗。这是表达的尊严。', 1500 , 6);

                    wait(1500 + 100).done(function(){

                        sectionDemon.speak('喂，人民，服务。', 1500 , 6);

                        wait(1500 + 100).done(function(){
                            sectionDemon.speak('这年头泡妞，空手不可能套白狼了，空手只能套白眼狼。', 1500 , 6);
                        });

                    });

                    return wait(1500 + 1500 + 1500 + 400);

                }).follow().done(function(){

                    laoka.walk([ 300, -180 ], 1200);
                    laoka.rotateHand('right', '-90deg', 300);

                    wait(1500).done(function(){
                        laoka.speak('干嘛呢，干嘛呢，非法集会，还讨论敏感话题，通通别动！', 2000, 3, sfx['ka/section-6-1']);
                    });

                    return wait( 1500 + 1500 + 400);

                }).follow().done(function(){

                    lu13.walk([1000,-200],1200);
                    lu13.speak('撤！！！',800,12);

                    su37.walk([-300,-2000],2000);
                    su37.speak('靠！！！',800,12, sfx['su37/section-6']);

                    chaoge.walk([-2000,-100],1200);
                    chaoge.speak('额。。。。。',800,12);

                    yingzi.walk([-2100,50],1200);
                    yingzi.speak('匿了',800,12);

                    sectionDemon.walk([1000,-200],1200);
                    lu13.speak('又有砸场的？？？',800,12);

                    wait(1000).done(function(){

                        piggyDemon.speak('不要丢下我啊~~~~', 500, 11, sfx['piggy/end']);
                        piggyDemon.walk([-400,0],1000);

                        wait(1200).done(function(){
                            piggyDemon.walk([2000,0],1500);
                            piggyDemon.speak('救命~~~~~', 500, 9);
                        });

                    });

                    return wait(3000);

                }).follow().done(function(){

                    laoka.walk([400,-50],2000);
                    wait(2000 + 200).done(function(){
                        laoka.speak('哼哼，这下知道首页是谁的了吧！！！',2500, sfx['ka/section-6-2']);
                    });

                    return wait(2000 + 2500 + 200);

                }).follow().done(function() {

                    // section end
                    sectionPromise.fire();

                });

                return sectionPromise;

            })
            /* end fo section#6 */

            // the end
            .follow().done(function() {
                promise.fire();
            });

            // ready for start
            piggyPromise.fire();

            return promise;

        },

        reset: function() {}

    };

});
