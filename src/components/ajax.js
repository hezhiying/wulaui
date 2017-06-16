// ajax.js
($ => {
	"use strict";
	const wulajax = $.wulajax = $.ajax;
	// 重写ajax
	$.ajax = function (url, options) {
		return wulajax(url, options).done(data => {
			//成功啦
			console.log(data)
		}).fail((e, e1, e2, e3) => {
			//失败啦
			console.log(e2)
		});
	};

	//修改默认的ajax行为
	$(document).ajaxSend((event, xhr, opts) => {
		if (!opts.element) {
			opts.element = $('body');
		} else {
			opts.isElement = true;
		}
		let e  = $.Event('ajax.confirm');
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

	$(document).ajaxError((event, xhr, opts, error) => {
		$.wulaUI.loadingBar.error();
		let e = $.Event('ajax.error');
		opts.element.trigger(e, [xhr, error, opts]);
		if (!e.isDefaultPrevented()) {
			//处理错误
			switch (xhr.status) {
				case 500:
					let text = xhr.responseText;
					deal500({
						message: (t => {
							t = t.substr(0, t.indexOf('</body>'));
							t = t.substr(t.indexOf('>', t.indexOf('<body')) + 1);
							return t;
						})(text)
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

	$(document).ajaxSuccess((event, xhr, opts, data) => {
		$.wulaUI.loadingBar.success();
		opts.element.trigger('ajax.success', [xhr, data, opts]);
	});

	$(document).ajaxComplete((event, xhr, opts) => {
		opts.element.data('ajaxSending', false);
		opts.element.trigger('ajax.done', [xhr, opts]);
	});
	// 全局设置
	$.ajaxSetup({
		cache  : false,
		timeout: 900000
	});

	// ajax 请求
	const doAjaxRequest = function (e) {
		e.preventDefault();
		e.stopPropagation();
		let $this = $(this);
		if ($this.data('ajaxSending')) {
			return;
		}
		// ajax before,用户处理此事件做数据校验.
		let event     = $.Event('ajax.before');
		event.element = $this;
		$this.trigger(event);
		if (!event.isDefaultPrevented()) {
			// 生成发起ajax请求的选项.
			let be      = $.Event('ajax.build');
			be.opts     = $.extend({element: $this}, $this.data() || {});
			be.opts.url = be.opts.url || $this.attr('href') || $this.attr('action') || '';
			let ajax    = be.opts.ajax || 'get.json';
			delete be.opts.ajax;
			let types        = ajax.split('.');
			be.opts.method   = types[0];
			be.opts.dataType = types.length === 2 ? types[1] : 'json';
			$this.trigger(be);
			if (!be.isDefaultPrevented()) {
				$.ajax(be.opts);
			}
		}
		return false;
	};
	const deal500       = function (data) {
		$.dialog({
			theme       : 'supervan',
			title       : '',
			content     : data.message,
			boxWidth    : '80%',
			useBootstrap: false
		});
	};
	//页面加载完成时处理
	$(() => {
		$('body').on('click', '[data-ajax]', doAjaxRequest).on('submit', '[data-ajax]', doAjaxRequest);
	});
})(jQuery);