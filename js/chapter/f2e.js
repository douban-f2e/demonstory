define([
  'mo/lang'
, 'dollar'
, 'choreo'
, 'eventmaster'
, 'movie/util'
, 'movie/demon'
], function(_, $, choreo, event, util, demon){

  var wait = util.wait
    , DESC = ""
    , jump_count = 0
    , action = choreo().play()

  return {
    announce: function(screen){
      return screen('《这里是豆瓣》之话说前端', DESC, 1000)
    },

    main: function(win, promise){
      var doc = win.document
        , demonRobot = demon({
            origin: $('#robot', doc)[0]
          , window: win
          })
        , imgDiors = $('#diors', doc)

      wait(1000).done(function() {
        util.showDemon(demonRobot)
        return wait(200 + 2000)
      }).follow().done(function() {
        return demonRobot.walk([10, 150], 600, 'easeOut')
      }).follow().done(function() {
        demonRobot.rotateHand('left', '130deg', 300);
        demonRobot.rotateHand('right', '-130deg', 300);
        return demonRobot.speak('大家好，欢迎收看这一期的《这里是豆瓣》', 2500, 3)
      }).follow().done(function() {
        demonRobot.rotateHand('left', '30deg', 300);
        demonRobot.rotateHand('right', '-30deg', 300);
        demonRobot.speak('有这么个对联不知各位听过没有', 2500, 3)
        return wait(2000+800)
      }).follow().done(function() {
        return demonRobot.walk([500, 10], 600, 'easeOut')
      }).follow().done(function() {
        demonRobot.speak('上联是：为需求而生，为用户而死，为浏览器奋斗一辈子！', 4000, 10)
        demonRobot.rotateHand('left', '130deg', 300);
        demonRobot.rotateHand('right', '130deg', 300);
        return wait(4000+100)
      }).follow().done(function() {
        demonRobot.rotateHand('left', '30deg', 300);
        demonRobot.rotateHand('right', '-30deg', 300);
        return demonRobot.walk([-500, 10], 600, 'easeOut')
      }).follow().done(function() {
        demonRobot.speak('下联：吃 CSS 亏，上 JS 的当，最后死在兼容上！', 4000, 3)
        demonRobot.rotateHand('left', '-130deg', 300);
        demonRobot.rotateHand('right', '-130deg', 300);
        return wait(4000)
      }).follow().done(function() {
        demonRobot.rotateHand('left', '30deg', 300);
        demonRobot.rotateHand('right', '-30deg', 300);
        return demonRobot.walk([200, 100], 600, 'easeOut')
      }).follow().done(function() {
        demonRobot.rotateHand('left', '160deg', 300);
        demonRobot.rotateHand('right', '-160deg', 300);
        demonRobot.speak('横批：前端人生', 2000, 0)
        return wait(2000+800)
      }).follow().done(function() {
        demonRobot.rotateHand('left', '30deg', 300);
        demonRobot.rotateHand('right', '-130deg', 300);
        return demonRobot.walk([-200, -100], 600, 'easeOut')
      }).follow().done(function() {
        return demonRobot.speak('没错', 1000, 3)
      }).follow().done(function() {
        return demonRobot.speak('今天我们就来说道说道', 1500, 3)
      }).follow().done(function() {
        demonRobot.speak('前端！', 3000, 3)
        return wait(3000)
      }).follow().done(function() {
        demonRobot.rotateHand('left', '30deg', 300);
        demonRobot.rotateHand('right', '-30deg', 300);
        return demonRobot.walk([200, 100], 600, 'easeOut')
      }).follow().done(function() {
        demonRobot.rotateHand('right', '-130deg', 300);
        demonRobot.speak('所谓前端，就是指前端开发', 2500, 0)
        return wait(2500+500)
      }).follow().done(function() {
        demonRobot.rotateHand('right', '-100deg', 200);
        return demonRobot.walk([-210, -10], 600, 'easeOut')
      }).follow().done(function() {
        return action.actor(imgDiors[0], {
          opacity: 1
        }, 1000, 'easeIn')
      }).follow().done(function() {
        return demonRobot.speak('做前端的人自然就是前端工程师了', 2500, 0)
      }).follow().done(function() {
        imgDiors.hide()
        return wait(300)
      }).follow().done(function() {
        return demonRobot.speak('虽然也有人管这行儿叫前台开发', 2500, 3)
      })

      /*
      var doc = win.document
        , cover = $('.cover', doc)
        , wang = $('.wang', doc)
        , btn = $('.purchase', doc)
        , demonCover = demon({
            origin: cover[0]
          , window: win
          })
        , demonWang
        , demonBtn

      wait(1000).done(function() {
        util.showDemon(demonCover)
        return wait(200 + 2000)
      }).follow().done(function() {
        return demonCover.speak('大家好，我是科幻作品“打造脸书”', 2000, 2)
      }).follow().done(function() {
        demonCover.speak('各位可能有所不知，大洋彼岸的 Facebook 曾是豆瓣的一部分...', 3000, 3)
        return wait(600)
      }).follow().done(function() {
        demonWang = demon({
          origin: wang[0]
        , window: win
        })
        return util.showDemon(demonWang)
      }).follow().done(function() {
        demonWang.rotateEye('200deg', 400)
        demonWang.moveEye(0.6, 200);
        return demonWang.speak('简直一派胡言！', 1500, 9)
      }).follow().done(function() {
        return demonWang.speak('我可是看着脸书一路走过来的！', 2000, 10)
      }).follow().done(function() {
        return demonCover.walk([250, 50], 1000, 'easeOut')
      }).follow().done(function() {
        return demonCover.speak('傻孩子，你先听我说', 2000, 3)
      }).follow().done(function() {
        demonCover.speak('其实早在04年，豆瓣就已经统领了大半个互联网。', 3000, 3)
        return wait(4000 + 300)
      }).follow().done(function() {
        return demonWang.walk([10, 50], 300, 'easeOut')
      }).follow().done(function() {
        return demonCover.speak('后来为了避免被反垄断法缠身，驴宗王先一步拆分了公司。', 4000, 3)
      }).follow().done(function() {
        return demonWang.speak('。。。', 1000, 10)
      }).follow().done(function() {
        return demonCover.speak('你所在的所谓 Facebook 正是拆分后的大社区。', 3000, 2)
      }).follow().done(function() {
        return demonCover.speak('当然还有你不知道的...', 2000, 3)
      }).follow().done(function() {
        return demonWang.speak('别磨叽！', 1000, 10)
      }).follow().done(function() {
        return demonCover.speak('twitter 其实是友邻广播。', 2000, 2)
      }).follow().done(function() {
        return demonCover.speak('豆瓣FM 后来成了潘多拉。', 2000, 3)
      }).follow().done(function() {
        return demonCover.speak('最近被封的 github 的正是 Code 项目的延续...', 3000, 2)
      }).follow().done(function() {
        return demonCover.speak('这些拆分后的小公司大都成了各自领域的标杆，从而激起了整个互联网的进取之心', 5000, 3)
      }).follow().done(function() {
        return demonCover.speak('这才是驴宗王的初衷啊... ', 3000, 3)
      }).follow().done(function() {
        return demonWang.walk([-10, -50], 300, 'easeOut')
      }).follow().done(function() {
        return demonWang.speak('我去！长姿势了！', 2000, 10)
      }).follow().done(function() {
        return demonWang.speak('还有内幕嘛？好想听！', 2000, 10)
      }).follow().done(function() {
        demonCover.walk([-250, -50], 600, 'easeOut')
        return wait(500)
      }).follow().done(function() {
        return demonCover.speak('呵呵，就知道你小子会喜欢', 2000, 3)
      }).follow().done(function() {
        demonWang.walk([-250, -50], 600, 'easeOut')
        return wait(500)
      }).follow().done(function() {
        return demonWang.speak('愿闻其详！', 1500, 10)
      }).follow().done(function() {
        return demonCover.speak('都在电子特别版后记呐...', 2000, 3)
      }).follow().done(function() {
        demonBtn = demon({
          origin: btn[0]
        , window: win
        })
        return util.showDemon(demonBtn)
      }).follow().done(function() {
        demonBtn.rotateHand('left', '150deg', 400);
        demonBtn.rotateHand('right', '-150deg', 400);
        return demonBtn.speak('现在戳我购买还送 192k 高速 VPN 哦！', 2500, 3)
      }).follow().done(function() {
        demonWang.speak('赞！', 1000, 10)
        return demonCover.speak('赞！', 1000, 3)
      })
      */
      return promise
    }
  }
})
