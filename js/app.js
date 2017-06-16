if ("undefined" == typeof jQuery) {
	throw new Error("WulaUI's JavaScript requires jQuery");
}
// wulaUI
(function ($) {
	"use strict";

	$.wulaUI = {};
	$.wulaUI.init = function (opts) {
		$('body .wulaui').trigger('wulaui.widgets.init');
	};
	//处理窗口大小改变
	$(window).resize(function () {
		$(this).trigger('wulaui.layout');
		return false;
	}).resize();
})(jQuery);
// ajax.js
(function ($) {
	"use strict";

	var wulajax = $.wulajax = $.ajax;
	// 重写ajax
	$.ajax = function (url, options) {
		return wulajax(url, options).done(function (data) {
			//成功啦
			console.log(data);
		}).fail(function (e, e1, e2, e3) {
			//失败啦
			console.log(e2);
		});
	};

	//修改默认的ajax行为
	$(document).ajaxSend(function (event, xhr, opts) {
		if (!opts.element) {
			opts.element = $('body');
		} else {
			opts.isElement = true;
		}
		var e = $.Event('ajax.confirm');
		e.opts = opts;
		opts.element.trigger(e);
		if (e.isDefaultPrevented()) {
			e.preventDefault();
			return false;
		}
		if (opts.isElement) {
			opts.element.data('ajaxSending', true);
		}
		opts.element.trigger('ajax.send');
		xhr.setRequestHeader('X-AJAX-TYPE', opts.dataType);
	});

	$(document).ajaxError(function (event, xhr, opts, error) {
		$.wulaUI.loadingBar.error();
		var e = $.Event('ajax.error');
		opts.element.trigger(e, [xhr, error, opts]);
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
					break;
				case 403:
					break;
				case 404:
					break;
			}
		}
	});

	$(document).ajaxSuccess(function (event, xhr, opts, data) {
		$.wulaUI.loadingBar.success();
		opts.element.trigger('ajax.success', [xhr, data, opts]);
	});

	$(document).ajaxComplete(function (event, xhr, opts) {
		opts.element.data('ajaxSending', false);
		opts.element.trigger('ajax.done', [xhr, opts]);
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
			var ajax = be.opts.ajax || 'get.json';
			delete be.opts.ajax;
			var types = ajax.split('.');
			be.opts.method = types[0];
			be.opts.dataType = types.length === 2 ? types[1] : 'json';
			$this.trigger(be);
			if (!be.isDefaultPrevented()) {
				$.ajax(be.opts);
			}
		}
		return false;
	};
	var deal500 = function deal500(data) {
		$.dialog({
			theme: 'supervan',
			title: '',
			content: data.message,
			boxWidth: '80%',
			useBootstrap: false
		});
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
	});
})(jQuery);