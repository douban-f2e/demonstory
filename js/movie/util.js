
define([
    'mo/lang',
    'dollar',
    'moui/stick',
    'eventmaster'
], function(_, $, stick, event){

    var util = {};

    util.wait = function(fn, duration){
        if (_.isFunction(fn)) {
            fn();
        } else {
            duration = fn;
        }
        var promise = new event.Promise();
        setTimeout(function(){
            promise.resolve();
        }, duration);
        return promise;
    };

    util.showDemon = function(demon){
        return util.wait(function(){
            demon.showBody();
        }, 400).done(function(){
            return util.wait(function(){
                demon.showEyes();
            }, 400);
        }).follow().done(function(){
            return util.wait(function(){
                demon.showLegs();
            }, 400);
        }).follow().done(function(){
            return util.wait(function(){
                demon.showHands();
            }, 400);
        }).follow();
    };

    return util;

});
