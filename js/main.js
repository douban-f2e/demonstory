
require.config({
    baseUrl: 'js/mod/',
    distUrl: 'dist/js/mod/',
    aliases: {
        movie: '../movie/'
    }
});

define('jquery', ['dollar'], function($){
    return $;
});

define('buzz-src', 'buzz.js');
define('buzz', ['buzz-src'], function(){
    return window.buzz;
});

define('chapter1', '../chapter/intro.js');
define('chapter2', '../chapter/guess.js');
define('chapter3', '../chapter/chaos.js');
define('chapter4', '../chapter/facebook.js');
define('chapter5', '../chapter/f2e.js');
define('chapter6', '../chapter/end.js');

require([
    'mo/lang',
    'dollar',
    'mo/key',
    'mo/easing',
    'choreo',
    'eventmaster',
    'movie/director',
    'mo/domready'
], function(_, $, key, easingLib, choreo, event, director){

    choreo.config({
        easing: easingLib
    });

    var story = [{
        stage: 'pages/index.html',
        style: '../dist/css/chapter/intro.css',
        script: 'chapter1'
    }, {
        stage: 'pages/update.html',
        style: '../dist/css/chapter/guess.css',
        script: 'chapter2'
    }, {
        stage: 'pages/update_old1.html',
        script: 'chapter3',
        style: '../dist/css/chapter/chaos.css'
    }, {
        stage: 'pages/facebook.html',
        style: '../dist/css/chapter/facebook.css',
        script: 'chapter4'
    }, {
        stage: 'pages/f2e.html',
        script: 'chapter5',
        style: '../dist/css/chapter/f2e.css'
    }, {
        stage: 'pages/end/guess.html',
        script: 'chapter6'
    }];

    var observer = event();

    director.init({
        observer: observer,
        story: story,
        imageRoot: 'pics/',
        mediaRoot: '../media/',
        stageStyle: '../dist/css/stage.css'
    });

    key().up(['space', 'right'], function(){
        director.next();
    });

    observer.bind('end', function(){
        setTimeout(function(){
            director.next();
        }, 500);
    });

    director.next();

});
