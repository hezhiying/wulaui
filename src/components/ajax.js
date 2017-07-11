// ajax.js
($ => {
	"use strict";
	const wulajax = $.wulajax = $.ajax;
	// 重写ajax
	$.ajax = function (url, options) {
		return wulajax(url, options).done(data => {
			if (options.mode === 'abort') {
				return;
			}
			let opts = options || url;
			if (opts.dataType === 'json') {
				showMsg(data);
				ajaxAction(data);
			} else if (opts.action === 'update' && opts.target) {
				ajaxAction({action: 'update', target: opts.target, args: {content: data}});
			}
		});
	};

	//修改默认的ajax行为
	$(document).ajaxSend((event, xhr, opts) => {
		if (!opts.element) {
			opts.element = $('body');
		} else {
			opts.isElement = true;
		}
		if (opts.isElement) {
			opts.element.data('ajaxSending', true);
		}
		let e     = new $.Event('ajax.send');
		e.element = opts.element;
		opts.element.trigger(e, [opts, xhr]);
		if (opts.element.hasClass('data-loading-text')) {
			opts.element.button('loading');
		}
		xhr.setRequestHeader('X-AJAX-TYPE', opts.dataType);
	});

	$(document).ajaxError((event, xhr, opts, error) => {
		$.wulaUI.loadingBar.error();
		let e = $.Event('ajax.error');
		opts.element.trigger(e, [opts, error, xhr]);
		if (!e.isDefaultPrevented()) {
			//处理错误
			switch (xhr.status) {
				case 500:
					deal500({
						message: (t => {
							if (t.indexOf('</body>')) {
								t = t.substr(0, t.indexOf('</body>'));
								t = t.substr(t.indexOf('>', t.indexOf('<body')) + 1);
							}
							return t;
						})(xhr.responseText)
					});
					break;
				case 200:
					//数据类型转换错误
					deal500({
						message: (t => {
							if (t.indexOf('</body>')) {
								t = t.substr(0, t.indexOf('</body>'));
								t = t.substr(t.indexOf('>', t.indexOf('<body')) + 1);
							}
							return t;
						})(xhr.responseText)
					}, $.lang.core.ajaxDataConvertException);
					break;
				case 401:
					showNotice(xhr);
					$(document).trigger('wula.need.login');
					break;
				case 403:
					showNotice(xhr);
					$(document).trigger('wula.perm.denied');
					break;
				case 404:
					showNotice(xhr);
					$(document).trigger('wula.page.404');
					break;
				default:
					showNotice(xhr);
			}
		}
	});

	$(document).ajaxSuccess((event, xhr, opts, data) => {
		$.wulaUI.loadingBar.success();
		opts.element.trigger('ajax.success', [data, opts, xhr]);
	});

	$(document).ajaxComplete((event, xhr, opts) => {
		opts.element.data('ajaxSending', false);
		if (opts.element.hasClass('data-loading-text')) {
			opts.element.button('reset');
		}
		let e     = new $.Event('ajax.done');
		e.element = opts.element;
		opts.element.trigger(e, [opts, xhr]);
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
			return false;
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
			be.opts.dataType = types.length === 2 ? types[1] : 'json';
			let method       = $this.attr('method') || (types[0] ? types[0] : null) || 'GET';
			be.opts.method   = method.toUpperCase();

			if (be.opts.method === 'UPDATE') {
				be.opts.method   = 'GET';
				be.opts.dataType = 'html';
				be.opts.action   = 'update';
				be.opts.target   = $this.attr('target') || $this.data('target');
			}

			$this.trigger(be);
			if (!be.isDefaultPrevented()) {
				if ($this.data('confirm') !== undefined) {
					let jc = $.confirm({
						content: $this.data('confirm') || '',
						title  : $this.data('confirmTitle') || $.lang.core.confirmTile,
						icon   : $this.data('confirmIcon') || 'fa fa-question-circle',
						type   : $this.data('confirmType') || 'orange',
						theme  : $this.data('confirmTheme') || 'material',
						buttons: {
							ok    : {
								text    : $.lang.core.yes1,
								btnClass: 'btn-blue',
								keys    : ['enter', 'a'],
								action(){
									if ($this.data('loading') !== undefined) {
										$this.data('loading', null);
										jc.setTitle('');
										jc.buttons.ok.hide();
										jc.buttons.cancel.hide();
										jc.setIcon('');
										jc.setContent('<i class="fa fa-spinner fa-spin fa-4x" aria-hidden="true"></i>');

										$.ajax(be.opts).always(() => {
											if ($this.data('block') !== undefined) {
												return;
											}
											jc.close();
										});

										return false;
									} else
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
	const deal500       = function (data, title) {
		$.dialog({
			icon        : 'fa fa-warning',
			theme       : 'supervan',
			title       : title ? title : '',
			type        : 'red',
			content     : data.message,
			boxWidth    : '80%',
			useBootstrap: false
		});
	};
	const showMsg       = function (data) {
		if (data.message) {
			let notice = true, opts = {};
			if (data.style === 'alert') {
				notice = false;
			}
			switch (data.code) {
				case 500://ERROR
					opts.icon  = 'fa fa-warning';
					opts.title = $.lang.core.error;
					if (notice) {
						opts.type = 'danger';
					} else {
						opts.type    = 'red';
						opts.content = data.message;
					}
					break;
				case 400://WARNING
					opts.icon  = 'fa fa-warning';
					opts.title = $.lang.core.warning;
					if (notice) {
						opts.type = 'warning';
					} else {
						opts.type    = 'orange';
						opts.content = data.message;
					}
					break;
				case 300://INFO
					opts.icon  = 'fa fa-info-circle';
					opts.title = $.lang.core.info;
					if (notice) {
						opts.type = 'info';
					} else {
						opts.type    = 'blue';
						opts.content = data.message;
					}
					break;
				case 200://SUCCESS
				default:
					opts.icon  = 'fa fa-check-square';
					opts.title = $.lang.core.success;
					if (notice) {
						opts.type = 'success';
					} else {
						opts.type    = 'green';
						opts.content = data.message;
					}
					break;
			}
			if (notice) {
				opts.z_index   = 9000;
				opts.placement = {
					from : "top",
					align: "right"
				};
				$.notify({
					icon   : opts.icon,
					title  : '<strong>' + opts.title + '</strong>',
					message: data.message
				}, opts);
			} else {
				$.dialog(opts);
			}
		}
	};
	const ajaxAction    = (data) => {
		let target;
		switch (data.action) {
			case 'update':
				//更新内容
				target = $(data.target);
				if (target.length && data.args && data.args.content) {
					let append = data.args.append;
					if (append) {
						let d = $(data.args.content);
						target.append(d);
						$.wulaUI.initElement(d);
					} else {
						$.wulaUI.destroyElement(target);
						target.empty().html(data.args.content);
						$.wulaUI.initElement(target);
					}
				}
				break;
			case 'reload':
				//重新加载
				target = $(data.target);
				if (target.length) {
					let loader = target.data('loaderObj');
					try {
						if (loader) {
							loader.reload(null, true);
						}
					} catch (e) {

					}
				}
				break;
			case 'click':
				//点击
				target = $(data.target);
				if (target.length) {
					if (/^#.+/.test(target.attr('href'))) {
						window.location.hash = target.attr('href');
					} else {
						target.click();
					}
				}
				break;
			case 'redirect':
				//重定向
				let url = data.target;
				if (url) {
					if (url[0] === '#') {
						window.location.hash = url;
					} else {
						if (window.location.hash && data.hash) {
							window.location.href = url + window.location.hash;
						} else {
							window.location.href = url;
						}
					}
				}
				break;
			case 'validate':
				//表单验证
				target   = $('form[name="' + data.target + '"]');
				let errs = data.args;
				let obj  = target.data('validateObj');
				if (obj) {
					obj.validate(errs);
				}
				break;
			default:
		}
	};
	const showNotice    = (xhr) => {
		$.notify({
			title  : $.lang.core.error,
			message: '<br/>' + xhr.statusText
		}, {
			type     : 'danger',
			z_index  : 9000,
			placement: {
				from : "top",
				align: "right"
			}
		});
	};
	//页面加载完成时处理
	$(() => {
		$('body').on('click', '[data-ajax]:not(form)', doAjaxRequest).on('submit', 'form[data-ajax]', doAjaxRequest).on('change', 'select[data-ajax]', doAjaxRequest);
	});
})(jQuery);