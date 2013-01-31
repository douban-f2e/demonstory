define([
  'mo/lang'
, 'dollar'
, 'eventmaster'
, 'movie/util'
, 'movie/demon'
, 'movie/spotlight'
], function(_, $, event, util, demon, spotlight){

  var wait = util.wait
    , DESC = ""
    , jump_count = 0
    , sfx = {}

  for(var i = 1; i <= 9; i++) {
    sfx['w'+i] = 'facebook/talks/w-' + i + '.mp3'
  }
  for(i = 1; i <= 16; i++) {
    sfx['c'+i] = 'facebook/talks/C-' + i + '.mp3'
  }
  sfx.headBGM = 'facebook/facebook-head.mp3'
  sfx.midBGM = 'facebook/mid.mp3'
  sfx.ending = 'facebook/ending.mp3'
  sfx.btn = 'facebook/talks/BTN.mp3'

  return {
    sfx: sfx,
    announce: function(screen, sfx){
      return screen('你不知道的豆瓣阅读...', DESC, 1000)
    },

    main: function(win, promise, sfx){
      var doc = win.document
        , cover = $('.cover', doc)
        , wang = $('.wang', doc)
        , btn = $('.purchase', doc)
        , headline = $('h1.article-title', doc)
        , demonCover
        , demonWang
        , demonBtn
        , splCover
        , splWang
        , splHeadline
        , splCenter

  function previewMode(bo) {
     util.preview_mode = screen.preview_mode
      = demonWang.preview_mode
      = demonCover.preview_mode = bo
  }



      wait(1000).done(function(){
        demonWang = demon({
          origin: wang[0]
        , window: win
        })
        util.showDemon(demonWang)
        splWang = spotlight({
          target: demonWang.me
        , size : {
            width: 200
          , height: 200
          }
        , offset: {
            top: 20
          , left: 20
          }
        }, doc)
        demonWang.sound(sfx.headBGM, 18720, 40)
        return wait(200 + 2000)

      }).follow().done(function() {
        demonWang.speak('大家好，我是王H，是 facebook 的早期员工，我写的书《打造 facebook》最近在豆瓣阅读上架了，希望大家...', 8000, 9, sfx.w1)
        return wait(7400).done(function() {
          demonWang.rotateEye('200deg', 400)
          demonWang.moveEye(0.6, 200);
        })

      }).follow().done(function() {
        splHeadline = spotlight({
          target: headline
        , size: { width: 350, height: 350}
        , offset: { left: -70, top: 0}
        }, doc)
        return wait(1000 + 2000)

      }).follow().done(function() {
        return demonWang.speak('咦，这书名好像不太对...', 3300, 9, sfx.w2)

      }).follow().done(function() {
        splHeadline.light.addClass('fadeOut')
        demonWang.moveEye(0, 200);
        demonWang.speak('不管了，咳，众所周知，脸书是当今互联网上最吊的公司了...', 5000, 9, sfx.w3)
        return wait(5500).done(function() {
          demonCover = demon({
            origin: cover[0]
          , window: win
          })
          util.showDemon(demonCover)
          splCover = spotlight({
            target: demonCover.me
          , size : {width: 300, height: 300}
          , offset: {top: 20}
          }, doc)
        })

      }).follow().done(function() {
        demonWang.moveEye(0.6, 200);
        demonCover.sound(sfx.c1, 6000, 100)
        return demonCover.speak('放屁，你知道什么？', 2000, 2)

      }).follow().done(function() {
        return demonCover.speak('根本没有什么 facebook！什么脸书！', 3000, 2)

      }).follow().done(function() {
        var fn = arguments.callee;
        demonWang.rotateHand('left', '60deg', 200).done(function(){
          return demonWang.rotateHand('left', '150deg', 200);
        });
        demonWang.rotateHand('right', '-60deg', 200).done(function(){
          return demonWang.rotateHand('right', '-150deg', 200);
        });
        return demonWang.jump(40, [], 405).done(function(){
          if (jump_count++ < 1) {
            return fn();
          } else {
            jump_count = 0;
            demonWang.rotateHand('right', '-30deg', 200);
            demonWang.rotateHand('left', '30deg', 200);
            return wait(200);
          }
        }).follow();

      }).follow().done(function() {
        demonWang.sound(sfx.w4, 5000, 100)
        return demonWang.speak('什么！简直是一派胡言！', 2000, 9)

      }).follow().done(function() {
        return demonWang.speak('我可是看着脸书一路走过来的！', 3000, 9)

      }).follow().done(function() {
        return demonCover.speak('唉，傻孩子...', 3000, 3, sfx.c2)

      }).follow().done(function() {
        return demonCover.speak('既然已经回到了中国，有些事情该让你知道了。', 5000, 3, sfx.c3)

      }).follow().done(function() {
        splCover.light.addClass('fadeOut')
        splWang.light.addClass('fadeOut')
        var win = $(window)
        splCenter = spotlight({
          target: {top: win.height()/2, left: win.width()/2}
        , size: { width: 900, height: 900}
        , offset: { left: -100, top: 60}
        }, doc)
        demonCover.sound(sfx.midBGM, 58000, 20)
        return demonCover.walk([250, 50], 1000, 'easeOut')

      }).follow().done(function() {
        return demonCover.speak('根本就没有脸书。', 3000, 3, sfx.c4)

      }).follow().done(function() {
        return demonCover.speak('其实早在04年，豆瓣就已经统领了大半个互联网。', 5000, 3, sfx.c5)

      }).follow().done(function() {
        return demonWang.walk([10, 50], 300, 'easeOut')
      }).follow().done(function() {
        return demonCover.speak('后来为了避免被反垄断法缠身，驴宗王先一步拆分了公司。', 6000, 3, sfx.c6)
      }).follow().done(function() {
        return demonWang.speak('。。。', 400, 10)
      }).follow().done(function() {
        return demonCover.speak('你所在的所谓 Facebook 正是拆分后的大社区。', 4800, 2, sfx.c7)
      }).follow().done(function() {
        return demonCover.speak('不仅如此...', 1400, 3, sfx.c8)
      }).follow().done(function() {
        return demonWang.speak('别磨叽！', 800, 10, sfx.w5)
      }).follow().done(function() {
        return demonCover.speak('推特其实也不存在，人们所知的推特只是友邻广播的一个分支版本。', 6100, 2, sfx.c9)
      }).follow().done(function() {
        return demonCover.speak('豆瓣FM 后来成了潘多拉。', 2400, 3, sfx.c10)
      }).follow().done(function() {
        return demonCover.speak('最近被封的 github 的正是 Code 项目的延续...', 3500, 2, sfx.c11)
      }).follow().done(function() {
        splCenter.light.addClass('fadeOut')
        return demonCover.speak('这些拆分后的小公司大都成了各自领域的标杆，从而激起了整个互联网的进取之心', 6000, 3, sfx.c12)
      }).follow().done(function() {
        return demonCover.speak('这才是驴宗王的初衷啊... ', 3000, 3, sfx.c13)
      }).follow().done(function() {
        return demonWang.walk([-10, -50], 300, 'easeOut')
      }).follow().done(function() {
        return demonWang.speak('我去！长姿势了！', 2000, 10, sfx.w6)
      }).follow().done(function() {
        return demonWang.speak('还有内幕嘛？好想听！', 2000, 10, sfx.w7)
      }).follow().done(function() {
        demonCover.walk([-250, -50], 600, 'easeOut')
        return wait(500)
      }).follow().done(function() {
        return demonCover.speak('呵呵，就知道你小子会喜欢', 3700, 3, sfx.c14)
      }).follow().done(function() {
        demonWang.walk([-240, -130], 600, 'easeOut')
        return wait(500)
      }).follow().done(function() {
        return demonWang.speak('愿闻其详！', 2000, 10, sfx.w8)
      }).follow().done(function() {
        demonWang.sound(sfx.ending, 14000, 40)
        return demonCover.speak('都在电子特别版后记呐...', 3000, 3, sfx.c15)
      }).follow().done(function() {
        demonBtn = demon({
          origin: btn[0]
        , window: win
        })
        return util.showDemon(demonBtn)
      }).follow().done(function() {
        demonBtn.rotateHand('left', '150deg', 400);
        demonBtn.rotateHand('right', '-150deg', 400);
        return demonBtn.speak('现在戳我购买还送 192k 高速 VPN 哦！', 4100, 3, sfx.btn)
      }).follow().done(function() {
        demonWang.speak('赞！', 1000, 10, sfx.c16)
        return demonCover.speak('赞！', 1000, 3, sfx.w9)
      }).follow().done(function() {
          sfx.ending.pause()
          return wait(500);
      }).follow().done(function() {
          promise.fire()
      })
      return promise
    }
  }
})
