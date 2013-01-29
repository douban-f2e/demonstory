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
            { name: 'Kejun', id: 'kejun' },
            { name: 'Dexter.yy', id: 'yy' }
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
                        left: '0px'
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
            var baseLeft = wrapper[0].offsetLeft

            var kejun = f2es.kejun.demon
              , yy = f2es.yy.demon;
            wait(400).done(function(){
                return kejun.walk([ baseLeft, 200 ], 3000);
            }).follow().done(function(){
                return kejun.speak('要说前端开发是什么， 那得花开两朵，各自一枝', 5000, 3)
            }).follow().done(function(){
                return wait(300)
            }).follow().done(function(){
                yy.speak('要说前端开发是什么， 那得花开两朵，各自一枝', 5000, 3)
            })
            return promise;
        },

        reset: function(){}

    };

});
