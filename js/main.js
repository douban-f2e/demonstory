
require.config({
    baseUrl: 'js/mod/',
    aliases: {
        movie: '../movie/'
    }
});

define('jquery', ['dollar'], function($){
    return $;
});

require([
    'mo/lang',
    'dollar',
    'mo/key',
    'mo/easing',
    'choreo',
    'movie/director',
    'mo/domready'
], function(_, $, key, easingLib, choreo, director){

    choreo.config({
        easing: easingLib
    });

    var story = [{
        stage: 'pages/index.html', 
        style: '../dist/css/chapter/1.css',
        script: '../chapter/1'
    }, {
        stage: 'pages/update.html', 
        style: '../dist/css/chapter/2.css',
        script: '../chapter/2'
    }];

    director.init({
        story: story,
        stageStyle: '../dist/css/stage.css'
    });

    key().up(['space', 'right'], function(){
        director.next();
    });

});
