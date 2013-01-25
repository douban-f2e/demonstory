
define([
    'mo/lang',
    'dollar',
    'eventmaster',
    'choreo',
    'movie/util',
    'movie/demon'
], function(_, $, event, choreo, util, demon) {

    var wait = util.wait,

        DESC = '本节目由豆瓣友邻广播，豆瓣读书，豆瓣电影，豆瓣音乐，豆瓣同城，豆瓣小组，豆瓣 FM及豆瓣更多赞助播出。豆瓣读书，带来雪姨与五点钟。豆瓣电影，让好电影来找你。豆瓣 FM，与好音乐不期而遇。上 fili, 与 502 也不期而遇。';

    return {

        announce: function(screen) {

            return screen('“中国好条目”——我要上豆瓣猜', DESC, 1000);

        },

        main: function(win, promise) {
            var doc = win.document,
                piggy = $('<div></div>').appendTo(document.body),
                piggyAvatar = new Image(),
                piggyPromise = new event.Promise(),
                piggyDemon;

            piggyAvatar.src = '/pics/piggy-avatar.jpg';
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

                    var guessStyle = $('<link rel="stylesheet" herf="/css/chapter/guess-style.css">').appendTo($('head', doc)),
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

            })


        },

        reset: function() {}

    };

});
