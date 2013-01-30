define([
    'mo/lang',
    'dollar',
    'choreo'
], function(_, $, choreo){

  var PREVIEW_DURATION = 10;

  function Camera(win) {
    this.action = choreo().play();
    this.win = win;
    this.doc = $(win.document.body);
    this.preview_mode = false;
  }

  // Move viewport to some center point
  Camera.prototype.pan = function(args) {
    var cpoint = args.cpoint;
    var elem = args.elem;
    var offset = args.offset;
    var zoom = args.zoom || 1.5;
    var duration = args.duration || 1200;

    if (this.preview_mode) {
      duration = PREVIEW_DURATION;
    }

    var action = choreo().play();

    var win = this.win;
    var doc = this.doc;

    var x = 0;
    var y = 0;
    if (cpoint) {
      x = cpoint[0];
      y = cpoint[1];
    } else {
      var o = $(elem, win).offset();
      if (o) {
        x = o.left + o.width / 2;
        y = o.top + o.height / 2;
      }
    }

    var l = doc.width() / 2;
    var t = doc.height() / 2;

    x = parseInt((win.innerWidth / 2 - x) * zoom);
    y = parseInt(t * zoom - t + (win.innerHeight / 2 - y * zoom));

    if (offset) {
      x += (offset.left || 0);
      y += (offset.top || 0);
    }

    var translate = 'translate(' + x + 'px,' + y + 'px)';
    action.actor(doc[0], {
      transform: translate
    }, duration);
    return action.actor(doc[0], {
      transform: 'scale(' + zoom + ',' + zoom + ')'
    }, duration).follow();
  };

  Camera.prototype.reset = function(duration) {
    duration = duration || 320;
    if (this.preview_mode) {
      duration = PREVIEW_DURATION;
    }

    var action = choreo().play();

    var doc = this.doc;

    action.actor(doc[0], {
      transform: 'scale(1,1)' 
    }, duration);

    return action.actor(doc[0], {
      transform: 'translate(0,0)' 
    }, duration).follow();
  };

  function exports(win) {
    return new Camera(win);
  }
  exports.Camera = Camera;

  return exports;
});
