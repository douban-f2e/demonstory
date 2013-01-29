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
    , sfx = {}

  for (var i = 1; i < 25; i++) {
    sfx['r' + i] = 'f2e/r' + i + '.m4a'
  }

  sfx.opening =  'f2e/opening.m4a'
  sfx.bgm = 'f2e/bg_pleasures.mp3'

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
    sfx: sfx,

    announce: function(screen, sfx){
      return screen('《这里是豆瓣》之话说前端', DESC, 3000, sfx.opening)
    },

    main: function(win, promise, sfx){
      var doc = win.document
        , demonRobot = demon({
            origin: $('#robot', doc)[0]
          , window: win
          })
        , imgDiors = $('#diors', doc)
        , imgReception = $('#reception', doc)
        , imgCraftsman = $('#craftsman', doc)
        , imgCtba = $('#ctba', doc)
        , imgCode = $('#code', doc)
        , imgAlphatown = $('#alphatown', doc)
        , vote = $('#vote', doc)

      demonRobot.sound(sfx.bgm, 200000, 80)

      wait(1000).done(function() {
        util.showDemon(demonRobot)
        return wait(200 + 2000)
      }).follow().done(function() {
        return demonRobot.walk([10, 150], 600, 'easeOut')
      }).follow().done(function() {
        demonRobot.rotateHand('left', '130deg', 300)
        demonRobot.rotateHand('right', '-130deg', 300)
        return demonRobot.speak(
          '大家好，欢迎收看这一期的《这里是豆瓣》，我是阿罗'
        , 4000, 3, sfx.r1)
      }).follow().done(function() {
        demonRobot.rotateHand('left', '30deg', 300)
        demonRobot.rotateHand('right', '-30deg', 300)
        demonRobot.speak('有这么一副对联不知各位听过没有', 3000, 3, sfx.r2)
        return wait(3000 + 200)
      }).follow().done(function() {
        return demonRobot.walk([500, 10], 600, 'easeOut')
      }).follow().done(function() {
        demonRobot.rotateHand('left', '130deg', 300)
        demonRobot.rotateHand('right', '130deg', 300)
        demonRobot.speak(
          '上联是：为需求而生，为用户而死，为浏览器奋斗一辈子！'
        , 6000, 10, sfx.r3)
        return wait(6000 + 200)
      }).follow().done(function() {
        demonRobot.rotateHand('left', '30deg', 300)
        demonRobot.rotateHand('right', '-30deg', 300)
        return demonRobot.walk([-500, 10], 600, 'easeOut')
      }).follow().done(function() {
        demonRobot.speak(
          '下联：吃 CSS 亏，上 JS 的当，最后死在兼容上！'
        , 6000, 3, sfx.r4)
        demonRobot.rotateHand('left', '-130deg', 300)
        demonRobot.rotateHand('right', '-130deg', 300)
        return wait(6000 + 200)
      }).follow().done(function() {
        demonRobot.rotateHand('left', '30deg', 300)
        demonRobot.rotateHand('right', '-30deg', 300)
        return demonRobot.walk([200, 100], 600, 'easeOut')
      }).follow().done(function() {
        demonRobot.rotateHand('left', '160deg', 300)
        demonRobot.rotateHand('right', '-160deg', 300)
        demonRobot.speak('横批：前端人生', 2500, 0, sfx.r5)
        return wait(3000 + 200)
      }).follow().done(function() {
        demonRobot.rotateHand('left', '30deg', 300)
        demonRobot.rotateHand('right', '-130deg', 300)
        return demonRobot.walk([-200, -100], 600, 'easeOut')
      }).follow().done(function() {
        return demonRobot.speak('没错', 800, 2, sfx.r6)
      }).follow().done(function() {
        demonRobot.rotateHand('right', '-80deg', 150)
        return demonRobot.speak('今天我们就来说道说道', 2000, 3, sfx.r7)
      }).follow().done(function() {
        demonRobot.rotateHand('right', '-130deg', 150)
        demonRobot.speak('前端！', 2000, 2, sfx.r8)
        return wait(2000 + 200)
      }).follow().done(function() {
        demonRobot.rotateHand('left', '30deg', 300)
        demonRobot.rotateHand('right', '-30deg', 300)
        return demonRobot.walk([200, 100], 600, 'easeOut')
      }).follow().done(function() {
        demonRobot.rotateHand('right', '-130deg', 300)
        demonRobot.speak('所谓前端，就是指前端开发', 3000, 0, sfx.r9)
        return wait(3000 + 200)
      }).follow().done(function() {
        demonRobot.rotateHand('right', '-100deg', 200)
        return demonRobot.walk([-160, -10], 600, 'easeOut')
      }).follow().done(function() {
        demonRobot.rotateHand('right', '-30deg', 200)
        return fadeIn(imgDiors[0])
      }).follow().done(function() {
        demonRobot.rotateHand('right', '-90deg', 200)
        return demonRobot.speak('做前端的人自然就是前端工程师了', 3000, 0, sfx.r10)
      }).follow().done(function() {
        imgDiors.hide()
        return wait(200)
      }).follow().done(function() {
        demonRobot.rotateHand('left', '-90deg', 200)
        demonRobot.rotateHand('right', '-50deg', 200)
        return demonRobot.speak('虽然也有人管这行儿叫前台开发', 3000, 3, sfx.r11)
      }).follow().done(function() {
        demonRobot.rotateHand('left', '30deg', 200)
        demonRobot.rotateHand('right', '-30deg', 200)
        return demonRobot.walk([200, -150], 500, 'easeOut')
      }).follow().done(function() {
        return fadeIn(imgReception[0])
      }).follow().done(function() {
        demonRobot.rotateLeg('left', '90deg', 300)
        demonRobot.rotateLeg('right', '-90deg', 300)
        demonRobot.speak('但此前台非彼前台...', 3000, 6, sfx.r12)
        return wait(3000 + 200)
      }).follow().done(function() {
        demonRobot.rotateHand('left', '70deg', 300)
        demonRobot.rotateHand('right', '-70deg', 300)
        demonRobot.rotateLeg('left', '0deg', 300)
        demonRobot.rotateLeg('right', '0deg', 300)
        demonRobot.rotateEye('90deg', 0)
        demonRobot.moveEye(0.6, 200)
        return demonRobot.walk([45, 240], 300, 'easeOut')
      }).follow().done(function() {
        return demonRobot.speak('喵喵～乖～', 1000, 0, sfx.r13)
      }).follow().done(function() {
        return fadeOut(imgReception[0])
      }).follow().done(function() {
        imgReception.hide()
        demonRobot.rotateEye('0deg', 0)
        demonRobot.moveEye(0, 200)
        return demonRobot.walk([130, -245], 600, 'easeOut')
      }).follow().done(function() {
        return demonRobot.rotateHand('right', '-180deg', 300)
      }).follow().done(function() {
        fadeIn(imgCode[0])
        return demonRobot.speak(
          '其实前端与其他码农的基本工作无异，都是将需求人肉变成机器语言。'
        , 6000, 7, sfx.r14)
      }).follow().done(function() {
        return fadeOut(imgCode[0])
      }).follow().done(function() {
        imgCode.hide()
        fadeIn(imgAlphatown[0])
        return demonRobot.speak(
          '区别在于，前端代码会蜕变为优雅易用的界面服务于最终用户。'
        , 6000, 7, sfx.r15)
      }).follow().done(function() {
        demonRobot.rotateHand('left', '180deg', 300)
        demonRobot.rotateHand('right', '-30deg', 300)
        return demonRobot.walk([-80, 0], 1000, 'easeOut')
      }).follow().done(function() {
        imgAlphatown.hide()
        return demonRobot.speak(
          '不过，早在驴宗年间，并没有多少人提及前端开发这个词儿。'
        , 5000, 6, sfx.r16)
      }).follow().done(function() {
        return demonRobot.speak(
          '更为大家所熟知的名字是网页制作，平易近人，一听就是个民间手艺活儿。'
        , 7000, 6, sfx.r17)
      }).follow().done(function() {
        return demonRobot.walk([-220, 0], 1000, 'easeOut')
      }).follow().done(function() {
        return fadeIn(imgCraftsman[0])
      }).follow().done(function() {
        return wait(1000)
      }).follow().done(function() {
        return demonRobot.walk([0, 220], 100, 'easeOut')
      }).follow().done(function() {
        demonRobot.rotateHand('left', '120deg', 300)
        demonRobot.rotateHand('right', '-100deg', 300)
        demonRobot.rotateLeg('left', '90deg', 200)
        demonRobot.rotateLeg('right', '-90deg', 200)
        demonRobot.moveEye(0.6, 200)
        return wait(1000)
      }).follow().done(function() {
        return demonRobot.speak('大叔～您幸福吗？', 2000, 0, sfx.r18)
      }).follow().done(function() {
        var action = choreo().play()
        return action.actor(imgCraftsman[0], {
          'margin-left': '2000px'
        }, 500, 'easeOut')
      }).follow().done(function() {
        return wait(500)
      }).follow().done(function() {
        imgCraftsman.hide()
        return wait(1000)
      }).follow().done(function() {
        return demonRobot.squintEye(1500)
      }).follow().done(function() {
        demonRobot.rotateHand('left', '80deg', 300)
        demonRobot.rotateHand('right', '-80deg', 300)
        return demonRobot.walk([-150, 0], 500, 'easeOut')
      }).follow().done(function() {
        return wait(500 + 600)
      }).follow().done(function() {
        return fadeIn(imgCtba[0])
      }).follow().done(function() {
        return demonRobot.speak(
          '不过您可别小瞧了这些手艺人，他们中间很多都曾是身经百战风光一时的个人站长。'
        , 7000, 2, sfx.r19)
      }).follow().done(function() {
        demonRobot.rotateHand('left', '40deg', 300)
        demonRobot.rotateHand('right', '-50deg', 300)
        demonRobot.rotateLeg('left', '0deg', 300)
        demonRobot.rotateLeg('right', '0deg', 300)
        return demonRobot.walk([50, -150], 500, 'easeOut')
      }).follow().done(function() {
        return fadeOut(imgCtba[0])
      }).follow().done(function() {
        return wait(500)
      }).follow().done(function() {
        return demonRobot.speak(
          '据豆瓣前端小站的不完全统计，48% 的前端工程师都曾有过个人站长经历。'
          , 7000, 2, sfx.r20)
      }).follow().done(function() {
        imgCtba.hide()
        return fadeIn(vote[0])
      }).follow().done(function() {
        var action = choreo().play()
        return action.actor(vote[0], {
          'margin-top': '50px'
        }, 600, 'easeOut')
      }).follow().done(function() {
        return demonRobot.walk([360, 50], 500, 'easeOut')
      }).follow().done(function() {
        $('.hl', doc).css({
          background: 'green'
        , color: 'white'
        })
        return wait(300)
      }).follow().done(function() {
        return demonRobot.speak('惊人的数字', 1000, 0, sfx.r21)
      }).follow().done(function() {
        return wait(1000)
      }).follow().done(function() {
        var action = choreo().play()
        return action.actor(vote[0], {
          'margin-top': '2000px'
        }, 800, 'easeOut')
      }).follow().done(function() {
        return wait(800)
      }).follow().done(function() {
        vote.hide()
        return demonRobot.walk([-300, -50], 500, 'easeOut')
      }).follow().done(function() {
        return demonRobot.speak(
          '随着网络的发展技术的进步，网页制作也被赋予了更多的职责，那些卡在正统设计与开发之间没资格进入教科书却又必不可少的技能被一股脑儿丢了进来。'
        , 13000, 3, sfx.r22)
      }).follow().done(function() {
        return demonRobot.speak(
          '如此重任也只有曾经的站长可以担负，网页制作变成了前懂交互设计用户体验后做业务开发性能优化的杂家。'
        , 10000, 2, sfx.r23)
      }).follow().done(function() {
        return demonRobot.speak(
          '显然，网页制作已无法准确描述这份庞杂的差事，前端开发一词由此诞生。'
        , 8000, 3, sfx.r24)
      })

      return promise
    }
  }
})
