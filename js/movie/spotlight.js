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
      this.bodySize = body.height() > body.width() ? body.height() : body.width()
      this.light = $('<div class="spotlight">')
      // init spotlight size
      this.setSize(this.size = opt.size)
      this.light.css({
        borderWidth: this.bodySize
      })
      // additianal position amendment
      this.amendment = {
        top: 0, left:0
      }
      if (opt.offset) {
        this.amendment.top = opt.offset.top | 0
        this.amendment.left = opt.offset.left | 0
      }
      this.setTarget(opt.target)
      this.getContainer().append(this.light)
    }
  , getContainer: function() {
      if (this.container) {
        return this.container
      }
      var container = this.body.find('.spl-container')
      if(!container[0]) {
        container = $('<div class="spl-container">')
        this.body.append(container)
      }
      return this.container = container
    }
  , setTarget: function(target) {
      // store and move to target
      if(_.isFunction(target.offset)) {
        // aiming $ object
        this.target = target
        this.moveToTarget()
      } else {
        // simply a position info like {top:1, left:2}
        this.target = undefined
        this.moveToTarget(target)
      }
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
        top: point.top + this.amendment.top + height - this.size.width/2 - this.bodySize  + 'px'
      , left: point.left + this.amendment.left + width - this.size.height/2 - this.bodySize + 'px'
      })
    }
  , setSize: function(size) {
      this.size = size
      this.light.css({
        width: size.width
      , height: size.height
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
