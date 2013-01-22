
define([
    'mo/lang',
    'dollar',
    'eventmaster',
    'movie/util',
    'movie/demon'
], function(_, $, event, util, demon){

    var wait = util.wait,

        DESC = "A long time ago, in a galaxy far, far away...<br>It is a period of civil war. Rebel spaceships, striking from a hidden base, have won their first victory against the evil Galactic Empire. ", 

        jump_count = 0;

    return {

        announce: function(screen){
            return screen('Only for testing', DESC, 1000);
        },

        main: function(win, promise){

        },

        reset: function(){
        
        }

    };

    

});

