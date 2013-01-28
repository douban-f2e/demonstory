define([
  'mo/lang'
, 'dollar'
], function(_, $) {

  function Spotlight(opt, doc) {
    this.body = $('body', doc)
    this.init(opt)

    return this
  }
  Spotlight.prototype = {
    init: function(opt) {
      var body = this.body
      var bodySize = body.height() > body.width() ? body.height() : body.width()
      this.light = $('<div class="spotlight">')
      this.light.css({
        width: opt.size.width
      , height: opt.size.height
      , borderWidth: bodySize
      })
      // additianal position amendment
      this.amendment = {
        top: (opt.offset.top | 0) - opt.size.height / 2 - bodySize
      , left: (opt.offset.left | 0) - opt.size.width / 2 - bodySize
      }
      // store and move to target
      if(_.isFunction(opt.target.offset)) {
        // aiming $ object
        this.target = opt.target;
        this.moveToTarget()
      } else {
        // simply a object like {top:1, left:2}
        this.moveToTarget(opt.target)
      }
      this.getContainer(body).append(this.light)
    }
  , getContainer: function() {
      var container = this.body.find('.spl-container')
      if(!container[0]) {
        container = $('<div class="spl-container">')
        this.body.append(container)
      }
      return container
    }
  , moveToTarget: function(point) {
      var width = 0
      var height = 0
      if (this.target) {
        point = this.target.offset()
        width = this.target.width() / 2
        height = this.target.height() / 2
      }
      this.light.css({
        top: point.top + this.amendment.top + height + 'px'
      , left: point.left + this.amendment.left + width + 'px'
      })
    }
  , startFollowing: function() {
      var self = this
      this.following = setInterval(function() {
        self.moveToTarget()
      }, 10)
    }
  , stopFollowing: function() {
      clearInterval(this.following)
    }
  }


  return function(opt, doc) {
    return new Spotlight(opt, doc)
  }

})
