
define([
    'mo/lang',
    'dollar',
    'eventmaster',
    './demon',
    'moui/bubble'
], function(_, $, event, demon, bubble){

    var PREVIEW_DURATION = 10;

    var util = {

        demon: demon,
        bubble: bubble

    };

    util.wait = function(fn, duration){
        if (_.isFunction(fn)) {
            fn();
        } else {
            duration = fn;
        }
        if (util.preview_mode) {
            duration = PREVIEW_DURATION;
        }
        var promise = new event.Promise();
        setTimeout(function(){
            promise.resolve();
        }, duration);
        return promise;
    };

    util.showDemon = function(demon, duration){
        duration = duration || 400;
        if (util.preview_mode) {
            duration = PREVIEW_DURATION;
        }
        return util.wait(function(){
            demon.showBody();
        }, duration).done(function(){
            return util.wait(function(){
                demon.showEyes();
            }, duration);
        }).follow().done(function(){
            return util.wait(function(){
                demon.showLegs();
            }, duration);
        }).follow().done(function(){
            return util.wait(function(){
                demon.showHands();
            }, duration);
        }).follow();
    };

    return util;

});
