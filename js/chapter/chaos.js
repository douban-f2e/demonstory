define([
  'mo/lang',
  'dollar',
  'choreo',
  'eventmaster',
  'movie/util',
  'movie/camera',
  'movie/demon'
], function(_, $, choreo, event, util, camera, demon){

  var wait = util.wait,
  jump_count = 0;

  var action = choreo().play();

  return {

    announce: function(screen){
      return screen('我们不慢', '不断改版的豆瓣，怎么可能是慢公司...', 1);
    },

    main: function(win, promise){
      // tmp object for offset
      var o;

      var doc = win.document;

      var screen = camera(win);

      //var top_nav = $('.top-nav', doc);
      var header = $('#header_wrapper', doc);
      var cursor = $('#cursor', doc);
      var stream_list = $('#streams', doc);
      var shuo_textarea = $('#isay-cont', doc);

      var d_noti;

      var bgm = document.createElement('audio');
      bgm.src = '/pages/update_old1_files/Explore-short_01.mp3';
      doc.body.appendChild(bgm);

      wait(200).done(function() {
        header.addClass('animated');
        header.addClass('swing');
        bgm.play();

        return wait(1800);
      }).follow().done(function() {
        header.addClass('rotateOutDownLeft');
        return wait(1300);
      }).follow().done(function() {
        var new_nav = $($('#tmpl-new-nav', doc).html().trim());
        header.before(new_nav);

        header.remove();

        action.actor(new_nav[0], {
          'height': '142px'
        }, 600, 'easeOutBack');

        return wait(1600);
      }).follow().done(function() {
         d_noti = demon({
          origin: $('#noti', doc)[0],
          className: 'd_noti',
          window: win
        });

        d_noti.showBody().showEyes();
        return wait(800);
      }).follow().done(function() {
        d_noti.showHands().showLegs()
        return wait(800);
      }).follow().done(function() {
        // zoom to demon
        screen.pan({
          elem: d_noti.origin,
          offset: {
            top: -80
          },
          duration: 300
        });
        return wait(600);
      }).follow().done(function() {
        d_noti.waveHand('left', 20);
        return wait(1600);
      }).follow().done(function() {
        // reset back
        screen.reset();
        return wait(1600);
      }).follow().done(function() {

        // demon walk away
        d_noti.walk([900], 3000, 'easeIn');
        return wait(2000);
      }).follow().done(function() {
        d_noti.origin.remove();
        d_noti.me.remove();
        return wait(100);
      }).follow().done(function() {
        // 数字增长
        var num = $('#reminder-num', doc);
        num.show();

        // zoom to numbers
        screen.pan({
          elem: num[0],
          offset: {
            top: -120
          },
          duration: 400
        });
        o = num.offset();
        num.hide();

        return wait(800);
      }).follow().done(function() {
        var num = $('#reminder-num', doc);
        num.show();

        var span = $('span', num);

        // cursor coming
        choreo().play().actor(cursor[0], {
          top: o.top + 25 + 'px',
          left: o.left + 25 + 'px'
        }, 2500);

        function grow(n) {
          span.html(n);
          if (n > 99000) return;
          setTimeout(function() {
            n =  n + parseInt(Math.sqrt(n));
            grow(n);
          }, 210);
        }
        grow(4);
        return wait(800);
      }).follow().done(function() {
        // cursor confused 1
        choreo().play().actor(cursor[0], {
          left: o.left - 20 + 'px',
          top: o.top + 5 + 'px'
        }, 1200);
        return wait(1000);
      }).follow().done(function() {
        // cursor confused 2
        choreo().play().actor(cursor[0], {
          left: o.left + 20 + 'px',
          top: o.top + 10 + 'px'
        }, 400);
        return wait(800);
      }).follow().done(function() {
        // cursor confused 3
        choreo().play().actor(cursor[0], {
          left: o.left + 60 + 'px',
          top: o.top + 120 + 'px'
        }, 1200);
        return wait(1600);
      }).follow().done(function() {
        screen.reset();
        return wait(1500);
      }).follow().done(function() {
        o = stream_list.offset();

        // cursor move to stream
        choreo().play().actor(cursor[0], {
          left: o.left + o.width * 0.7 + 'px',
          top: o.top + 150 + 'px'
        }, 1200);

        return wait(2000);
      }).follow().done(function() {
        // cursor move up
        choreo().play().actor(cursor[0], {
          left: o.left + o.width * 0.5 + 'px',
          top: o.top - 45 + 'px'
        }, 900);

        // shuo
        var items = $('#tmpl-streams', doc).html().trim();
        items = $(items);

        var n = 0;
        items.forEach(function(item, i) {
          if (item.nodeValue) return;
          n++;
          setTimeout(function() {
            item.className += ' animated fadeInDown';
            stream_list.prepend(item);
          }, n * 1800 - 500);
        });

        return wait(1800);
      }).follow().done(function() {

        // cursor move down
        choreo().play().actor(cursor[0], {
          left: o.left + o.width * 0.95 + 'px',
          top: o.top + 45 + 'px'
        }, 1200);

        return wait(5200);
      }).follow().done(function() {
        choreo().play().actor(cursor[0], {
          left: o.left + o.width * 0.5 + 'px',
          top: o.top - 50 + 'px'
        }, 700, 'easeOutBack');

        return wait(900);
      }).follow().done(function() {
        // prepare for focus
        choreo().play().actor(cursor[0], {
          left: o.left + 7 + 'px',
          top: o.top - 54 + 'px'
        }, 1);
        return wait(100);
      }).follow().done(function() {
        shuo_textarea[0].focus();

        cursor.addClass('animated');
        cursor.addClass('inputing');

        return wait(1600);
      }).follow().done(function() {
        var text = '其实我觉得这次改的还不错啊。。。。。。';
        for (var i = 1; i < 18; i++) {
          (function() {
            var x = i;
            setTimeout(function() {
              cursor.css({
                left: o.left + 8 + 12 * x + 'px',
              });
              shuo_textarea[0].value = text.slice(0, x);
              win.Do.ISay.validate();
            }, i * 300);
          })();
        }
        return wait(600);
      }).follow().done(function() {
        screen.pan({
          elem: shuo_textarea[0],
          duration: 800
        });
        return wait(6000);
      }).follow().done(function() {
        screen.reset();
      }).follow().done(function() {
        return wait(50000);
        var link_hui = $('#lnk-hui', doc);
        return wait(0);
      }).follow().done(function() {
        return wait(50000);
      }).follow().done(function() {
        //promise.fire();
      });

      return promise;
    },

    reset: function(){

    }

  };

});


