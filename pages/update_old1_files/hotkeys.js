/**
 * Usage:
 * $.hotKeys([
 * {
 *   keys: '}',
 *   shift: true,
 *   handler: function(e) {
 *       alert('1. '+ e.target);
 *     }
 *  },
 *  {
 *    keys: [71, 71], //gg
 *    handler: function(e) {
 *       alert('2. '+ e.target);
 *     }
 *  },
 *  {
 *    keys: ['j'], 
 *    handler: function(e) {
 *        alert('3. '+ e.target);
 *    }
 *  }
 * ]);
 */

(function($){ 

          var delay,

          convertKeyCode = function(k){

          var keys = {
            'j': 74,
            'k': 75,
            'g': 71,
            'n': 78,
            '}': 221,
            '{': 219,
            '>': 39,
            '<': 37,
            '1': 49,
            'f1': 112,
            'f2': 113,
            'f3': 114,
            'f4': 115,
            'f5': 116,
            'f6': 117,
            'f7': 118,
            'f8': 119,
            'f9': 120,
            'f10': 121,
            'f11': 122,
            'f12': 123,
            'space': 32,
            'capslock': 20
            };

            return keys[k.toLowerCase()];
          },

          getAssistKeyName = function(o) {
            var fn = '';
            if (o.shift || o.shiftKey) {
              fn = 'shift_' + fn;
            }

            if (o.meta || o.metaKey) {
              fn = 'meta_' + fn;
            }

            if (o.ctrl || o.ctrlKey) {
              fn = 'ctrl_' + fn;
            }

            if (o.alt || o.altKey) {
              fn = 'alt_' + fn;
            }

            return fn;
          },

          convertToKeyConfig = function(o) {
            var n = {}, fn, keys = [], conds = [], c;
            if (!o.keys) {
              return;
            }

            if ($.isArray(o.keys)) {
              $(o.keys).each(function(){
                var s = arguments[1];
                if (!/\d+/.test(s)) {
                  s = convertKeyCode(s);
                }
                keys.push(s);
              });
              fn = keys.join('_');
            } else {
              if (!/\d+/.test(o.keys)) {
                o.keys = convertKeyCode(o.keys);
              }
              fn = o.keys;
            }

            fn = getAssistKeyName(o) + fn;

            n[fn] = {};
            n[fn].method = o.handler || function(){};

            return n;
          },

          hotKeyHandler = {};

$.extend({
    hotKeys: function(oConfig) {
       if ($.isArray(oConfig)) {
         $(oConfig).each(function(){
           $.extend(hotKeyHandler, convertToKeyConfig(arguments[1]));
         });
       } else {
         $.extend(hotKeyHandler, convertToKeyConfig(oConfig));
       }

        $(document).keydown(function(e){
              if(/input|textarea/.test(e.target.tagName.toLowerCase())){
                // esc jump out field.
                if (e.keyCode === 27) {
                    e.target.blur();
                }
                if ((e.ctrlKey || e.metaKey) && e.keyCode === 13 && e.target.tagName.toLowerCase() === 'textarea') {
                    $(e.target).closest('form').submit();
                }
                return;
              }
              var el = $(this), 
              keys = el.data('custom-hotkeys'), 
              saveKeys = [], 
              handle,
              isMeetConditionKey = true;

              if (!keys) {
                keys = [];
              }

              keys.push(e.keyCode);

              while(keys.length){
                handle = hotKeyHandler[getAssistKeyName(e) + keys.join('_')];
                if (handle) {
                  saveKeys = [];
                  if (delay) {
                      window.clearInterval(delay);
                  }

                  delay = window.setInterval(function(){
                    handle.method(e);
                  }, 200);

                  handle.method(e);

                  break;
                }
                saveKeys.push(keys.shift());
              }

              el.data('custom-hotkeys', saveKeys);
        }).keyup(function(e){
            if (delay) {
                window.clearInterval(delay);
            }
        });

      }
    });

})(jQuery);
