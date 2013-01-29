define([
    'mo/lang',
    'dollar',
    'eventmaster',
    'movie/util',
    'movie/demon'
], function(_, $, event, util, demon){

    var wait = util.wait,
        DESC = "豆瓣前端的故事",
        f2e_list = [
            { name: 'Kejun', id: 'kejun' }
           ,{ name: '龚浩', id: 'gonghao' }
           ,{ name: '小明', id: 'dai' }
           ,{ name: '石头', id: 'mockee' }
           ,{ name: '大光', id: 'cmonday' }
           ,{ name: '杨青', id: 'yangqing' }
           ,{ name: '糖拌西红柿', id: 'migao' }
           ,{ name: 'Robin', id: 'rob' }
           ,{ name: 'Huwei', id: 'huwei' }
           ,{ name: 'Dexter.yy', id: 'yy' }
           ,{ name: '李飞', id: 'lifei' }
           ,{ name: 'Ryan', id: 'ryan' }
           ,{ name: '超哥', id: 'seechaos' }
           ,{ name: '北玉', id: 'beiyuu' }
           ,{ name: '饼饼', id: 'bingbing' }
        ],
        wrapper,
        f2es,
        jump_count = 0;


    function hide(el) {
      el.remove()
    }

    return {
        announce: function(screen){
            return screen('导航链接的诞生', DESC, 1000);
        },
        main: function(win, promise){

            var body = $('body', win.document),
                person_tmpl = '<img width="96" height="96" src="/pics/gavatar/${id}.jpg">${name}'

            function initF2es(){
                var f2es = {};
                f2e_list.forEach(function(item){
                    var person = item.name,
                        node = document.createElement('div');

                    node.className = 'f2e ' + item.id;
                    node = $(node);
                    node.html(person_tmpl.replace('${id}', item.id)
                        .replace('${name}', item.name));

                    body.append(node)
                    node.css({
                        position: 'absolute',
                        top: '0px',
                        left: '-200px'
                    })

                    var demonItem = demon({
                        origin: node[0],
                        className: 'demon-' + item.id,
                        window: win
                    });
                    demonItem.showBody().showHands().showLegs();
                    f2es[item.id] = {
                        name: item.name,
                        dom: node,
                        demon: demonItem
                    };
                })
                return f2es
            }

            f2es = initF2es()

            wrapper = $('.wrapper', win.document)
            var baseLeft = wrapper[0].offsetLeft + 200
              , baseRight = wrapper.width() + baseLeft - 500

            var kejun = f2es.kejun.demon
              , yy = f2es.yy.demon
              , cmonday = f2es.cmonday.demon
              , bingbing = f2es.bingbing.demon
              , gonghao = f2es.gonghao.demon
              , seechaos = f2es.seechaos.demon

            wait(400)
            .done(function(){
                return kejun.walk([ baseLeft, 300 ], 1);
            }).follow()
            .done(function(){
                return kejun.walk([ 10, 200 ], 1500);
            }).follow()
            .done(function(){
                return kejun.speak('要说前端开发是什么， 那得花开两朵，各自一枝', 5000, 3)
            }).follow()
            .done(function(){
                return wait(300)
            }).follow()
            .done(function(){
                return cmonday.walk([ baseLeft + 300, 200 ], 1);
            }).follow().done(function(){
                return cmonday.rotateHand('left', '120deg', 400)
            }).follow().done(function(){
                return cmonday.walk([ 200, 1 ], 1000);
            }).follow().done(function(){
                cmonday.rotateHand('left', '150deg', 400)
                return cmonday.speak('曾经我的座右铭是做一个兼容ie6的男人，现在我的座右铭是做一个兼容手机浏览器的好男人', 5000, 9)
            }).follow().done(function(){
                hide(kejun.me)
                bingbing.rotateHand('left', '-150deg', 400)
                bingbing.rotateHand('right', '-150deg', 400)
                return bingbing.walk([ baseLeft, 400 ] , 1)
            }).follow().done(function(){
                return bingbing.speak(' 不会佛陀绣谱好意思说自己是前端吗？', 3000, 3)
            }).follow().done(function(){
                bingbing.rotateHand('left', '150deg', 400)
                return bingbing.rotateHand('right', '150deg', 400)
            }).follow().done(function(){
                return wait(500)
            }).follow().done(function(){
                hide(cmonday.me)
                return seechaos.walk([baseRight - 50, 200], 1)
            }).follow().done(function(){
                bingbing.walk([-2000, 1], 1000)
                return seechaos.walk([-50, 100], 2000)
            }).follow().done(function(){
                return seechaos.jump(100, 20, 800)
            }).follow().done(function(){
                return seechaos.jump(100, 20, 800)
            }).follow().done(function(){
                seechaos.rotateHand('left', '150deg', 400)
                return seechaos.speak('前端开发是最有资本卖萌的工程师职位。因为在网页源代码里示个爱，搞个浏览器插件求婚什么的，女朋友很容易看到…… ', 3000, 9)
            }).follow().done(function(){
                return seechaos.walk([-2000, 1], 1000)
            }).follow().done(function(){
            }).follow().done(function(){
            })

            return promise;
        },

        reset: function(){}

    };

});
