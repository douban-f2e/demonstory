Do._isay = function(){
/* BEGIN @import /js/lib/jquery.iframe-post-form.js */
/**
* jQuery plugin for posting form including file inputs.
*
* Copyright (c) 2010 - 2011 Ewen Elder
*
* Licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
*
* @author: Ewen Elder <ewen at jainaewen dot com> <glomainn at yahoo dot co dot uk>
* @version: 1.1.1 (2011-07-29)
**/
(function ($)
{
  $.fn.iframePostForm = function (options)
  {
    var response,
    returnResponse,
    element,
    status = true,
    iframe;

    options = $.extend({}, $.fn.iframePostForm.defaults, options);


    // Add the iframe.
    if (!$('#' + options.iframeID).length)
    {
      $('body').append('<iframe id="' + options.iframeID + '" name="' + options.iframeID + '" style="display:none" />');
    }


    return $(this).each(function ()
    {
      element = $(this);


      // Target the iframe.
      element.attr('target', options.iframeID);


      // Submit listener.
      element.submit(function ()
      {
        // If status is false then abort.
        status = options.post.apply(this);

        if (status === false)
        {
          return status;
        }


        iframe = $('#' + options.iframeID).load(function ()
        {
          response = iframe.contents().find('body');


          if (options.json)
          {
            var real_text = response.text();
            //if ($.browser.opera) {
              //real_text = real_text.substring(5);
            //} else if (($.browser.msie && $.browser.version < 7) || $.browser.mozilla || $.browser.webkit) {
              //real_text = response.text();
            //}
            try {
              returnResponse = $.parseJSON(real_text);
            } catch (e) {}
            returnResponse = returnResponse || '';
          }

          else
          {
            returnResponse = response.html();
          }


          options.complete.apply(this, [returnResponse]);

          iframe.unbind('load');


          setTimeout(function ()
          {
            response.html('');
          }, 1);
        });
      });
    });
  };


  $.fn.iframePostForm.defaults =
  {
    iframeID : 'iframe-post-form',       // Iframe ID.
    json : false,                        // Parse server response as a json object.
    post : function () {},               // Form onsubmit.
    complete : function (response) {}    // After response from the server has been received.
  };
})(jQuery);
/* END @import /js/lib/jquery.iframe-post-form.js */

/* BEGIN @import /js/lib/jquery.text-selection.js */
// ref: http://stackoverflow.com/questions/401593/textarea-selection
(function($) {
  $.fn.get_selection = function() {
    var e = this[0];
    //Mozilla and DOM 3.0
    if ('selectionStart' in e) {
      var l = e.selectionEnd - e.selectionStart;
      return { start: e.selectionStart, end: e.selectionEnd, length: l, text: e.value.substr(e.selectionStart, l) };
    }
    else if (document.selection) {    //IE
      e.focus();
      var r = e._saved_range || document.selection.createRange();
      var tr = e.createTextRange();
      var tr2 = tr.duplicate();
      tr2.moveToBookmark(r.getBookmark());
      tr.setEndPoint('EndToStart', tr2);
      if (r == null || tr == null) return { start: e.value.length, end: e.value.length, length: 0, text: '' };
      var text_part = r.text.replace(/[\r\n]/g, '.'); //for some reason IE doesn't always count the \n and \r in length
      var text_whole = e.value.replace(/[\r\n]/g, '.');
      var the_start = text_whole.indexOf(text_part, tr.text.length);
      return { start: the_start, end: the_start + text_part.length, length: text_part.length, text: r.text };
    }
    //Browser not supported
    else return { start: e.value.length, end: e.value.length, length: 0, text: '' };
  };

  $.fn.set_selection = function(start_pos, end_pos) {
    var e = this[0];
    //Mozilla and DOM 3.0
    if ('selectionStart' in e) {
      e.focus();
      e.selectionStart = start_pos;
      e.selectionEnd = end_pos;
    }
    else if (document.selection) { //IE
      e.focus();
      var tr = e.createTextRange();

      //Fix IE from counting the newline characters as two seperate characters
      var stop_it = start_pos;
      for (i = 0; i < stop_it; i++) if (e.value[i] && e.value[i].search(/[\r\n]/) != -1) start_pos = start_pos - .5;
      stop_it = end_pos;
      for (i = 0; i < stop_it; i++) if (e.value[i] && e.value[i].search(/[\r\n]/) != -1) end_pos = end_pos - .5;

      tr.moveEnd('textedit', -1);
      tr.moveStart('character', start_pos);
      tr.moveEnd('character', end_pos - start_pos);
      tr.select();
    }
    return this.get_selection();
  };

  $.fn.replace_selection = function(replace_str) {
    var e = this[0];
    selection = this.get_selection();
    var start_pos = selection.start;
    var end_pos = start_pos + replace_str.length;
    e.value = e.value.substr(0, start_pos) + replace_str + e.value.substr(selection.end, e.value.length);
    this.set_selection(start_pos, end_pos);
    return {start: start_pos, end: end_pos, length: replace_str.length, text: replace_str};
  };

  $.fn.wrap_selection = function(left_str, right_str, sel_offset, sel_length) {
    var the_sel_text = this.get_selection().text;
    var selection = this.replace_selection(left_str + the_sel_text + right_str);
    if (sel_offset !== undefined && sel_length !== undefined)
      selection = this.set_selection(selection.start + sel_offset, selection.start + sel_offset + sel_length);
    else if (the_sel_text == '')
      selection = this.set_selection(selection.start + left_str.length, selection.start + left_str.length);
    return selection;
  };
}(jQuery));
/* END @import /js/lib/jquery.text-selection.js */

/* BEGIN @import /js/sns/widgets/isay/base.js */
/* BEGIN @import /js/lib/simple_loader.js */
// a very simple asynchronous js loader
// @author: ktmud
window.Do = window.Do || function(fn) {
  typeof fn == 'function' && setTimeout(fn, 0);
};
Do.add_js = function add_js(src) {
  var x = document.createElement('script');
  x.src = src;
  document.getElementsByTagName('head')[0].appendChild(x);
};
Do.add_css = function add_css(src, cb) {
  var x = document.createElement('link');
  x.rel = 'stylesheet';
  x.href = src;
  document.getElementsByTagName('head')[0].appendChild(x);
};
Do.check_js = function check_js(indicator, callback) {
  var indicator_ret = indicator();
  if (indicator_ret) {
    callback(indicator_ret);
  } else {
    setTimeout(function() {
      check_js(indicator, callback);
    }, 33);
  }
};
/* END @import /js/lib/simple_loader.js */

(function() {
  var max = 140,
  fnd_dlg = '#dialog',
  fnd_textarea = 'textarea',
  fnd_rec = '.msg a',
  fnd_counter = '#isay-counter',
  fnd_bn_section = '.btn',
  fnd_bn_group = '.btn-group',
  fnd_cta = '.btn .bn-flat',
  fnd_field = '#isay-act-field',
  cls_disable = 'isay-disable',
  cls_processing = 'isay-processing',
  cls_processed = 'isay-processed',
  cls_active = 'active',
  cls_focus = 'focus',
  cls_acting = 'acting',
  cls_error = 'error',
  textarea_clone;

  var tmpl_field = $('#tmpl-isay-act-field').html();

  var node_root,
  node_textarea,
  node_label,
  node_submit;

  function makeField(bd_html, hd) {
    return tmpl_field.replace('{bd}', bd_html).replace('{hd}', (hd || ''));
  }

  // {{{
  var exports = Do.ISay = {
    // 执行动作
    actions: {},
    // 动作初始化事件绑定
    initials: {},
    // set action field
    setField: function() {
      return node_root.addClass(cls_acting).find(fnd_field)
      .html(makeField.apply(this, arguments));
    },
    hideField: function() {
      return node_root.removeClass(cls_acting);
    },
    fieldMsg: function(cls, msg) {
      return this.setField('<div class="' + cls + '">' + msg + '</div>');
    },
    doAct: function(act, elem) {
      var actions = this.actions;
      if (act && act in actions) {
        node_root.addClass(cls_active);

        this._acted = false;
        this._acting = act;

        actions[act](elem);
      }
    },
    done: function(act) {
      this._acted = true;
      //delete this._acting;
    },
    // cancel action
    cancel: function(act) {
      var xhr;
      node_root.removeClass(cls_acting);
      $('#iframe-post-form').unbind('load').attr('src', 'javascript:void(0);');
      if ((xhr = this.imageUploadXHR) && xhr.abort) {
        xhr.abort();
        this.imageUploadXHR = null;
      }
      delete this._acting;
      this.validate();
    },
    // close the whole
    close: function() {
      this.cancel();
      node_textarea[0]._closed = true;
      node_textarea.height('').val('');
      node_label.show();
      node_root.removeClass(cls_active);
      $(fnd_counter).html('');
    },
    // check content height and validation
    check: check,
    validate: validate,
    enable: enable_this,
    disable: disable_this,
    init: function(trigger) {
      var self = this;
      var root = $('#db-isay');
      var elem = root[0];

      if (!elem || elem._inited) return;
      elem._inited = true;

      self.root = node_root = root;
      self.node_label = node_label = root.find('label'),
      self.node_textarea = node_textarea = root.find(fnd_textarea),
      self.node_submit = node_submit = root.find(':submit');

      for (var i in this.initials) {
        this.initials[i]();
      }

      // make clone
      self.textarea_clone = textarea_clone = node_textarea.clone().addClass('abs-out').attr('tabindex', '-1');
      node_textarea.removeAttr('name');
      textarea_clone.attr('id', 'isay-cont-clone').appendTo(node_textarea.parent());

      check();

      // disable submit button
      root.find('form').submit(function(e) {
        validate();
        if (root.hasClass(cls_disable) ||
        (exports._acting && !exports._acted)) {
          e.preventDefault();
          return;
        }
        disable_this();
      });

      // 输入时的事件
      node_textarea.bind('keyup input', check).focus(function() {
        node_label.hide();
        node_textarea[0]._closed = false;
        root.addClass(cls_active).addClass(cls_focus);
      }).blur(function(e) {
        root.removeClass(cls_focus);

        check(e);
      }).focus();

      //var init_val = $.trim(node_textarea.val());

      //if (init_val) {
        //root.removeClass(cls_disable).addClass(cls_active);
      //}

      if (trigger) do_action(trigger);

      root.delegate('.isay-close', 'click', function(e) {
        exports.close();
        return false;
      }).delegate('.isay-cancel', 'click', function(e) {
        // cancel act
        exports.cancel();
        e.preventDefault();
      }).delegate('a', 'click', function(e) {
        var elem = e.currentTarget;
        var href = elem.getAttribute('href');
        if (href === '#' || href === 'javascript:;' || !href) e.preventDefault();
        do_action(elem);
      }).delegate('label', 'click', function(e) {
        var t = $(e.currentTarget).attr('for');
        var elem = t && document.getElementById(t);
        elem && elem.focus && elem.focus();
      });
    }
  };
  //}}}

  function enable_this() {
    if (exports.acting && !exports._acted) return;
    node_root.removeClass(cls_disable);
    node_submit.removeAttr('disabled');
  }
  function disable_this() {
    node_root.addClass(cls_disable);
    node_submit.attr('disabled', true);
  }

  // 根据字数统计和动作完成情况，判断是否可发布信息
  // 更新错误消息
  function validate(val) {
    if (typeof val == 'undefined') val = get_val();
    //var n = Math.ceil(blength(val) / 2);
    var n = val.replace(/(^|[^"'(=])((http|https)\:\/\/[\.\-\_\/a-zA-Z0-9\~\?\%\#\=\@\:\&\;\*\+]+\b[\?\#\/\*]*)/ig, 'http://dou.bz/XXXXXX').length;
    var is_acting = '_acting' in exports;
    var is_acting_processed = exports._acted === true;
    var msg = $(fnd_counter);
    if (n > max || (!is_acting && n < 1) ||
    (is_acting && !is_acting_processed)) {
      disable_this();
    } else {
      enable_this();
    }

    // 字数超出
    var tleft = max - n;
    if (tleft < 0) {
      msg.html('<strong>' + tleft + '</strong>');
    } else if (tleft < 11) {
      msg.html(tleft);
    } else {
      msg.html('');
    }
  }

  // 检查输入内容的长度 调整输入框高度
  function check(e) {
    var inp = node_textarea, h;
    var val = get_val(e && e.target);
    var min_height = inp.attr('data-minheight') || 36;

    validate(val);

    if (val || node_root.hasClass(cls_focus)) {
      node_label.hide();
    } else {
      node_label.show();
    }
    h = textarea_clone.val(val).height(0).scrollTop(10000).scrollTop();
    inp.css('height', Math.min(Math.max(h, min_height), 250));
  }

  function get_val(elem) {
    var val = elem ? elem.value : node_textarea[0].value;
    return val ? $.trim(val) : '';
  }

  //function blength(val) {
    //if (typeof val != 'string') {
      //val = (val && val.toString()) || '';
    //}
    //return val.replace(/\n\r/g, '\n').replace(/[^\x00-\xff]/g, 'xx').length;
  //}

  function do_action(elem) {
    var act = elem.getAttribute('data-action');
    act && exports.doAct(act, elem);
  }

})();
/* END @import /js/sns/widgets/isay/base.js */

/* BEGIN @import /js/sns/widgets/isay/mention.js */
(function(isay) {
  isay.initials.mention = function() {
    Do.check_js(function() {
      return $.fn.tagsug && window.Mustache;
    }, function() {
      var highlighter = isay.root.find('p.mention-highlighter');
      isay.node_textarea.tagsug({
        url: 'https://api.douban.com/shuo/in/complete?alt=xd&count={max}&callback=?&word=',
        highlight: true,
        highlighter: highlighter
      });
      var reg_blank = /&nbsp;/g;
      isay.node_textarea.parents('form').submit(function(e) {
        var textarea_clone = isay.textarea_clone;
        var end_val = textarea_clone.val();
        var mentions = highlighter.find('code');
        mentions.each(function(i, item) {
          end_val = end_val.replace($(item).text(), '@' + item.getAttribute('data-id'));
        });
        //isay.node_textarea.val(end_val);
        textarea_clone.val(end_val);
      });
    });
  };
})(Do.ISay);
/* END @import /js/sns/widgets/isay/mention.js */

/* BEGIN @import /js/sns/widgets/isay/share.js */
(function(isay) {
  var cls_active = 'active';
  var validate = isay.validate;

  var html_inp_link = '<input type="text" id="isay-inp-url" value="http://" class="url" name="url">' +
  '<span class="bn-flat"><input type="button" value="添加" class="bn-preview"></span>';

  isay.initials.share = function() {
    isay.root.delegate('.bn-preview', 'click', function(e) {
      var inp = $('#isay-inp-url');
      inp.length && getURL($.trim(inp.val()));
      e.preventDefault();
    });
  };

  isay.actions.share = function() {
    isay.setField(html_inp_link);

    var inp = $('#isay-inp-url');

    function check_val() {
      if ($.trim(inp.val())) {
        inp.prev().hide();
        return true;
      } else {
        inp.prev().show();
      }
    }

    inp.focus(function(e) {
      inp.closest('div').addClass(cls_active);
    }).blur(function(e) {
      inp.closest('div').removeClass(cls_active);
    }).keypress(function(e) {
      if (e.keyCode == 13) {
        e.preventDefault();
        e.stopPropagation();
        getURL($.trim(this.value));
      } else {
        check_val();
      }
    }).bind('input', check_val)[0].focus();
    inp[0].select();

    validate();
  };

  function makeEditable(o) {
    var elem = o[0];
    if (!elem) return;
    var dummy = document.createElement('span');
    dummy.className = o[0].className;
    dummy.innerHTML = o.val().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    dummy = $(dummy).css({
      'position': 'absolute',
      'visibility': 'hidden'
    });
    o.after(dummy);
    var dummy_w = dummy.width() + 10;
    var w = Math.max(Math.min(dummy_w + 4, 500), 200);
    dummy.remove();

    o.width(dummy_w).mouseenter(function(e) {
      if (o.hasClass('field-title')) {
        o.addClass('editable-over');
      }
    }).mouseleave(function(e) { $(this).removeClass('editable-over'); }).
    click(function(e) {
      if (o.hasClass('field-title')) {
        o.width(w);
        o.removeClass('field-title').removeClass('editable-over').focus().select();
      }
    }).blur(function(e) {
      var t = $.trim(this.value);
      if (!t) {
        isay._acted = false;
      } else {
        isay._acted = true;
        o.addClass('field-title');
      }
      isay.validate();
    }).keyup(function(e) {
      var t = $.trim(this.value);

      if (t) {
        isay.enable();
      } else {
        isay.disable();
      }

      if (e.keyCode === 13) {
        e.preventDefault();
        e.stopPropagation();
        if (t) {
          this.blur();
          isay.node_submit.focus();
        }
      }
    }).keypress(function(e) {
      if (e.keyCode === 13) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }

  function getURL(url, next) {
    if (!url) return;
    isay.fieldMsg('waiting', '正在获取网址信息...');
    isay.node_textarea.focus();
    $.post('/j/misc/get_url_info',
      { url: url, ck: get_cookie('ck') }, function(res) {
        var hd, title;
        if (res.r) {
          title = res.title;
          if (title.length > 40) title = title.substring(0, 40) + '...';

          var field = isay.setField(res.url || url, '<div class="hd"><input class="field-title" name="title" maxlength="40"></div>' +
            '<input type="hidden" name="url">' +
          '<input type="hidden" name="t" value="I">');

          field.find('input[name=url]').val(res.url);
          makeEditable(field.find('input.field-title').val(res.title));

          isay._acted = true;

          // it's ok to send now
          validate();
        } else {
          isay.fieldMsg('error', (res.error || '获取网址信息失败') + '。 <a href="javascript:void(0);" data-action="share">重新输入</a>');
        }
      }, 'json');
  }
})(Do.ISay);
/* END @import /js/sns/widgets/isay/share.js */

/* BEGIN @import /js/sns/widgets/isay/pic.js */
// include ImageFileInspector, and PasteToImage
/* BEGIN @import /js/lib/paste-to-image.js */
/* BEGIN @import /js/lib/imagefile-inspector.js */
(function(exports) {
    'use strict';
    var isSupported = typeof FileReader !== 'undefined',

        isFunction = function(fn) {
            return Object.prototype.toString.call(fn) === '[object Function]';
        };

    function ImageFileInspector(imgFile) {
        if (!(this instanceof ImageFileInspector)) {
            return new ImageFileInspector(imgFile);
        }
        this.imageFile = imgFile;
    }

    ImageFileInspector.isSupported = isSupported;

    var tmp = {},

        callback = function(type, data, fn) {
            tmp[type] = data;
            if (/*tmp.binaryString &&*/ tmp.dataURI) {
                var img = new Image();
                img.onload = function() {
                    tmp.width = img.width;
                    tmp.height = img.height;
                    fn(tmp);
                }
                img.src = tmp.dataURI;
            }
        };

    ImageFileInspector.prototype.getInfo = function(fn) {
        var self = this,
            imageFile = self.imageFile,
            imageDataURI
            //, imageBinaryString
            ;

        fn = isFunction(fn) ? fn : function() {};

        // get the dataURI of image file
        imageDataURI = new FileReader();
        imageDataURI.onload = function(evt) {
            callback('dataURI', evt.target.result, fn);
        };
        imageDataURI.readAsDataURL(imageFile);

        // get the binary string of image file
        // imageBinaryString = new FileReader();
        // imageBinaryString.onload = function(evt) {
        //     callback('binaryString', evt.target.result, fn);
        // };
        // imageBinaryString.readAsBinaryString(imageFile);
    };

    exports.ImageFileInspector = ImageFileInspector;

})($);
/* END @import /js/lib/imagefile-inspector.js */

(function(exports) {
    var isSupported = 'addEventListener' in document && 'onpaste' in document;

    function _isFunction(fn) {
        return Object.prototype.toString.call(fn) === '[object Function]';
    }

    function PasteToImage(node, options) {
        if (!(this instanceof PasteToImage)) {
            return new PasteToImage(node, options);
        }

        if (typeof node === 'string') {
            return new PasteToImage(document.getElementById(node), options);
        }

        if (!node || node.nodeType !== 1) {
            throw Error('need a dom node');
        }

        this.node = node;
        this.options = options || {};
        this._logMessage = '';

        this._init();
    }

    PasteToImage.isSupported = isSupported;

    PasteToImage.prototype = {
        constructor: PasteToImage

        , _init: function() {
            var self = this;

            self.node.addEventListener('paste', function(evt) {
                return self._pasteHandler(evt);
            }, false);
        }

        , _log: function(msg) {
            this._logMessage += msg + '\n';
        }

        , print: function() {
            if (typeof console !== 'undefined' && console.log) {
                console.log(this._logMessage);
            }
        }

        , _pasteHandler: function(evt) {
            var self = this
                , clipboardData = evt.clipboardData
                , items
                , img, imgBlob, imgInfo
                , fileName
                , i = 0
                , len
                , fn;

            // if there is filename, means the clipboardData is a file, and the browser cannot read its content, so ignored
            if (!clipboardData || !(items = clipboardData.items) || (fileName = clipboardData.getData('Text'))) {
                self._log('sorry, browser not support');
                return;
            }

            // test whether has image content in clipboard
            if ((len = items.length) > 0) {
                for (; i < len; i++) {
                    if (items[i].type.indexOf('image') >= 0) {
                        img = items[i];
                        break;
                    }
                }
                if (img) {
                    // convert clipboard image to image bolb object
                    imgBlob = img.getAsFile();
                    imgInfo = new $.ImageFileInspector(imgBlob);

                    imgInfo.getInfo(function(data) {
                        if ((fn = self.options.complete) && _isFunction(fn)) {
                            data.blob = imgBlob;
                            fn(data);
                        };
                    });

                } else {
                    self._log('image is not found in clipboard');
                }
            }
        }
    };

    exports.PasteToImage = PasteToImage;
})($);
/* END @import /js/lib/paste-to-image.js */

(function(isay) {
  var node_upload, node_upload_inp, MAX_IMAGE_SIZE = 3000000, MAX_IMAGE_PX = 128;

  // to enable upload same picture again and again..
  function replace_inp() {
    node_upload_inp.replaceWith(node_upload_inp.clone(false));
    node_upload_inp = $('#isay-upload-inp');
    node_upload_inp.change(function() {
      if (this.value !== '') {
        node_upload.submit();
        node_upload[0].submit();
        replace_inp();
      }
    });
  }

  function update_image_datauri(data) {
    var width = data.width, height = data.height, max, xhr;

    if (xhr = isay.imageUploadXHR) {
      xhr.abort();
      isay.imageUploadXHR = null;
    }

    if ((data.blob || data.file).size > MAX_IMAGE_SIZE) {
      isay.fieldMsg('error', '图片超过3M，请换一张图片');
      return;
    }

    if ((max = Math.max(width, height)) > MAX_IMAGE_PX) {
      if (max === width) {
        width = MAX_IMAGE_PX;
        height = MAX_IMAGE_PX / max * height;
      } else {
        height = MAX_IMAGE_PX;
        width = MAX_IMAGE_PX / max * width;
      }
    }

    isay.setField('<img width="' + width + '" height="' + height + '" src="' + data.dataURI + '" /><div id="__paste_image_tmp__" class="waiting">正在更新图片信息...</div>');
    isay.doAct('pic_xhr', $('#__paste_image_tmp__'));

    // prepare to send image data
    var fd = new FormData(), xhr = new XMLHttpRequest(), json;

    fd.append('image', data.blob || data.file);
    fd.append('ck', node_upload.get(0).ck.value);

    xhr.open('POST', node_upload.attr('action'), true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 400) {
        isay.imageUploadXHR = null;
        json = JSON.parse(xhr.responseText);
        $('#__paste_image_tmp__').removeClass('waiting').html('<input type="hidden" name="uploaded" value="' + json.url + '">');
        isay.done();
        isay.validate();
      }
    };
    xhr.send(fd)
    isay.imageUploadXHR = xhr;
  }

  isay.initials.pic = function() {
    //var node_upload = $($('#tmpl-isay-upload').html()).appendTo(isay.root);
    node_upload = $('#isay-upload');
    node_upload_inp = $('#isay-upload-inp');
    node_upload.iframePostForm({
      json: true,
      // start upload
      post: function() {
        isay.fieldMsg('waiting', '正在上传...');
      },
      complete: function(data) {
        node_upload_inp.val('');
        var url = data && data.url;
        if (!url) {
          set_msg(data.msg || '上传失败');
          return;
        }
        isay.setField('<div class="waiting" style="padding-left:0;"><img src="{src}"></div><input type="hidden" name="uploaded" value="{src}">'.replace(/{src}/g, url));
        isay.done();
        isay.validate();
      }
    });
    node_upload_inp.change(function() {
      var files = this.files;
      if (files && files.length) {
        var file = files[0];
        // 3M
        if (file.size > MAX_IMAGE_SIZE) {
          set_msg('图片超过3M');
          return;
        }
      }
      if (this.value !== '') {
        node_upload.submit();
        node_upload[0].submit();
        isay.node_textarea.focus();
        replace_inp();
      }
    });

    // paste image function, but now only support Chrome
    if ($.PasteToImage.isSupported) {
      $.PasteToImage(isay.node_textarea.get(0), {
        complete: update_image_datauri
      });
    }

    function set_msg(msg) {
      isay.fieldMsg('error', msg + '，<a href="javascript:;" data-action="pic">点此重试</a>');
      node_upload.css({
        left: msg.length + 1.7 + 'em',
        top: -40 + 'px'
      });
    }
  };
  isay.actions.pic = function(elem) {
    var self = isay;
    isay.hideField();
    node_upload.css({ left: '', top: '' });
    if (elem && elem.id == 'isay-upload-inp' && elem.value) {
      node_upload.submit();
      node_upload[0].submit();
      replace_inp();
    }
  };
  isay.initials.dargAndDrop = function($textarea) {
    isay.initials.dargAndDrop = $.noop;

    if (!('addEventListener' in document) || !('ondrag' in document)) {
      return;
    }

    var self = isay,
        $dragCollection = $(),
        slice = Array.prototype.slice,
        enableDragHandler = false;

    // clean previous event
    $textarea.unbind('dragenter');

    document.addEventListener('dragenter', function(evt) {
      var types;

      enableDragHandler = false;

      // if not drag file
      if (evt.dataTransfer && (types = evt.dataTransfer.types) && (types = slice.call(types)) &&

          // 'Files' keyword is not involed in file drag
          types.indexOf('Files') < 0) {

        // not file drag, return directly in case other browser plugin behavior (e.g Maxthon 3 SuperDrag)
        return;

      }

      enableDragHandler = true;

      if (($dragCollection = $dragCollection.add($(evt.target))).length > 1) {
        return;
      }

      var $item;

      // init first
      self.init();

      // clean error tips
      isay.hideField();

      if (($item = self.root.find('.item')).find('.drag-tips').length === 0) {

        $('<div class="drag-tips">拖拽图片到这里，直接上传</div>')
          .bind('dragenter dragover', function(evt) {
            evt = evt.originalEvent;
            $(this).addClass('over');
            evt.stopImmediatePropagation();
            evt.preventDefault();
            evt.dataTransfer.dropEffect = 'copy';
          })
          .bind('dragleave', function(evt) {
            evt = evt.originalEvent;
            $(this).removeClass('over');
            evt.stopImmediatePropagation();
          })
          .bind('drop', function(evt) {
            evt = evt.originalEvent;
            evt.preventDefault();

            var file, ifi;

            if (file = evt.dataTransfer.files[0]) {
              ifi = new $.ImageFileInspector(file);
              ifi.getInfo(function(data) {
                data.file = file;
                update_image_datauri(data);
              });
            }

            // clean
            $item.removeClass('drag');
            $dragCollection = $();
          })
          .appendTo($item);
      }

      $item.addClass('drag');

      // this ensure the drop event would fire
      evt.dataTransfer.dropEffect = 'none';
      evt.preventDefault();
    }, true);

    document.addEventListener('dragover', function(evt) {
      if (enableDragHandler === true) {
        evt.dataTransfer.dropEffect = 'none';
        evt.preventDefault();
      }
    }, true);

    document.addEventListener('dragleave', function(evt) {
      if (($dragCollection = $dragCollection.not($(evt.target))).length === 0) {
        self.root && self.root.find('.item').removeClass('drag');
      }
    }, true);
  };
})(Do.ISay);
/* END @import /js/sns/widgets/isay/pic.js */

/* BEGIN @import /js/sns/widgets/isay/topic.js */
(function(isay) {
  //var is_intopic = false;

  isay.actions.topic = function() {
    var node_textarea = isay.node_textarea;

    var t = node_textarea[0],
    len = t.value.length;

    t.focus();

    var val = t.value,
    selection = node_textarea.get_selection(),
    sel = selection.text;
    start = selection.start,
    end = selection.end;

    if (val.charAt(start - 1) == '#' && val.charAt(end) == '#') return isay.done();

    var rep = '#' + (sel || '话题') + '#';
    t.value = val.substring(0, start) + rep + val.substring(end, len);
    if (sel === '') {
      node_textarea.set_selection(start + 1, start + 3);
    }

    isay.done();
  };

  isay.initials.topic = function() {
    var node_textarea = isay.node_textarea;
    var t = node_textarea[0];

    // when press tab, goto the very end
    //node_textarea.bind('keydown', function(e) {
      //if (is_intopic && e.keyCode == 9) {
        //var end = t.value.length;
        //t.value += ' ';
        ////t.setSelectionRange && t.setSelectionRange(end, end);
        //e.preventDefault();
      //}
    //});
    if (document.selection) {
      node_textarea.bind('keyup mousedown mouseup focus', function(e) {
        this._saved_range = document.selection.createRange();
      });
    }
  };
})(Do.ISay);
/* END @import /js/sns/widgets/isay/topic.js */

};
// fix dependency
if ('add' in Do) Do('common', function() { Do._isay(); });
else Do._isay();
