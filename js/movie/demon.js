
define([
    'mo/lang',
    'dollar',
    'eventmaster',
    'choreo',
    'buzz',
    'moui/bubble'
], function(_, $, event, choreo, buzz, bubble){

    var PREVIEW_DURATION = 10;

    function Demon(opt){
        var win = this.window = opt.window || window,
            body = $(win.document.body),
            origin = this.origin = $(opt.origin);
        this.preview_mode = false;
        this._resolved_promise = event().resolve();
        this.eyeLeft = $('<span class="eye eye-left"><span></span></span>');
        this.eyeRight = $('<span class="eye eye-right"><span></span></span>');
        this.handLeft = $('<span class="hand hand-left"></span>');
        this.handRight = $('<span class="hand hand-right"></span>');
        this.legLeft = $('<span class="leg leg-left"></span>');
        this.legRight = $('<span class="leg leg-right"></span>');
        this.me = origin.clone().css({
            top: origin.offset().top + 'px',
            left: origin.offset().left + 'px'
        }).addClass('demon')
            .append(this.eyeLeft)
            .append(this.eyeRight)
            .append(this.handLeft)
            .append(this.handRight)
            .append(this.legLeft)
            .append(this.legRight)
            .appendTo(body);
        if (opt.className) {
            this.me.addClass(opt.className);
        }
        origin.css({
            visibility: 'hidden'
        });
    }

    Demon.prototype = {
    
        showBody: function(){
            this.me.addClass('waken');
            return this;
        },

        showEyes: function(){
            this.me.addClass('has-eyes');
            return this;
        },

        showHands: function(){
            this.me.addClass('has-hands');
            return this;
        },

        showLegs: function(){
            this.me.addClass('has-legs');
            return this;
        },

        rotateEye: function(deg, duration, easing){
            if (this.preview_mode) {
                duration = PREVIEW_DURATION;
            }
            var action = choreo().play(),
                v = 'rotate(' + deg + ')';
            action.actor(this.eyeLeft[0], {
                transform: v
            }, duration, easing);
            action.actor(this.eyeRight[0], {
                transform: v
            }, duration, easing);
            return action.follow();
        },

        moveEye: function(offset, duration, easing){
            if (this.preview_mode) {
                duration = PREVIEW_DURATION;
            }
            this.normalEye();
            var action = choreo().play(),
                left_pupil = this.eyeLeft.find('span')[0],
                max = this.eyeLeft[0].scrollHeight/2 - left_pupil.scrollHeight/2,
                v = 'translateX(' + offset * max + 'px)';
            action.actor(left_pupil, {
                transform: v
            }, duration, easing);
            action.actor(this.eyeRight.find('span')[0], {
                transform: v
            }, duration, easing);
            return action.follow();
        },

        squintEye: function(duration){
            if (this.preview_mode) {
                duration = PREVIEW_DURATION;
            }
            var self = this,
                promise = new event.Promise();
            this.rotateEye('0');
            this.moveEye(0);
            this.eyeLeft.concat(this.eyeRight).addClass('squint');
            setTimeout(function(){
                if (duration) {
                    self.normalEye();
                }
                promise.fire();
            }, duration || 0);
            return promise;
        },

        normalEye: function(){
            this.eyeLeft.concat(this.eyeRight).removeClass('squint');
            return this;
        }, 

        rotateHand: function(side, deg, duration, easing){
            if (this.preview_mode) {
                duration = PREVIEW_DURATION;
            }
            var action = choreo().play(),
                v = 'rotate(' + deg + ')';
            action.actor(this['hand' + capitalize(side)][0], {
                transform: v
            }, duration, easing);
            return action.follow();
        },

        waveHand: function(side, times, gap, deg, duration) {
            if (this.preview_mode) {
                duration = PREVIEW_DURATION;
            }
            side = side || 'left';
            times = times || 6;
            duration = duration || 400;
            gap = gap || 30;
            deg = deg || 150;

            var self = this;
            var ended = false;
            function doRotate() {
                if (!times) return;
                var d = deg + gap;
                if (ended) {
                    d = 30;
                    duration = 200;
                } else if (times == 1) {
                    ended = true;
                    times += 1;
                }
                self.rotateHand(side, d + 'deg', duration).done(function() {
                    times--;
                    gap = - gap;
                    doRotate();
                });
            }
            return doRotate();
        },

        rotateLeg: function(side, deg, duration, easing){
            if (this.preview_mode) {
                duration = PREVIEW_DURATION;
            }
            var action = choreo().play(),
                v = 'rotate(' + deg + ')';
            action.actor(this['leg' + capitalize(side)][0], {
                transform: v
            }, duration, easing);
            return action.follow();
        },

        jump: function(height, offsets, duration, easing){
            if (this.preview_mode) {
                duration = PREVIEW_DURATION;
            }
            var action = choreo(),
                action_drop = choreo(),
                me = this.me,
                current = parseFloat(me.css('top')) || 0;
            this.move(offsets || [], duration, easing);
            action.actor(me[0], {
                'top': current - parseFloat(height) + 'px'
            }, Math.ceil(duration*3/5), 'easeOutBack');
            return action.play().follow().done(function(){
                action_drop.actor(me[0], {
                    'top': current + 'px'
                }, Math.ceil(duration*2/5), 'easeInQuad');
                return action_drop.play().follow();
            }).follow();
        },

        move: function(offsets, duration, easing){
            if (this.preview_mode) {
                duration = PREVIEW_DURATION;
            }
            var self = this,
                action = choreo(),
                x = parseFloat(offsets[0] || 0),
                y = parseFloat(offsets[1] || 0),
                currentX = parseFloat(choreo.transform(this.me[0], 'translateX')) || 0,
                currentY = parseFloat(choreo.transform(this.me[0], 'translateY')) || 0;
            x += currentX,
            y += currentY;
        
            self.me.addClass('moving');

            action.actor(this.me[0], {
                'transform': 'translate(' + x + 'px, ' + y + 'px)'
            }, duration, easing);

            return action.play().follow().done(function(){
                self.me.removeClass('moving');
            });
        },

        walk: function(offsets, duration, easing){
            if (this.preview_mode) {
                duration = PREVIEW_DURATION;
            }
            var left_action = choreo(),
                right_action = choreo(),
                is_end = false,
                left_lift = true,
                right_lift = true,
                x = parseFloat(offsets[0] || 0),
                y = parseFloat(offsets[1] || 0),
                length = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)),
                left = left_action.actor(this.legLeft[0], {
                    'height': parseFloat(this.legLeft.height())*3/5 + 'px'
                }, duration/length*8, 'easeInOut'),
                right = right_action.actor(this.legRight[0], {
                    'height': parseFloat(this.legRight.height())*3/5 + 'px'
                }, duration/length*8, 'easeInOut');

            left_action.play().follow().done(function(){
                right_action.play();
                return left_step();
            }).follow().done(left_step);

            right_action.follow().done(right_step);
            
            function left_step(){
                if (is_end && !left_lift) {
                    return false;
                }
                left.reverse();
                left_lift = !left_lift;
                return left_action.play().follow().done(function(){
                    return left_step();
                }).follow();
            }

            function right_step(){
                if (is_end && !right_lift) {
                    return false;
                }
                right.reverse();
                right_lift = !right_lift;
                return right_action.play().follow().done(function(){
                    return right_step();
                }).follow();
            }

            return this.move(offsets, duration, easing).done(function(){
                is_end = true;
            });
        },

        speak: function(text, duration, clock, src, vol){
            if (this.preview_mode) {
                duration = PREVIEW_DURATION;
            }
            var self = this,
                promise = new event.Promise();
            clearTimeout(self._wordsTimer);
            if (!self._words) {
                self._words = bubble({
                    target: self.me[0], 
                    window: self.window
                });
            }
            if (self._words.opened) {
                self._words.speakPromise.fire();
            }
            self._words.speakPromise = promise;
            self._words.set({
                content: text,
                clock: clock
            }).update();
            self._wordsTimer = setTimeout(function(){
                self._words.show();
                self._wordsTimer = setTimeout(function(){
                    self._words.hide();
                    self._wordsTimer = setTimeout(function(){
                        self._words.destroy();
                        promise.fire();
                    }, 400);
                }, 400 + duration);
                if (src) {
                    self.sound(src, duration, vol || 100);
                }
            }, 10);
            return promise;
        },

        sound: function(src, duration, vol){
            if (this.preview_mode) {
                duration = PREVIEW_DURATION;
            }
            var sound,
                promise = new event.Promise();
            if (typeof src === 'string' || Array.isArray(src)) {
                sound = new buzz.sound(src);
            } else {
                sound = src;
            }
            if (vol) {
                sound.setVolume(vol);
            }
            sound.play();
            setTimeout(function(){
                if (!sound.isEnded()) {
                    sound.pause();
                }
                promise.fire();
            }, duration);
            return promise;
        },

        follow: function(){
            return this._resolved_promise;
        }

    };

    function capitalize(str){
        return str.replace(/^\w/, function(s){
            return s.toUpperCase();
        });
    }

    function exports(opt){
        return new exports.Demon(opt);
    }

    exports.Demon = Demon;

    return exports;

});
