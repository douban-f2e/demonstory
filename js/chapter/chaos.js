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
    sfx: {
      'bgm': '../pages/update_old1_files/Explore-short.mp3'
    },

    announce: function(screen, sfx){
      return screen('改版风云', '关于豆瓣的改版，用户总是有很多很多话要说....', 3000);
    },

    main: function(win, promise, sfx, root){
      // tmp object for offset
      var o;

      var doc = win.document;

      var screen = camera(win);

      //var top_nav = $('.top-nav', doc);
      var header = $('#header_wrapper', doc);
      var cursor = $('#cursor', doc);
      var stream_list = $('#streams', doc);
      var shuo_textarea = $('#isay-cont', doc);
      var h1 = $('h1', doc);
      var link_hui = $('#lnk-hui', doc);
      var reminder, num;


      var d_noti;
      var new_nav;

      //var bgm = document.createElement('audio');
      //bgm.src = '/pages/update_old1_files/Explore-short.mp3';
      //doc.body.appendChild(bgm);

      sfx.bgm.play();

      wait(200).done(function() {
        header.addClass('animated');
        header.addClass('swing');

        return wait(1800);
      }).follow().done(function() {
        header.addClass('hinge');
        return wait(1900);
      }).follow().done(function() {
        new_nav = $($('#tmpl-new-nav', doc).html().trim());
        header.before(new_nav);

        header.remove();

        action.actor(new_nav[0], {
          'height': '142px'
        }, 600, 'easeOutBack');

        return wait(1600);
      }).follow().done(function() {
        new_nav.css('overflow', '');

         d_noti = demon({
          origin: $('#noti', doc)[0],
          className: 'd_noti',
          window: win
        });

        d_noti.showBody().showEyes();
        return wait(800);
      }).follow().done(function() {
        d_noti.squintEye();
        return wait(200);
      }).follow().done(function() {
        d_noti.showHands().showLegs()
        return wait(1200);
      }).follow().done(function() {
        d_noti.normalEye();
        d_noti.moveEye(0.4, 300);
        d_noti.rotateEye('-30deg', 500);
        // zoom to demon
        screen.pan({
          elem: d_noti.origin,
          offset: {
            top: -80
          },
          duration: 500
        });
        return wait(800);
      }).follow().done(function() {
        d_noti.waveHand('left', 20);
        d_noti.rotateEye('-120deg', 500);
        return wait(540);
      }).follow().done(function() {
        d_noti.rotateEye('-90deg', 500);
        d_noti.moveEye(0.1, 500);
        return wait(1500);
      }).follow().done(function() {
        // reset back
        screen.reset(240);
        return wait(1800);
      }).follow().done(function() {

        // demon walk away
        d_noti.walk([900], 3000, 'easeIn');
        return wait(2000);
      }).follow().done(function() {
        choreo().play().actor(d_noti.origin[0], {
          height: 0
        }, 400);
        d_noti.me.remove();
        return wait(460);
      }).follow().done(function() {
        d_noti.origin.remove();

        o = stream_list.offset();

        // cursor move to stream
        choreo().play().actor(cursor[0], {
          left: o.left + o.width * 0.8 + 'px',
          top: o.top + 80 + 'px'
        }, 1200);

        return wait(1800);
      }).follow().done(function() {
        // cursor move up
        choreo().play().actor(cursor[0], {
          left: o.left + o.width * 0.5 + 'px',
          top: o.top - 45 + 'px'
        }, 800, 'easeOutCubic');

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
          }, n * 2100 - 900);
        });

        return wait(1500);
      }).follow().done(function() {
        // cursor move down
        choreo().play().actor(cursor[0], {
          left: o.left + o.width * 0.95 + 'px',
          top: o.top + 45 + 'px'
        }, 1200, 'easeIn');

        return wait(5200);
      }).follow().done(function() {
        choreo().play().actor(cursor[0], {
          left: o.left + o.width * 0.5 + 'px',
          top: o.top - 50 + 'px'
        }, 700, 'ease');
        return wait(1500);
      }).follow().done(function() {
        // prepare for focus
        choreo().play().actor(cursor[0], {
          left: o.left + 7 + 'px',
          top: o.top - 52 + 'px'
        }, 1);
        cursor.addClass('animated');
        cursor.addClass('inputing');

        return wait(1);
      }).follow().done(function() {
        shuo_textarea[0].focus();

        return wait(1200);
      }).follow().done(function() {
        var text = '其实我觉得这次改的还不错耶，你们为什么老是要喷呢。。。。。。。';
        //cursor.hide();
        for (var i = 1; i < 30; i++) {
          (function() {
            var x = i;
            setTimeout(function() {
              shuo_textarea[0].value = text.slice(0, x);
              cursor.css({
                left: o.left + 9 + 14 * x + 'px',
              });
              win.Do.ISay.validate();
            }, x > 19 ? (x + 2) * 230 : x * 230);
          })();
        }
        return wait(600);
      }).follow().done(function() {
        screen.pan({
          elem: shuo_textarea[0],
          duration: 800
        });
        return wait(7800);
      }).follow().done(function() {
        // try publish 
        choreo().play().actor(cursor[0], {
          top: o.top + 14 + 'px',
          left: o.left + o.width - 32 + 'px'
        }, 600, 'easeOut');
        return wait(420);
      }).follow().done(function() {
        // button pressed 
        cursor.removeClass('inputing');
        cursor.addClass('cursor-hand');
        return wait(1400);
      }).follow().done(function() {
        win.Do.ISay.disable();
        cursor.removeClass('cursor-hand');
        return wait(600);
      }).follow().done(function() {
        shuo_textarea[0].blur();
        shuo_textarea.val('')
        win.Do.ISay.check();
        shuo_textarea.css('height', '');
        $('#db-isay', doc).removeClass('active');
        return wait(2600);
      }).follow().done(function() {
        screen.reset(1200);
        return wait(2600);
      }).follow().done(function() {
        // 数字增长
        num = $('#reminder-num', doc);
        num.show();
        return wait(800);
      }).follow().done(function() {
        cursor.removeClass('inputing');
        cursor.show();

        // zoom to numbers
        screen.pan({
          elem: num[0],
          offset: {
            top: -120
          },
          duration: 400
        });
        o = num.offset();

        return wait(900);
      }).follow().done(function() {
        var span = $('span', num);

        // cursor coming
        choreo().play().actor(cursor[0], {
          top: o.top + 25 + 'px',
          left: o.left + 25 + 'px'
        }, 600);

        function grow(n) {
          span.html(n);
          if (n > 99000) return;
          setTimeout(function() {
            n =  n + parseInt(Math.sqrt(n));
            grow(n);
          }, 240);
        }
        grow(4);
        return wait(2600);
      }).follow().done(function() {
        // cursor move to reminders
        choreo().play().actor(cursor[0], {
          top: o.top + 5 + 'px',
          left: o.left + 10 + 'px'
        }, 300);
        return wait(250);
      }).follow().done(function() {
        // cursor change to hand
        cursor.addClass('cursor-hand');

        reminder = $('#more-reminders', doc);

        return wait(800);
      }).follow().done(function() {
        reminder.show();

        $('.top-nav-reminder', doc).addClass('more-active');

        // cursor move away
        choreo().play().actor(cursor[0], {
          left: o.left + 100 + 'px',
          top: o.top + 100 + 'px'
        }, 900);
        return wait(100);
      }).follow().done(function() {
        cursor.removeClass('cursor-hand');
        return wait(1700);
      }).follow().done(function() {
        // pan through items
       var x = o.left + 5;
       var y = o.top;

        $('div.content', reminder).forEach(function(item, i) {
          setTimeout(function() {
            var node = $(item);
            var h = node.height() * 1.5;
            y += h;

            screen.pan({
              cpoint: [x, y],
              offset: {
                top: -620
              },
              duration: 300
            });
            node.addClass('animated');
            node.addClass('pulse');
            choreo().play().actor(cursor[0], {
              left: o.left + 80 + 'px',
              top: y + 22 + 'px'
            }, 300);
          }, i * 1760);
        });
        return wait(9200);
      //}).follow().done(function() {
        //// cursor confused 1
        //choreo().play().actor(cursor[0], {
          //left: o.left - 20 + 'px',
          //top: o.top + 5 + 'px'
        //}, 1200);
        //return wait(1000);
      //}).follow().done(function() {
        //// cursor confused 2
        //choreo().play().actor(cursor[0], {
          //left: o.left + 20 + 'px',
          //top: o.top + 10 + 'px'
        //}, 400);
        //return wait(800);
      //}).follow().done(function() {
        //// cursor confused 3
        //choreo().play().actor(cursor[0], {
          //left: o.left + 60 + 'px',
          //top: o.top + 120 + 'px'
        //}, 1200);
        //return wait(1600);
      }).follow().done(function() { 
        screen.reset();
        return wait(400);
      }).follow().done(function() { 
        $('div.content', reminder).removeClass('pulse');
        reminder.addClass('animated');
        reminder.addClass('fadeOutDown');
        $('.top-nav-reminder', doc).removeClass('more-active');
        return wait(1800);
      }).follow().done(function() {
        reminder.removeClass('animated').hide();
        reminder.removeClass('fadeOutDown');
        h1.addClass('animated');
        h1.addClass('flipOutX');
        return wait(1200);
      }).follow().done(function() {
        h1.html('为了感谢您对豆瓣本次改版的认可，现特别允许你返回旧版……');
        h1.removeClass('flipOutX');
        h1.addClass('tada');
        return wait(2500);
      }).follow().done(function() {
        h1.removeClass('tada');
        h1.addClass('bounceOutLeft');
        return wait(1000);
      }).follow().done(function() {
        $('h1', doc).html('友邻广播');
        h1.removeClass('bounceOutLeft');
        h1.addClass('bounceInLeft');

        link_hui.removeClass('hide');
        link_hui.addClass('animated');
        link_hui.addClass('bounceIn');

        screen.pan({
          elem: link_hui[0],
          duration: 200
        });
        return wait(1400);
      }).follow().done(function() {
        link_hui.removeClass('bounceIn');
        link_hui.removeClass('animated');
        screen.reset(900);
        return wait(1200);
      }).follow().done(function() {
        o = link_hui.offset();

        choreo().play().actor(cursor[0], {
          left: o.left + 10 + 'px',
          top: o.top + 5 + 'px'
        }, 600);

        return wait(550);
      }).follow().done(function() {
        cursor.addClass('cursor-hand');
        return wait(1000);
      }).follow().done(function() {
        link_hui.addClass('active');
        return wait(300);
      }).follow().done(function() {
        link_hui.removeClass('active');
        link_hui.html('&gt; 去新版');
        link_guangbo = $('#lnk-guangbo', doc);
        link_guangbo.hide();
        return wait(1000);
      }).follow().done(function() {
        link_hui.addClass('active');
        return wait(400);
      }).follow().done(function() {
        link_hui.removeClass('active');
        link_hui.html('&gt; 回旧版');
        link_guangbo.show();
        link_guangbo.addClass('animated');
        link_guangbo.addClass('flip');

        $('span.verbose', doc).hide();

        $('.notify-mod', doc).html('<a href="http://frodo.douban.com:9010/subject/explore">发现喜欢的东西</a> / <a href="http://frodo.douban.com:9010/subject/e">周边生活</a>');

        return wait(1800);
      }).follow().done(function() {
        link_hui.addClass('active');
        return wait(400);
      }).follow().done(function() {
        link_hui.removeClass('active');
        link_hui.html('&gt; 去新版');
        link_guangbo.hide();
        link_guangbo.removeClass('flip').removeClass('animated');
        return wait(1800);
      }).follow().done(function() {
        link_hui.addClass('active');
        return wait(400);
      }).follow().done(function() {
        link_hui.removeClass('active');
        link_hui.html('&gt; 回旧版');
        link_guangbo.show();

        $('#lnk-xiaozu', doc).hide();

        $('#lnk-buluo', doc).hide();

        $('#lnk-xiaozu-top', doc).show();
        $('#lnk-zhoubian', doc).show();

        $('.notify-mod', doc).html('<h2>发现更多有趣的内容:</h2> <a href="/subject/explore">喜欢的东西</a> / <a href="/app/">移动应用</a>'); 

        link_guangbo.addClass('animated').addClass('flip');
        return wait(1800);
      }).follow().done(function() {
        link_hui.addClass('active');
        return wait(400);
      }).follow().done(function() {
        link_hui.removeClass('active');
        link_hui.html('&gt; 去新版');
        link_guangbo.hide();
        link_guangbo.removeClass('flip').removeClass('animated');
        return wait(1800);
      }).follow().done(function() {
        link_hui.removeClass('active');
        link_hui.html('&gt; 回旧版');
        link_guangbo.show();

        $('#lnk-xiaozhan', doc).hide();
        $('#lnk-faxian', doc).show();

        link_guangbo.addClass('animated').addClass('flip');
        return wait(1800);
      }).follow().done(function() {
        screen.pan({
          elem: new_nav[0],
          zoom: 1.1,
          duration: 100 
        });
        $('#shuai', doc).show().addClass('bounceIn');
        return wait(300);
      }).follow().done(function() {
        screen.reset(100);
        return wait(1000);
      }).follow().done(function() {
        $('#shuai', doc).removeClass('bounceIn').addClass('bounceOutDown');;

        o = stream_list.offset();
        choreo().play().actor(cursor[0], {
          left: o.left + o.width * 0.8 + 'px',
          top: o.top + 180 + 'px'
        }, 1200);

        return wait(600);
      }).follow().done(function() {
        var items = $('#tmpl-streams-2', doc).html().trim();
        items = $(items);
        var n = 0;
        items.forEach(function(item, i) {
          if (item.nodeValue) return;
          n++;
          setTimeout(function() {
            item.className += ' animated fadeInDown';
            stream_list.prepend(item);
          }, n * 2000 - 1800);
        });
        return wait(6500);
      }).follow().done(function() {
        screen.pan({
          elem: $('.status-item', stream_list)[0],
          easing: 'easeOutBack',
          duration: 800
        });
        return wait(2500);
      }).follow().done(function() {
        screen.reset(4000);
        return wait(800);
      }).follow().done(function() {
        promise.fire();
      });

      return promise;
    },

    reset: function(){

    }

  };

});


