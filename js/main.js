
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
    'eventmaster',
    'movie/director',
    'mo/domready'
], function(_, $, key, easingLib, choreo, event, director){

    choreo.config({
        easing: easingLib
    });

var story = [{
        stage: 'pages/f2e.html',
        script: '../chapter/f2e.js',
        style: '../dist/css/chapter/f2e.css'
    }, {
        stage: 'pages/index.html',
        style: '../dist/css/chapter/intro.css',
        script: '../chapter/intro'
    }, {
        stage: 'pages/update.html',
        style: '../dist/css/chapter/guess.css',
        script: '../chapter/guess'
    }, {
        stage: 'pages/facebook.html',
        script: '../chapter/facebook'
    }, {
        stage: 'pages/update_old1.html',
        script: '../chapter/chaos.js',
        style: '../dist/css/chapter/chaos.css'
    }, {
        stage: 'pages/f2e.html',
        script: '../chapter/f2e.js',
        style: '../dist/css/chapter/f2e.css'
    }, {
        stage: 'pages/end/guess.html',
        script: '../chapter/end'
    }/*, {
        stage: 'pages/index.html',
        style: '../dist/css/chapter/sample.css',
        script: '../chapter/sample'
    }*/];

    var observer = event();

    director.init({
        observer: observer,
        story: story,
        stageStyle: '../dist/css/stage.css'
    });

    key().up(['space', 'right'], function(){
        director.next();
    });

    //observer.bind('end', function(){
        //director.next();
    //});

});
