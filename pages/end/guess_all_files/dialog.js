(function() {

	// namespace 'dui'
	var dui = window.dui || {},

	// private methods and properties.
	_id = 'dui-dialog',
	_ids = [],
	_current_dlg = null,
	_isIE6 = ($.browser.msie && $.browser.version === '6.0') ? true: false,
	_cache = {},

	//button callback. _button_callback[button id] = function.
	_button_callback = {},

	_CSS_DLG = 'dui-dialog',
	_CSS_BTN_CLOSE = 'dui-dialog-close',
  J_CLOSE = 'j_close_dialog',
	_CSS_DIV_SHD = 'dui-dialog-shd',
	_CSS_DIV_CONTENT = 'dui-dialog-content',
	_CSS_IFRM = 'dui-dialog-iframe',

	_TXT_CONFIRM = '确定',
	_TXT_CANCEL = '取消',
	_TXT_TIP = '提示',
	_TXT_LOADING = '下载中，请稍候...',

	_templ = '<div id="{ID}" class="' + _CSS_DLG + ' {CLS}" style="{CSS_ISHIDE}">\
				<span class="' + _CSS_DIV_SHD + '"></span>\
				<div class="' + _CSS_DIV_CONTENT + '">\
          {BN_CLOSE}\
					{TITLE}\
					<div class="bd">{BODY}</div>\
				</div>\
			</div>',
	_templ_btn_close = '<a href="#" class="' + J_CLOSE + ' ' + _CSS_BTN_CLOSE + '">X</a>',
	_templ_title = '<div class="hd"><h3>{TITLE}</h3></div>',
	_templ_iframe = '<iframe class="' + _CSS_IFRM + '"></iframe>',

	_button_config = {
		'confirm': {
			text: _TXT_CONFIRM,
			method: function(o) {
				o.close();
			}
		},
		'cancel': {
			text: _TXT_CANCEL,
			method: function(o) {
				o.close();
			}
		}
	},

	_default_config = {
		url: '',
    nodeId: '',
    cls: '',
		content: '',
		title: _TXT_TIP,
		width: 0,
		height: 0,
		visible: false,
		iframe: false,
		maxWidth: 960,
		autoupdate: false,
		cache: true,
		buttons: [],
		callback: null,
		dataType: 'text',
		isStick: false,
		isHideClose: false,
		isHideTitle: false
	},

	// mix config setting.
	_config = function(n, d) {
		var cfg = {},
		i;
		for (i in d) {
			if (d.hasOwnProperty(i)) {
				cfg[i] = n[i] || d[i];
			}
		}
		return cfg;
	},

	_formCollection = function(frm) {
		var els = frm.elements,
		i = 0,
		el, data = [],
		getValue = {
			'select-one': function(el) {
				return encodeURIComponent(el.name) + '=' + encodeURIComponent(el.options[el.selectedIndex].value);
			},
			'select-multiple': function(el) {
				var i = 0,
				opt, values = [];
				for (; opt = el.options[i++];) {
					if (opt.selected) {
						values.push(encodeURIComponent(el.name) + '=' + encodeURIComponent(opt.value));
					}
				}
				return values.join('&');
			},
			'radio': function(el) {
				if (el.checked) {
					return encodeURIComponent(el.name) + '=' + encodeURIComponent(el.value);
				}
			},
			'checkbox': function(el) {
				if (el.checked) {
					return encodeURIComponent(el.name) + '=' + encodeURIComponent(el.value);
				}
			}
		};
		for (; el = els[i++];) {
			if (getValue[el.type]) {
				data.push(getValue[el.type](el));
			} else {
				data.push(encodeURIComponent(el.name) + '=' + encodeURIComponent(el.value));
			}
		}

		return data.join('&').replace(/\&{2,}/g, '&');
	},

	dialog = function(cfg) {
		var c = cfg || {};
		this.config = _config(c, _default_config);
		this.init();
	};

	dialog.prototype = {
		init: function() {
			if (!this.config) {
				return;
			}

			this.render();
			this.bind();

      return this;
		},

		render: function(bd) {
			var cfg = this.config,
			id = cfg.nodeId || _id + _ids.length;

			_ids.push(id);

      var bodyHtml = typeof cfg.content === 'object' ? $(cfg.content).html() : cfg.content;

      $('body').append(
        _templ.replace('{ID}', id).replace('{CSS_ISHIDE}', cfg.visible ? '': 'visibility:hidden;top:-999em;left:-999em;')
        .replace('{CLS}', cfg.cls)
        .replace('{TITLE}', _templ_title.replace('{TITLE}', cfg.title))
        .replace('{BN_CLOSE}', _templ_btn_close).replace('{BODY}', bodyHtml || bd || '')
      );

			this.nodeId = id;
			this.node = $('#' + id);
			this.title = $('.hd', this.node);
			this.body = $('.bd', this.node);
			this.btnClose = $('.' + _CSS_BTN_CLOSE, this.node);
			this.shadow = $('.' + _CSS_DIV_SHD, this.node);
			this.iframe = $('.' + _CSS_IFRM, this.node);

			this.set(cfg);

      return this;
		},

		bind: function() {
			var o = this;

			$(window).bind({
				resize: function() {
					if (_isIE6) {
						return;
					}
					o.updatePosition();
				},
				scroll: function() {
					if (!_isIE6) {
						return;
					}
					o.updatePosition();
				}
			});


      o.node.delegate('.' + J_CLOSE, 'click', function(e) {
				o.close();
				e.preventDefault();
			});
      o.node.find('.' + _CSS_BTN_CLOSE).bind('click', function(e) {
        o.close();
        e.preventDefault();
      });

			$('body').keypress(function(e) {
				if (e.keyCode === 27) {
					o.close();
				}
			});

      return this;
		},

		updateSize: function() {
			var w = this.node.width(),
			h,
			screen_height = $(window).height(),
			cfg = this.config;

			$('.bd', this.node).css({
				'height': 'auto',
				'overflow-x': 'visible',
				'overflow-y': 'visible'
			});

			h = this.node.height();


			if (w > cfg.maxWidth) {
				w = cfg.maxWidth;
				this.node.css('width', w + 'px');
			}

			if (h > screen_height) {
				$('.bd', this.node).css({
					'height': (screen_height - 150) + 'px',
					'overflow-x': 'hidden',
					'overflow-y': 'auto'
				});
			}

			h = this.node.height();

			this.shadow.width(w).height(h);
			this.iframe.width(w + 16).height(h + 16);

      return this;
		},

		updatePosition: function() {
			if (this.config.isStick)
				return;
			var w = this.node.width(),
			h = this.node.height(),
			win = $(window),
			t = _isIE6 ? win.scrollTop() : 0;
			this.node.css({
				left: Math.floor(win.width() / 2 - w / 2 - 8) + 'px',
				top: Math.floor(win.height() / 2 - h / 2 - 8) + t + 'px'
			});

      return this;
		},

		set: function(cfg) {
      var title, close, html_str, el,
      id = this.nodeId,
      _id = this.nodeId || _id,
			num = [],
			that = this,
			genId = function(str) {
				num.push(0);
				return id + '-' + str + '-' + num.length;
			};

			if (!cfg) {
				return this;
			}

			// set width and height.
			if (cfg.width) {
				this.node.css('width', cfg.width + 'px');
				this.config.width = cfg.width;
			}

			if (cfg.height) {
				this.node.css('height', cfg.height + 'px');
				this.config.height = cfg.height;
			}

			// set buttons
      // [{ cls: '', href: '', text: '' , method: fn }]
			if ($.isArray(cfg.buttons) && cfg.buttons[0]) {
				el = $('.ft', this.node);
				html_str = [];

				$(cfg.buttons).each(function() {
					var bn = arguments[1],
					bnId = genId('bn');

					if (typeof bn === 'string') bn =  _button_config[bn];

          if (!bn.text) return;

          if (bn.href) {
            html_str.push('<a class="' + (bn.cls || '') + '" id="' + bnId + '" href="'  + bn.href  + '">' + bn.text + '</a> ');
          } else {
            html_str.push('<span class="bn-flat ' + (bn.cls || '') + '"><input type="button" id="' + bnId + '" class="' + _id + '-bn" value="' + bn.text + '" /></span> ');
          }
          _button_callback[bnId] = bn.method;
				});

				if (!el[0]) {
					el = this.body.parent().append('<div class="ft">' + html_str.join('') + '</div>');
				} else {
					el.html(html_str.join(''));
				}

				this.footer = $('.ft', this.node);

				// bind event.
        $('.ft input, .ft a', this.node).click(function(e) {
					var func = this.id && _button_callback[this.id];
					if (func) {
						var halt = func.call(this, that);
					}
          if (halt) {
            e.preventDefault();
            if (typeof halt == 'string') alert(halt);
          }
				});
			} else {
				this.footer = $('.ft', this.node);
				this.footer.html('');
			}

			// set hidden close button
			if (typeof cfg.isHideClose !== 'undefined') {
				if (cfg.isHideClose) {
					this.btnClose.hide();
				} else {
					this.btnClose.show();
				}
				this.config.isHideClose = cfg.isHideClose;
			}

			// set hidden title
			if (typeof cfg.isHideTitle !== 'undefined') {
				if (cfg.isHideTitle) {
					this.title.hide();
				} else {
					this.title.show();
				}
				this.config.isHideTitle = cfg.isHideTitle;
			}

			// set title.
			if (cfg.title) {
				this.setTitle(cfg.title);
				this.config.title = cfg.title;
			}

			// set enable iframe
			if (typeof cfg.iframe !== 'undefined') {
				if (!cfg.iframe) {
					this.iframe.hide();
				} else if (!this.iframe[0]) {
					this.node.prepend(_templ_iframe);
					this.iframe = $('.' + _CSS_IFRM, this.node);
				} else {
					this.iframe.show();
				}
				this.config.iframe = cfg.iframe;
			}

			// set content.
			if (cfg.content) {
				this.body.html(typeof cfg.content === 'object' ? $(cfg.content).html() : cfg.content);
				this.config.content = cfg.content;
			}

			// fetch content by URL.
			if (cfg.url) {
				if (cfg.cache && _cache[cfg.url]) {
					if (cfg.dataType === 'text' || ! cfg.dataType) {
						this.setContent(_cache[cfg.url]);
					}
					if (cfg.callback) {
						cfg.callback(_cache[cfg.url], this);
					}
				} else if (cfg.dataType === 'json') {
					this.setContent(_TXT_LOADING);
					if (this.footer) {
						this.footer.hide();
					}
					$.getJSON(cfg.url, function(data) {
						that.footer.show();
						_cache[cfg.url] = data;
						if (cfg.callback) {
							cfg.callback(data, that);
						}
					});
				} else {
					this.setContent(_TXT_LOADING);
					if (this.footer) {
						this.footer.hide();
					}
					$.ajax({
						url: cfg.url,
						dataType: cfg.dataType,
						success: function(content) {
							_cache[cfg.url] = content;
							if (that.footer) {
								that.footer.show();
							}
							that.setContent(content);
							if (cfg.callback) {
								cfg.callback(content, that);
							}
						}
					});
				}
			}

			var pos = cfg.position;
			if (pos) {
				this.node.css({
					left: pos[0] + 'px',
					top: pos[1] + 'px'
				});
			}

			if (typeof cfg.autoupdate === "boolean") {
				this.config.autoupdate = cfg.autoupdate;
			}
			if (typeof cfg.isStick === "boolean") {
				if (cfg.isStick) {
					this.node[0].style.position = "absolute";
				} else {
					this.node[0].style.position = "";
				}
				this.config.isStick = cfg.isStick;
			}

			return this.update();
		},

		update: function() {
			this.updateSize();
			this.updatePosition();
			return this;
		},

		setContent: function(str) {
			this.body.html(str);
			return this.update();
		},

		setTitle: function(str) {
			$('h3', this.title).html(str);
			return this;
		},

		// submit form in dialog
		submit: function(callback) {
			var that = this,
			frm = $('form', this.node);
			frm.submit(function(e) {
				e.preventDefault();

				var url = this.getAttribute('action', 2),
				type = this.getAttribute('method') || 'get',
				data = _formCollection(this);

				$[type.toLowerCase()](url, data, function(da) {
					if (callback) {
						callback(da);
					}
				},
				'json');
			});

			frm.submit();
		},

		open: function() {
			this.node.appendTo("body").css('visibility', 'visible').show();
			var self = this, bd = self.body[0];
			self.contentHeight = bd.offsetHeight;
			this.watcher = !this.config.autoupdate ? 0 : setInterval(function(){
				if (bd.offsetHeight === self.contentHeight) {
					return;
				}
				self.update();
				self.contentHeight = bd.offsetHeight;
			}, 100);
			return this;
		},

		close: function() {
			this.node.hide();
            this.node.trigger('dialog:close', this);
			clearInterval(this.watcher);
			return this;
		}
	};

	// add to dui
	dui.Dialog = function(cfg, isMulti) {
		// use sigleton dialog mode by default.
		if (!isMulti && _current_dlg) {
			return cfg ? _current_dlg.set(cfg) : _current_dlg;
		}

		if (!_current_dlg && ! isMulti) {
			_current_dlg = new dialog(cfg);
			return _current_dlg;
		}

		return new dialog(cfg);
	};

	window.dui = dui;

})();
