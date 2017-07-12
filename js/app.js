if ("undefined" === typeof jQuery) {
	throw new Error("WulaUI's JavaScript requires jQuery");
}
Date.now = Date.now || function () {
	return +new Date();
};

(function ($) {
	"use strict";
	// 注册jquery

	if ('function' === typeof define && define.amd) {
		define('jquery', [], function () {
			return $;
		});
	}
	// wulaui
	$.wulaUI = {
		settings: {
			home: '#',
			hash: false,
			appConfig: { ids: [], groups: [] },
			requirejs: {
				baseUrl: '/',
				paths: {}
			}
		}
	};
})(jQuery);

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
			confirmTile: 'Are you sure?',
			changNotSaved: 'Changes you made may not be saved.',
			ajaxDataConvertException: 'Cannot convert response data to expected type.'
		}
	};
})(jQuery);
// ajax.js
(function ($) {
	"use strict";

	var wulajax = $.wulajax = $.ajax;
	// 重写ajax
	$.ajax = function (url, options) {
		return wulajax(url, options).done(function (data) {
			var opts = options || url;
			if (opts.mode === 'abort') {
				return;
			}
			if (opts.dataType === 'json') {
				showMsg(data);
				ajaxAction(data);
			} else if (opts.action === 'update' && opts.target) {
				ajaxAction({ action: 'update', target: opts.target, args: { content: data } });
			}
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
					deal500({
						message: function (t) {
							if (t.indexOf('</body>')) {
								t = t.substr(0, t.indexOf('</body>'));
								t = t.substr(t.indexOf('>', t.indexOf('<body')) + 1);
							}
							return t;
						}(xhr.responseText)
					});
					break;
				case 200:
					//数据类型转换错误
					deal500({
						message: function (t) {
							if (t.indexOf('</body>')) {
								t = t.substr(0, t.indexOf('</body>'));
								t = t.substr(t.indexOf('>', t.indexOf('<body')) + 1);
							}
							return t;
						}(xhr.responseText)
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

	$(document).ajaxSuccess(function (event, xhr, opts, data) {
		$.wulaUI.loadingBar.success();
		opts.element.trigger('ajax.success', [data, opts, xhr]);
	});

	$(document).ajaxComplete(function (event, xhr, opts) {
		opts.element.data('ajaxSending', false);
		if (opts.element.hasClass('data-loading-text')) {
			opts.element.button('reset');
		}
		var e = new $.Event('ajax.done');
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
			return false;
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
			be.opts.dataType = types.length === 2 ? types[1] : 'json';
			var method = $this.attr('method') || (types[0] ? types[0] : null) || 'GET';
			be.opts.method = method.toUpperCase();

			if (be.opts.method === 'UPDATE') {
				be.opts.method = 'GET';
				be.opts.dataType = 'html';
				be.opts.action = 'update';
				be.opts.target = $this.attr('target') || $this.data('target');
			}

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
									} else $.ajax(be.opts);
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
	var deal500 = function deal500(data, title) {
		$.dialog({
			icon: 'fa fa-warning',
			theme: 'supervan',
			title: title ? title : '',
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
		var target = void 0;
		switch (data.action) {
			case 'update':
				//更新内容
				target = $(data.target);
				if (target.length && data.args && data.args.content) {
					var append = data.args.append;
					if (append) {
						var d = $(data.args.content);
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
					var loader = target.data('loaderObj');
					try {
						if (loader) {
							loader.reload(null, true);
						}
					} catch (e) {}
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
				var url = data.target;
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
				target = $('form[name="' + data.target + '"]');
				var errs = data.args;
				var obj = target.data('validateObj');
				if (obj) {
					obj.validate(errs);
				}
				break;
			default:
		}
	};
	var showNotice = function showNotice(xhr) {
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
	};
	//页面加载完成时处理
	$(function () {
		$('body').on('click', '[data-ajax]:not(form)', doAjaxRequest).on('submit', 'form[data-ajax]', doAjaxRequest).on('change', 'select[data-ajax]', doAjaxRequest);
	});
})(jQuery);
// wulaui.combox
(function ($) {

	$.fn.wulauiCombox = function () {
		return $(this).each(function (i, e) {
			var $this = $(e),
			    inited = $this.data('comboxObj');
			if (inited) {
				return;
			}
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
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function ($) {
	var prepareValidateRule = function prepareValidateRule(rules) {
		if ('object' !== (typeof rules === 'undefined' ? 'undefined' : _typeof(rules))) {
			rules = $.parseJSON(rules);
		}
		if (rules.rules) {
			for (var i in rules.rules) {
				for (var j in rules.rules[i]) {
					if (j == 'pattern') {
						eval('var rule = ' + rules.rules[i][j] + ';');
						rules.rules[i][j] = rule;
					}
				}
			}
		}
		return rules;
	};

	var Validator = function Validator(form) {

		this.form = form;
		this.rules = prepareValidateRule(form.data('validate'));
		var name = form.attr('name');
		this.rules.onsubmit = false;
		this.rules.errorClass = 'parsley-error';
		this.rules.validClass = 'parsley-success';
		this.rules.wrapper = 'ul';
		this.rules.wrapperClass = 'parsley-error-list';
		this.rules.errorElement = 'li';
		this.validator = form.validate(this.rules);
		var me = this;
		form.on('ajax.before', function () {
			return me.validate();
		});

		//注册销毁事件
		form.closest('.wulaui').on('wulaui.widgets.destroy', this.destroy);
	};

	Validator.prototype.validate = function (errors) {
		if (!this.validator) {
			return false;
		}
		if (this.validator.form()) {
			if (errors) {
				this.validator.showErrors(errors);
				return;
			}
			if (this.validator.pendingRequest) {
				this.validator.formSubmitted = true;
				return false;
			}
		}
		return this.form.valid();
	};

	Validator.prototype.destroy = function () {
		if (this.validator) {
			this.validator.destroy();
			this.validator = null;
		}
	};

	$.fn.wulaform = function () {
		var me = $(this);
		if (me.length) {
			requirejs(['validator'], function () {
				me.each(function () {
					var $this = $(this);
					if (!$this.data('validateObj')) {
						$this.data('validateObj', new Validator($this));
					}
				});
			});
		}
		return me;
	};

	$(function () {
		$(document).on('ajax.build', 'form[data-ajax]', function (e) {
			e.opts.data = $(this).serializeArray();
		}).on('wulaui.widgets.init', '.wulaui', function () {
			$(this).find('form[data-validate]').wulaform();
		});
	});
})(jQuery);
(function ($) {
	//自动加载
	$.fn.wulauiLoad = function () {
		return $(this).each(function (i, e) {
			var me = $(e),
			    inited = me.data('loaderObj');
			if (!inited) {
				me.data('loaderObj', new doLoad(me));
			}
		});
	};
	$.fn.reload = function () {
		return $(this).each(function (i, e) {
			var inited = $(e).data('loaderObj');
			if (inited) {
				inited.reload();
			}
		});
	};
	var doLoad = function doLoad(element) {
		this.autoload = element.data('auto') !== undefined;
		this.lazy = element.data('lazy') !== undefined;
		this.element = element;
		if (this.autoload) {
			this.reload();
		}
	};
	// reload
	doLoad.prototype.reload = function () {
		var dirty = this.element.data('dirty'),
		    checkDirty = this.element.data('checkDirty');
		if (dirty && checkDirty !== undefined) {
			var $this = this.element;
			$.confirm({
				content: checkDirty || $.lang.core.changNotSaved,
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
							_doLoad.apply(this);
						}
					},
					cancel: {
						text: $.lang.core.cancel
					}
				}
			});
		} else {
			_doLoad.apply(this);
		}
	};
	var _doLoad = function _doLoad() {
		var ourl = this.url ? this.url : '';
		this.url = this.element.data('load');
		if (!this.url || this.lazy && ourl === this.url) {
			return;
		}
		var be = $.Event('ajax.build');
		be.opts = $.extend({ element: this.element }, this.element.data() || {});
		be.opts.url = this.url;
		be.opts.method = 'GET';
		be.opts.action = 'update';
		be.opts.dataType = 'html';
		be.opts.target = this.element;

		this.element.trigger(be);
		if (!be.isDefaultPrevented()) {
			$.ajax(be.opts);
		}
	};
	$(function () {
		$('body').on('wulaui.widgets.init', '.wulaui', function () {
			$(this).find('[data-load]').wulauiLoad();
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
				var jc = void 0;
				if (me.data('loading')) {
					jc = {
						close: function close() {}
					};
					var target = $(me.data('loading'));
					$.wulaUI.destroyElement(target);
					target.html('<p class="text-center m-xs"><i class="fa fa-spinner fa-spin fa-3x"></i></p>');
				} else {
					jc = $.dialog({
						title: '',
						type: 'theme',
						theme: me.data('loadingTheme') || 'supervan',
						content: '<i class="fa fa-spinner fa-spin fa-4x" aria-hidden="true"></i>',
						closeIcon: false,
						container: me.data('target') || 'body'
					});
				}
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
(function ($) {
	$.fn.wulatree = function () {
		return $(this).each(function () {
			var me = $(this);
			if (!me.data('treeObj')) {
				me.data('treeObj', new WulaTree(me));
			}
		});
	};
	$.fn.wulatreeLoad = function () {
		return $(this).each(function () {
			var treeObj = $(this).data('treeObj');
			if (treeObj) {
				$(this).trigger('ztree.setting.load');
			}
		});
	};
	$.fn.wulatreed = function () {
		return $(this).each(function () {
			var treeObj = $(this).data('treeObj');
			if (treeObj) {
				$(this).data('treeObj', null);
				treeObj.destroy();
			}
		});
	};
	var WulaTree = function WulaTree(element) {
		var me = this;
		this.settings = {
			view: {},
			callback: {},
			edit: {
				drap: {}
			},
			data: {
				keep: {},
				key: {},
				simpleData: {}
			},
			check: {}
		};
		this.url = element.data('ztree');
		this.lazy = element.data('lazy') !== undefined;
		if (this.url) {
			this.settings.async = {
				enable: true,
				url: this.url,
				type: 'get',
				dataType: 'json',
				autoParam: ["id"]
			};
		}

		element.on('ztree.setting.load', function () {
			var e = $.Event('ztree.init');
			e.tree = me;
			element.trigger(e);
			me.settings = e.tree.settings;
			me.nodes = e.tree.nodes;
			if (!e.isDefaultPrevented()) {
				me.treeObj = $.fn.zTree.init(element, me.settings, me.nodes);
				element.trigger('ztree.inited', [me.treeObj]);
			}
			element.off('ztree.setting.load');
		}).closest('.wulaui').on('wulaui.widgets.destroy', me.destroy);

		if (!this.lazy) {
			element.trigger('ztree.setting.load');
		}
	};
	WulaTree.prototype.destroy = function () {
		if (this.treeObj) {
			this.treeObj.destroy();
			delete this.treeObj;
		}
	};
	$(function () {
		$('body').on('wulaui.widgets.init', '.wulaui', function () {
			$(this).find('[data-ztree]').wulatree();
		});
	});
})(jQuery);
// wulaUI
(function ($) {
	"use strict";

	var storage = window.localStorage;
	$.wulaUI.init = function (opts, load) {
		this.settings = $.extend(true, this.settings, opts || {});
		//init requirejs
		if (this.settings.appConfig.ids) {
			for (var i in this.settings.appConfig.ids) {
				this.settings.requirejs.paths[i] = this.settings.appConfig.ids[i];
			}
		}
		if (window.requirejs) {
			requirejs.config(this.settings.requirejs);
		}
		$('body .wulaui').trigger('wulaui.widgets.init');

		if (this.settings.hash) {
			$(window).on('hashchange', this.load);

			if (window.location.hash && load) {
				this.load();
			} else if ($.wulaUI.settings.home !== '#') {
				window.location.hash = this.settings.home;
			} else if ($('nav.nav-primary ul li.active').length === 0) {
				$('nav.nav-primary ul.nav li:first').addClass('active');
			}
		}
		$('body').trigger('wulaui.ready');
		return $.wulaUI;
	};

	window.wulapp = $.wulaUI.app = function (url, hash) {
		if (typeof url === "string") {
			var config = this.settings.appConfig;
			var chunks = url.split('/');
			if (chunks[0].match(/^([~!@#%\^&\*])(.+)$/)) {
				var id = RegExp.$2,
				    prefix = RegExp.$1;
				if (config.ids && config.ids[id]) {
					id = config.ids[id];
				}
				if (config.groups && config.groups.char) {
					for (var i = 0; i < config.groups.char.length; i++) {
						if (config.groups.char[i] === prefix) {
							prefix = config.groups.prefix[i];
							break;
						}
					}
				}
				chunks[0] = prefix + id;
			} else {
				var _id = chunks[0];
				if (config.ids && config.ids[_id]) {
					_id = config.ids[_id];
					chunks[0] = _id;
				}
			}
			chunks[0] = (hash ? '#' : '') + config.base + chunks[0];
			url = chunks.join('/');
		}
		return url;
	};

	$.wulaUI.initElement = function (e) {
		if (e.hasClass('wulaui')) {
			e.trigger('wulaui.widgets.init');
		} else {
			e.children('.wulaui').trigger('wulaui.widgets.init');
		}
	};
	$.wulaUI.destroyElement = function (e) {
		if (e.hasClass('wulaui')) {
			e.trigger('wulaui.widgets.destroy');
		}
		e.find('.wulaui').trigger('wulaui.widgets.destroy');
	};
	$.wulaUI.load = function () {
		var url = location.href.split('#').splice(1).join('#');
		if (!url) {
			// BEGIN: IE11 Work Around
			try {
				var documentUrl = window.document.URL;
				if (documentUrl) {
					if (documentUrl.indexOf('#', 0) > 0 && documentUrl.indexOf('#', 0) < documentUrl.length + 1) {
						url = documentUrl.substring(documentUrl.indexOf('#', 0) + 1);
					}
				}
			} catch (err) {}
		}
		if (!url && storage) {
			url = storage.getItem('dashboard-cp-url');
			if (url) {
				url = url.replace(/^#+/gm, '#');
				if (url.indexOf('#') === 0) {
					location.href = location.href + url;
				} else {
					location.href = location.href + '#' + url;
				}
				return;
			}
		}
		if (url) {
			var ca = $('a[href="#' + url + '"]'),
			    thirdShow = false,
			    id = '',
			    target = null,
			    useTarget = true;
			if (!ca.length) {
				var urls = url.split('/'),
				    $i = -1,
				    tmpa = urls.slice(0, $i);
				useTarget = false;
				while (tmpa.length > 1) {
					var url1 = tmpa.join('/');
					ca = $('a[href="#' + url1 + '"]');
					if (!ca.length) {
						ca = $('a[href="#' + url1 + '/"]');
					} else {
						break;
					}
					tmpa = urls.slice(0, --$i);
				}
			}
			if (ca.length) {
				if (ca.length > 1) {
					ca.each(function (n, e) {
						var $id = $(e).attr('id');
						if ($id && $id.length > id.length) {
							id = $id;
							target = $(e).attr('target') || $(e).data('target');
						}
					});
				} else {
					id = ca.attr('id');
					target = ca.attr('target') || ca.data('target');
				}
				if (id) {
					var idary = id.split('-'),
					    ids = [id, idary.length > 3 ? idary.slice(0, -1).join('-') : false],
					    ida = [];
					idary = idary.slice(1);

					$('ul.nav').find('li').removeClass('active').find('a').removeClass('active');

					for (var j = 0; j < idary.length; j++) {
						ida[j] = idary[j];
						var na = $('#navi-' + ida.join('-'));
						if (na.closest('ul.dropdown-menu').length === 0) {
							na.addClass('active').closest('li').addClass('active');
						}
						if ($width < 1024 && na.data('hideNavi') !== undefined) {
							$('#toggle-navi').not('.active').click();
						}
					}
					//extends third navi menu
					$.each(ids, function (i, e) {
						if (thirdShow || !e) {
							return;
						}
						var third = $('#' + e + '-sub');
						if (third.length) {
							$("#third-menu-name").text(third.data('name'));
							$('#third-navi-item').find('ul').not(third).addClass('hide');
							third.removeClass('hide');
							thirdShow = true;
						}
					});
				}
			}
			if (thirdShow) {
				$('#third-navi').removeClass('hide');
			} else {
				$('#third-navi').addClass('hide');
			}
			$.ajax(url, {
				type: "GET",
				dataType: 'html',
				cache: true,
				beforeSend: function beforeSend() {
					$("html").animate({
						scrollTop: 0
					}, "fast");
				}
			}).done(function (data) {
				var wb = useTarget && target ? $(target) : $('#wulaui-workbench');
				$.wulaUI.destroyElement(wb);
				wb.empty().html(data);
				$.wulaUI.initElement(wb);
			});
		}
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
		if ($('html').hasClass('no-touch')) {
			$(this).find('.slim-scroll').each(initSlim);
		}
	});
})(jQuery);