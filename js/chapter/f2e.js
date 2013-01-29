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

            var kejun = f2es.kejun.demon
              , yy = f2es.yy.demon;
            wait(400)
            .done(function(){
                return kejun.walk([ baseLeft, 200 ], 1);
            }).follow()
            .done(function(){
                return kejun.walk([ 200, 200 ], 3000);
            }).follow()
            .done(function(){
                return kejun.speak('要说前端开发是什么， 那得花开两朵，各自一枝', 5000, 3)
            }).follow()
            .done(function(){
                return wait(300)
            }).follow()
            .done(function(){
                return yy.walk([ baseLeft, 200 ], 1);
            }).follow()
            .done(function(){
                return yy.walk([ 400, 0 ], 3000);
            }).follow()
            .done(function(){
                yy.speak('原闻其详', 5000, 9)
            })
            return promise;
        },

        reset: function(){}

    };

});
