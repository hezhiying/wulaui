if ("undefined" === typeof jQuery) {
	throw new Error("WulaUI's JavaScript requires jQuery");
}
(function ($) {
	$.i18n = function (source, params) {
		var _arguments = arguments,
		    _this = this;

		if (arguments.length === 1) {
			return function () {
				var args = $.makeArray(_arguments);
				args.unshift(source);
				return $.i18n.apply(_this, args);
			};
		}
		if (params === undefined) {
			return source;
		}
		if (arguments.length > 2 && params.constructor !== Array) {
			params = $.makeArray(arguments).slice(1);
		}
		if (params.constructor !== Array) {
			params = [params];
		}
		$.each(params, function (i, n) {
			source = source.replace(new RegExp("\\{" + i + "\\}", "g"), function () {
				return n;
			});
		});
		return source;
	};
})(jQuery);
(function ($) {
	$.lang = {
		core: {
			error: 'Oops!! ',
			warning: 'Warning ',
			success: 'Done ',
			info: 'Tip ',
			tip: 'Tip',
			ok: 'OK',
			yes: 'Yes',
			yes1: 'Yes,Sure!',
			no: 'No',
			cancel: 'Cancel',
			confirmTile: 'Are you sure?'
		}
	};
})(jQuery);
(function ($) {
	"use strict";

	var Shift = function Shift(element) {
		this.$element = $(element);
		this.$prev = this.$element.prev();
		!this.$prev.length && (this.$parent = this.$element.parent());
	};
	Shift.prototype = {
		constructor: Shift,
		init: function init() {
			var $el = this.$element,
			    method = $el.data()['toggle'].split(':')[1],
			    $target = $el.data('target');
			$el.hasClass('in') || $el[method]($target).addClass('in');
		},
		reset: function reset() {
			this.$parent && this.$parent['prepend'](this.$element);
			!this.$parent && this.$element['insertAfter'](this.$prev);
			this.$element.removeClass('in');
		}
	};
	$.fn.shift = function (option) {
		return this.each(function () {
			var $this = $(this),
			    data = $this.data('shift');
			if (!data) $this.data('shift', data = new Shift(this));
			if (typeof option === 'string') data[option]();
		});
	};
	$.fn.shift.Constructor = Shift;
})(jQuery);
Date.now = Date.now || function () {
	return +new Date();
};
// wulaUI
(function ($) {
	"use strict";

	$.wulaUI = {};
	$.wulaUI.init = function (opts) {
		$('body .wulaui').trigger('wulaui.widgets.init');
		return $.wulaUI;
	};
	// class
	$(document).on('click', '[data-toggle^="class"]', function (e) {
		e && e.preventDefault();
		var $this = $(e.target),
		    $class = void 0,
		    $target = void 0,
		    $tmp = void 0,
		    $classes = void 0,
		    $targets = void 0;
		!$this.data('toggle') && ($this = $this.closest('[data-toggle^="class"]'));
		$class = $this.data()['toggle'];
		$target = $this.data('target') || $this.attr('href');
		$class && ($tmp = $class.split(':')[1]) && ($classes = $tmp.split(','));
		$target && ($targets = $target.split(','));
		$targets && $targets.length && $.each($targets, function (index) {
			$targets[index] !== '#' && $($targets[index]).toggleClass($classes[index]);
		});
		$this.toggleClass('active');
	});
	var $window = $(window);
	// mobile
	var mobile = function mobile(option) {
		if (option === 'reset') {
			$('[data-toggle^="shift"]').shift('reset');
		} else {
			$('[data-toggle^="shift"]').shift('init');
		}
		return true;
	};
	// unmobile
	$window.width() < 768 && mobile();
	var $resize = void 0,
	    $width = $window.width();
	$window.resize(function () {
		if ($width !== $window.width()) {
			clearTimeout($resize);
			$resize = setTimeout(function () {
				setHeight();
				$window.width() < 768 && mobile();
				$window.width() >= 768 && mobile('reset') && fixVbox();
				$width = $window.width();
			}, 500);
		}
		$window.trigger('wulaui.layout');
	}).resize();

	$(document).on('click', "[data-toggle=fullscreen]", function () {
		if (screenfull.enabled) {
			screenfull.request();
		}
	});

	// fluid layout
	var setHeight = function setHeight() {
		$('.app-fluid #nav > *').css('min-height', $(window).height());
		return true;
	};
	setHeight();

	// fix vbox
	var fixVbox = function fixVbox() {
		$('.ie11 .vbox').each(function () {
			$(this).height($(this).parent().height());
		});
	};
	fixVbox();

	// collapse nav
	$(document).on('click', '.nav-primary a', function (e) {
		var $this = $(e.target),
		    $active = void 0;
		$this.is('a') || ($this = $this.closest('a'));
		if ($('.nav-vertical').length) {
			return;
		}

		$active = $this.parent().siblings(".active");
		$active && $active.find('> a').toggleClass('active') && $active.toggleClass('active').find('> ul:visible').slideUp(200);

		$this.hasClass('active') && $this.next().slideUp(200) || $this.next().slideDown(200);
		$this.toggleClass('active').parent().toggleClass('active');

		$this.next().is('ul') && e.preventDefault();

		setTimeout(function () {
			$(document).trigger('updateNav');
		}, 300);
	});
	// dropdown still
	$(document).on('click.bs.dropdown.data-api', '.dropdown .on, .dropup .on', function (e) {
		e.stopPropagation();
	});
	// slim-scroll
	var initSlim = function initSlim() {
		var $self = $(this),
		    $data = $self.data(),
		    $slimResize = void 0;
		$self.slimScroll($data);
		$(window).resize(function () {
			clearTimeout($slimResize);
			$slimResize = setTimeout(function () {
				$self.slimScroll($data);
			}, 500);
		});

		$(document).on('updateNav', function () {
			$self.slimScroll($data);
		});
	};
	$('.no-touch .slim-scroll').each(initSlim);
	$('body').on('wulaui.widgets.init', '.wulaui', function () {
		$(this).find('.no-touch .slim-scroll').each(initSlim);
	});
})(window.jQuery);
// ajax.js
(function ($) {
	"use strict";

	var wulajax = $.wulajax = $.ajax;
	// 重写ajax
	$.ajax = function (url, options) {
		return wulajax(url, options).done(function (data) {
			//成功啦
			showMsg(data);
			ajaxAction(data);
		});
	};

	//修改默认的ajax行为
	$(document).ajaxSend(function (event, xhr, opts) {
		if (!opts.element) {
			opts.element = $('body');
		} else {
			opts.isElement = true;
		}
		if (opts.isElement) {
			opts.element.data('ajaxSending', true);
		}
		var e = new $.Event('ajax.send');
		e.element = opts.element;
		opts.element.trigger(e, [opts, xhr]);
		if (opts.element.hasClass('data-loading-text')) {
			opts.element.button('loading');
		}
		xhr.setRequestHeader('X-AJAX-TYPE', opts.dataType);
	});

	$(document).ajaxError(function (event, xhr, opts, error) {
		$.wulaUI.loadingBar.error();
		var e = $.Event('ajax.error');
		opts.element.trigger(e, [opts, error, xhr]);
		if (!e.isDefaultPrevented()) {
			//处理错误
			switch (xhr.status) {
				case 500:
					var text = xhr.responseText;
					deal500({
						message: function (t) {
							t = t.substr(0, t.indexOf('</body>'));
							t = t.substr(t.indexOf('>', t.indexOf('<body')) + 1);
							return t;
						}(text)
					});
					break;
				case 401:
				case 403:
				case 404:
				default:
					$.notify({
						title: $.lang.core.error,
						message: '<br/>' + xhr.statusText
					}, {
						type: 'danger',
						z_index: 9000,
						placement: {
							from: "top",
							align: "right"
						}
					});
			}
		}
	});

	$(document).ajaxSuccess(function (event, xhr, opts, data) {
		$.wulaUI.loadingBar.success();
		opts.element.trigger('ajax.success', [data, opts, xhr]);
	});

	$(document).ajaxComplete(function (event, xhr, opts) {
		opts.element.data('ajaxSending', false);
		if (opts.element.hasClass('data-loading-text')) {
			opts.element.button('reset');
		}
		var e = new $.Event(ajax.done);
		e.element = opts.element;
		opts.element.trigger(e, [opts, xhr]);
	});
	// 全局设置
	$.ajaxSetup({
		cache: false,
		timeout: 900000
	});

	// ajax 请求
	var doAjaxRequest = function doAjaxRequest(e) {
		e.preventDefault();
		e.stopPropagation();
		var $this = $(this);
		if ($this.data('ajaxSending')) {
			return;
		}
		// ajax before,用户处理此事件做数据校验.
		var event = $.Event('ajax.before');
		event.element = $this;
		$this.trigger(event);
		if (!event.isDefaultPrevented()) {
			// 生成发起ajax请求的选项.
			var be = $.Event('ajax.build');
			be.opts = $.extend({ element: $this }, $this.data() || {});
			be.opts.url = be.opts.url || $this.attr('href') || $this.attr('action') || '';
			var _ajax = be.opts.ajax || 'get.json';
			delete be.opts.ajax;
			var types = _ajax.split('.');
			be.opts.method = types[0].toUpperCase();
			be.opts.dataType = types.length === 2 ? types[1] : 'json';
			$this.trigger(be);
			if (!be.isDefaultPrevented()) {
				if ($this.data('confirm') !== undefined) {
					var jc = $.confirm({
						content: $this.data('confirm') || '',
						title: $this.data('confirmTitle') || $.lang.core.confirmTile,
						icon: $this.data('confirmIcon') || 'fa fa-question-circle',
						type: $this.data('confirmType') || 'orange',
						theme: $this.data('confirmTheme') || 'material',
						buttons: {
							ok: {
								text: $.lang.core.yes1,
								btnClass: 'btn-blue',
								keys: ['enter', 'a'],
								action: function action() {
									if ($this.data('loading') !== undefined) {
										$this.data('loading', null);
										jc.setTitle('');
										jc.buttons.ok.hide();
										jc.buttons.cancel.hide();
										jc.setIcon('');
										jc.setContent('<i class="fa fa-spinner fa-spin fa-4x" aria-hidden="true"></i>');

										$.ajax(be.opts).always(function () {
											if ($this.data('block') !== undefined) {
												return;
											}
											jc.close();
										});

										return false;
									}
									$.ajax(be.opts);
								}
							},
							cancel: {
								text: $.lang.core.cancel
							}
						}
					});
				} else {
					$.ajax(be.opts);
				}
			}
		}
		return false;
	};
	var deal500 = function deal500(data) {
		$.dialog({
			icon: 'fa fa-warning',
			theme: 'supervan',
			title: '',
			type: 'red',
			content: data.message,
			boxWidth: '80%',
			useBootstrap: false
		});
	};
	var showMsg = function showMsg(data) {
		if (data.message) {
			var notice = true,
			    opts = {};
			if (data.style === 'alert') {
				notice = false;
			}
			switch (data.code) {
				case 500:
					//ERROR
					opts.icon = 'fa fa-warning';
					opts.title = $.lang.core.error;
					if (notice) {
						opts.type = 'danger';
					} else {
						opts.type = 'red';
						opts.content = data.message;
					}
					break;
				case 400:
					//WARNING
					opts.icon = 'fa fa-warning';
					opts.title = $.lang.core.warning;
					if (notice) {
						opts.type = 'warning';
					} else {
						opts.type = 'orange';
						opts.content = data.message;
					}
					break;
				case 300:
					//INFO
					opts.icon = 'fa fa-info-circle';
					opts.title = $.lang.core.info;
					if (notice) {
						opts.type = 'info';
					} else {
						opts.type = 'blue';
						opts.content = data.message;
					}
					break;
				case 200: //SUCCESS
				default:
					opts.icon = 'fa fa-check-square';
					opts.title = $.lang.core.success;
					if (notice) {
						opts.type = 'success';
					} else {
						opts.type = 'green';
						opts.content = data.message;
					}
					break;
			}
			if (notice) {
				opts.z_index = 9000;
				opts.placement = {
					from: "top",
					align: "right"
				};
				$.notify({
					icon: opts.icon,
					title: '<strong>' + opts.title + '</strong>',
					message: data.message
				}, opts);
			} else {
				$.dialog(opts);
			}
		}
	};
	var ajaxAction = function ajaxAction(data) {
		switch (data.action) {
			case 'update':
				break;
			case 'reload':
				break;
			case 'click':
				break;
			case 'redirect':
				var url = data.target;
				if (url) {
					if (url[0] === '#') {
						window.location.hash = url;
					} else {
						window.location.href = url;
					}
				}
				break;
			case 'validate':
				break;
			case 'script':
				break;
			default:
		}
	};
	//页面加载完成时处理
	$(function () {
		$('body').on('click', '[data-ajax]', doAjaxRequest).on('submit', '[data-ajax]', doAjaxRequest);
	});
})(jQuery);
// wulaui.combox
(function ($) {

	$.fn.wulauiCombox = function () {
		return $(this).each(function () {
			var $this = $(this);
			var ipt = $this.find('input');
			$this.find('li').click(function () {
				ipt.val($(this).data('value'));
			});
		});
	};

	//初始化combox
	$(function () {
		$('body').on('wulaui.widgets.init', '.wulaui', function () {
			$(this).find('[data-widget^=combox]').wulauiCombox();
		});
	});
})(jQuery);
(function ($) {
	"use strict";

	$.wulaUI.loadingBar = {
		bar: null,
		process: null,
		init: function init() {
			$('#loading-bar').remove();
			this.bar = $('<div class="loading-bar animated" id="loading-bar">\
				<div class="progress progress-xs">\
				<div class="progress-bar active"></div>\
				</div>\
				</div>');
			this.bar.prependTo('body');
			this.process = this.bar.find('.progress-bar');
		},
		show: function show() {
			this.bar.find('.progress').addClass('progress-striped');
			this.process.removeClass('progress-bar-success progress-bar-danger done').width(0);
			this.bar.removeClass('fadeOut').addClass('fadeIn').show();
			this.process.width('90%');
		},
		error: function error() {
			this.bar.find('.progress').removeClass('progress-striped');
			this.process.addClass('progress-bar-danger done').width('100%');
			this.hide();
		},
		success: function success() {
			this.bar.find('.progress').removeClass('progress-striped');
			this.process.addClass('progress-bar-success done').width('100%');
			this.hide();
		},
		hide: function hide() {
			var me = this;
			setTimeout(function () {
				me.bar.addClass('fadeOut').hide();
			}, 1500);
		}
	};

	//初始化loadingBar
	$(function () {
		var bar = $.wulaUI.loadingBar;
		bar.init();
		$(document).ajaxStart(function () {
			bar.show();
		});
		$(document).ajaxStop(function () {
			bar.hide();
		});
		// block it
		$(document).on('ajax.send', '[data-loading]', function (e) {
			var me = e.element;
			if (me.data('loading') !== undefined && me.data('loading') !== null) {
				var jc = $.dialog({
					title: '',
					type: 'theme',
					theme: me.data('confirmTheme') || 'supervan',
					content: '<i class="fa fa-spinner fa-spin fa-4x" aria-hidden="true"></i>',
					closeIcon: false,
					container: me.data('confirmTarget') || 'body'
				});
				me.data('loading', jc);
			}
		});
		//关闭block
		$(document).on('ajax.done', '[data-loading]', function (e) {
			var me = e.element;
			if (me.data('loading') !== undefined && me.data('loading') !== null) {
				try {
					me.data('loading').close();
				} catch (e) {}
			}
		});
	});
})(jQuery);