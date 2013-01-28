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

  function fadeIn(element, duration) {
    var action = choreo().play()
    return action.actor(element, {
      opacity: 1
    }, duration || 1000, 'easeIn')
  }

  function fadeOut(element, duration) {
    var action = choreo().play()
    return action.actor(element, {
      opacity: 0
    }, duration || 1000, 'easeOut')
  }

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
        , imgReception = $('#reception', doc)
        , imgCraftsman = $('#craftsman', doc)

      wait(1000).done(function() {
        util.showDemon(demonRobot)
        return wait(200 + 2000)
      }).follow().done(function() {
        return demonRobot.walk([10, 150], 600, 'easeOut')
      }).follow().done(function() {
        demonRobot.rotateHand('left', '130deg', 300);
        demonRobot.rotateHand('right', '-130deg', 300);
        return demonRobot.speak('大家好，欢迎收看这一期的《这里是豆瓣》，我是阿罗', 3000, 3)
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
        demonRobot.speak('横批：前端人生', 2500, 0)
        return wait(2500+800)
      }).follow().done(function() {
        demonRobot.rotateHand('left', '30deg', 300);
        demonRobot.rotateHand('right', '-130deg', 300);
        return demonRobot.walk([-200, -100], 600, 'easeOut')
      }).follow().done(function() {
        return demonRobot.speak('没错', 1000, 2)
      }).follow().done(function() {
        demonRobot.rotateHand('right', '-110deg', 300);
        return demonRobot.speak('今天我们就来说道说道', 1500, 3)
      }).follow().done(function() {
        demonRobot.rotateHand('right', '-130deg', 300);
        demonRobot.speak('前端！', 3000, 2)
        return wait(3000)
      }).follow().done(function() {
        demonRobot.rotateHand('left', '30deg', 300);
        demonRobot.rotateHand('right', '-30deg', 300);
        return demonRobot.walk([200, 100], 600, 'easeOut')
      }).follow().done(function() {
        demonRobot.rotateHand('right', '-130deg', 300);
        demonRobot.speak('所谓前端，就是指前端开发', 2500, 0)
        return wait(2500+800)
      }).follow().done(function() {
        demonRobot.rotateHand('right', '-100deg', 200);
        return demonRobot.walk([-160, -10], 600, 'easeOut')
      }).follow().done(function() {
        demonRobot.rotateHand('right', '-30deg', 200);
        return fadeIn(imgDiors[0])
      }).follow().done(function() {
        demonRobot.rotateHand('right', '-90deg', 200);
        return demonRobot.speak('做前端的人自然就是前端工程师了', 2500, 0)
      }).follow().done(function() {
        imgDiors.hide()
        return wait(300)
      }).follow().done(function() {
        demonRobot.rotateHand('left', '-90deg', 200)
        demonRobot.rotateHand('right', '-50deg', 200)
        return demonRobot.speak('虽然也有人管这行儿叫前台开发', 2500, 3)
      }).follow().done(function() {
        demonRobot.rotateHand('left', '30deg', 200)
        demonRobot.rotateHand('right', '-30deg', 200)
        return demonRobot.walk([200, -150], 1000, 'easeOut')
      }).follow().done(function() {
        return fadeIn(imgReception[0])
      }).follow().done(function() {
        demonRobot.rotateLeg('left', '90deg', 300)
        demonRobot.rotateLeg('right', '-90deg', 300)
        demonRobot.speak('但此前台非彼前台...', 2500, 6)
        return wait(2500+500)
      }).follow().done(function() {
        demonRobot.rotateHand('left', '70deg', 300)
        demonRobot.rotateHand('right', '-70deg', 300)
        demonRobot.rotateLeg('left', '0deg', 300)
        demonRobot.rotateLeg('right', '0deg', 300)
        demonRobot.rotateEye('90deg', 0)
        demonRobot.moveEye(0.6, 200)
        return demonRobot.walk([45, 240], 1000, 'easeOut')
      }).follow().done(function() {
        return demonRobot.speak('咪咪～乖～', 1500, 0)
      }).follow().done(function() {
        return fadeOut(imgReception[0])
      }).follow().done(function() {
        imgReception.hide()
        demonRobot.rotateEye('0deg', 0)
        demonRobot.moveEye(0, 200)
        return demonRobot.walk([130, -245], 1000, 'easeOut')
      }).follow().done(function() {
        return demonRobot.rotateHand('right', '-180deg', 300)
      }).follow().done(function() {
        return demonRobot.speak('其实前端与其他码农的工作无异，需要将需求人肉转化为机器语言。', 5000, 7)
      }).follow().done(function() {
        return demonRobot.speak('区别在于，前端代码会蜕变为优雅易用的界面展示在用户面前。', 5000, 7)
      }).follow().done(function() {
        demonRobot.rotateHand('left', '180deg', 300)
        demonRobot.rotateHand('right', '-30deg', 300)
        return demonRobot.walk([-80, 0], 1000, 'easeOut')
      }).follow().done(function() {
        return demonRobot.speak('早在驴宗年间，并没有多少人提及前端开发这个词儿。', 4000, 6)
      }).follow().done(function() {
        return demonRobot.speak('大家所熟知的更多是叫做网页制作，特平易近人一词儿，一听就是个民间手艺活儿。', 6000, 6)
      }).follow().done(function() {
        return fadeIn(imgCraftsman[0])
      })

      return promise
    }
  }
})
