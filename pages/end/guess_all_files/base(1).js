/* BEGIN @import /js/separation/_all.js */
/* BEGIN @import /js/separation/droplist.js */
;(function ($) {
  var CSS_CONT = 'ui-sel-container',
    CSS_VALUE = 'ui-sel-value',
    CSS_MENU = 'ui-sel-list',
    CSS_HOVER = 'ui-sel-hover',
    CSS_ACTIVE = 'ui-sel-active',
    CSS_SELECTED = 'ui-sel-selected',
    CSS_HIDE = 'ui-sel-hide',
   currentType,
   defaultCfg  = {
    width: '90px'
  },
    
   renderUI = function (self) {
    var menu_str = ['<div class="' + CSS_MENU + ' ' + CSS_HIDE + '"><div class="bd"><ul>'];
    self.find('option').each(function (index, node) {
      if (node.selected) {
        currentType = node.innerHTML;
        menu_str.push('<li class="' + CSS_HIDE + '"><a href="#' + index + '">' + currentType + '</a></li>');
      } else {
        menu_str.push('<li><a href="#' + index + '">' + node.innerHTML + '</a></li>');              
      }
    });
    menu_str.push('</ul></div><div class="ft"><span>&nbsp;</span></div></div>'); 
    
    self.wrap('<div class="' + CSS_CONT + '"></div>').css('display', 'none').parent().prepend(menu_str.join('')).prepend('<div class="' + CSS_VALUE + '" style="width:' + self.cfg.width + '"><a href="#current">' + currentType + '</a></div>');
    
    self.parent().find('.' + CSS_MENU).css('width', (parseInt(self.cfg.width, 10) + 2) + 'px');
  },
  
   close = function (container) {
    container.removeClass(CSS_ACTIVE);
    container.find('.' + CSS_MENU).addClass(CSS_HIDE);
  },
  
   open = function (container) {
    if (container.hasClass(CSS_ACTIVE)) {
      close(container);
    } else {
      container.addClass(CSS_ACTIVE);
      container.find('.' + CSS_MENU).removeClass(CSS_HIDE);
    }
  },
  
   bindUI = function (self) {
    var container = self.parent();
    container.find('a').click(function (e) {
      var n = e.target.getAttribute('href', 2).split('#')[1], li = $(e.target).parent(), item;
      if (/current/i.test(n)) {
        open(container);
      } else {
        item = self[0][parseInt(n, 10)];
        item.selected = true;
        if (self.cfg.callback) {
          self.cfg.callback(item.text, item.value, item);
        }
        li.parent().find('.' + CSS_HIDE).removeClass(CSS_HIDE);
        li.addClass(CSS_HIDE);
        container.find('.' + CSS_VALUE + ' a').text(item.text);
        close(container);
      }
      e.preventDefault();
      return false;
    });
    
    container.find('.' + CSS_VALUE).mouseover(function (e) {
      container.addClass(CSS_HOVER);
    }).mouseout(function (e) {
      container.removeClass(CSS_HOVER);
    });
    
    $('body').click(function (e) {
      close(container);
    });
    
  };
  
  $.fn.renderDropList = function (cfg) {
    this.cfg = cfg || {};
    for (var k in defaultCfg) {
      if (!cfg[k]) {
        this.cfg[k] = defaultCfg[k];
      }
    }
    renderUI(this);
    bindUI(this);
  };
  
  
})(jQuery);
/* END @import /js/separation/droplist.js */

function loadDeferImage() {
    $('img[data-defer-src]').attr('src', function(){
        return $(this).attr('data-defer-src');
    });
}


$(function () {
  var tabs = $('#db-groups-cate .list li a'),
    items = $('#db-groups-cate .content .item'), current = 0,
        loopTimer,
        loopPause = function() {
            loopTimer && clearTimeout(loopTimer);
        },
        loopStart = function() {
           loopPause();
           loopTimer = setTimeout(function(){
             var i = current + 1 >= items.length ? 0 : current + 1;  
             tabs.eq(i).click();
             loopStart();
           }, 5000);
        };
  tabs.each(function (i, n) {
    $(n).addClass('tab_' + i);
  });
  items.each(function (i, n) {
    $(n).addClass('item_' + i);
  });
  tabs.click(function (e) {
    e.preventDefault();
        loopStart();
    var t = $(e.target), 
        li = t.parent(), item, con, 
        n = parseInt(e.target.className.match(/tab_(\d{1,2})/i)[1], 10);
    if (current === n) {
      return;
    }
    li.parent().find('.on').removeClass('on');
    li.addClass('on');
    items.filter('.item_' + current).fadeOut('fast');
    item = items.filter('.item_' + n).removeClass('hide').fadeIn('fast');
        con = item.find('script');
        if (con.length) {
          item.html(con.html());
        }
        loadDeferImage();
    current = n;
  });
    $('#db-groups-cate .bd').hover(function(){
        loopPause();
    }, function(){
        loopStart();
    });

    //tabs.eq(Math.random()*6|0).click();
    loopStart();
});

$(window).load(function(){
  loadDeferImage();
});

/* BEGIN @import /js/separation/prettyfield.js */
// TODO:重构它！

;(function(){
  var 
  opt_selected = '.submenu .selected',
  opt_menu = '.submenu .menu',
  templ = '<div class="submenu"><div class="selected">{SELECTED}<span>+</span></div><div class="menu hide"><ul>{LIST}</ul></div></div>',

  prettySelectField = function(frm, callback){
    var html_str = [];
    var opt = frm.find('select');
    var updateUI = function(sel, inp, inp_w, v){
      var w = v.length * 12 + 20;
      sel.parent().width(w);
      inp.width(inp_w - w + 4);
    };

    if (!opt[0]) {
      return;
    }

    var current = opt[0].options[opt[0].selectedIndex].text;
    var itm;

    for (var i=0, len = opt[0].options.length; i < len; i++) {
      itm = opt[0].options[i];
      if (current === itm.text) {
        html_str.push('<li class="hide"><a href="#' + i + '">' + itm.text + '</a></li>');
      } else {
        html_str.push('<li><a href="#' + i + '">' + itm.text + '</a></li>');
      }
    }


    opt.parent().after(templ.replace('{SELECTED}', current).replace('{LIST}', html_str.join('')));

    var menu = frm.find(opt_menu);
    var sel = frm.find(opt_selected);
    var inp = $(frm.find('input')[0]);
    var inp_w = inp.width();

    updateUI(sel, inp, inp_w, current);


    sel.click(function(e){
      var el = $(e.currentTarget), isOpen = el.hasClass('open');
      if (isOpen) {
        el.removeClass('open');
        menu.addClass('hide');
      } else {
        el.addClass('open');
        menu.removeClass('hide');
      }
      e.stopPropagation();
    }).mouseover(function(e){
      var el = $(e.currentTarget);
      el.parent().css('background-color', '#f2f2f2');
    }).mouseout(function(e){
      var el = $(e.currentTarget);
      el.parent().css('background-color', '#fff');
    });

    menu.click(function(e){
      var el = e.target, i, w, v;
      if (el.tagName.toLowerCase() === 'a') {
        i = parseInt(el.href.split('#')[1]);
        v = $(el).html();
        opt[0].options[i].selected = true;
        sel.html(v + '<span>+</span>');
        menu.find('.hide').removeClass('hide');
        $(el).parent().addClass('hide');
        inp[0].focus();
        e.preventDefault();
        updateUI(sel, inp, inp_w, v);
        if (callback) {
          callback(i, opt[0], frm);
        }
      }
    });

    $(document.body).click(function(e){
        sel.removeClass('open');
        menu.addClass('hide');
    });
  },

  prettyInputField = function(frm){
      var el = frm.find('input[type=text]');
      if (el[0].value === '' || el[0].value === el.attr('title')) {
        el[0].value = el.attr('title');
        el.css('color', '#d4d4d4');
      }
      el.data('label', el.attr('title')).attr('title','');
      el.focus(function(){
        if (this.value === $(this).data('label')) {
          this.value = '';
          $(this).css('color', '#000');
        }
      }).blur(function(){
        if (this.value === '') {
          this.value = $(this).data('label');
          $(this).css('color', '#d4d4d4');
        }
      });
  },

  init = function(node, cb){
    prettyInputField(node);
    prettySelectField(node, cb);

    node.submit(function(e){
      var inp = $(this).find('input')[0];
      if (inp.value === inp.rel) {
        inp.value = '';
      }
    });
  };

  $.fn.prettyField = function(cb){
    init($(this), cb);
  }

})();
/* END @import /js/separation/prettyfield.js */
/* END @import /js/separation/_all.js */

/* BEGIN @import /js/sns/fp/notify.js */
;(function(exports){
var dlg, save_id,

confirm_delete = function() {
    dlg = dui.Dialog({
      width: 300,
      content: $('#confirm_delete').html(),
      isHideTitle: 1,
      isHideClose: 1
    }).open();
};

exports.delete_reply_notify = function(id) {
  save_id = id;
  Do('dialog', confirm_delete);
};

exports.close_delete = function(is_delete) {
    if (is_delete) {
      $.get("/j/accounts/remove_notify?id=" + save_id)
      $("#reply_notify_" + save_id).fadeOut();
    }
    save_id = null;
    dlg.close();
};

})(window);
/* END @import /js/sns/fp/notify.js */

/* BEGIN @import /js/core/show_login.js */
Douban.init_show_login = function (e) {
  Do('dialog', function(){
    var api = '/j/misc/login_form';
    dui.Dialog({
      title: '登录',
      url: api,
      width: 350,
      cache: true,
      callback: function(da, o) {
        o.node.addClass('dialog-login');
        o.node.find('h2').css('display', 'none');
        o.node.find('.hd h3').replaceWith(o.node.find('.bd h3'));
        o.node.find('form').css({
          border: 'none',
          width: 'auto',
          padding: '0'
        });
        o.updateSize();
        o.updatePosition();
      }
    }).open();
  });
};
/* END @import /js/core/show_login.js */

$('html').delegate('.a-show-login', 'click', function(e){
  e.preventDefault();
  Douban.init_show_login(e);
});

//preload js
Do.preload = function(files) {
  var url, o, doc = document, isIE = /MSIE/i.test(navigator.userAgent);
  while((url = files.shift())) {
      if (isIE) {
        (new Image).src = url;
      } else {
        o = doc.createElement('object');
        o.data = url;
        o.width = 0;
        o.height = 0;
        doc.body.appendChild(o);
      }
  }
};


function moreurl(self, dict){
    var more = ['ref='+encodeURIComponent(location.pathname)];
    for (var i in dict) more.push(i + '=' + dict[i]);
    set_cookie({report:more.join('&')})
}

