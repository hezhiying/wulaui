// wulaUI
(function ($) {
	"use strict";
	const storage = window.localStorage;
	$.wulaUI.init = function (opts, load) {
		this.settings = $.extend(true, this.settings, opts || {});
		//init requirejs
		if (this.settings.appConfig.ids) {
			for (let i in this.settings.appConfig.ids) {
				this.settings.requirejs.paths[i] = this.settings.appConfig.ids[i];
			}
		}
		if (window.requirejs) {
			if (this.settings.mode !== 'pro') {
				this.settings.requirejs.urlArgs = "_=" + (new Date()).getTime()
			}
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
		if (typeof(url) === "string") {
			let config = $.wulaUI.settings.appConfig;
			let chunks = url.split('/');

			if (chunks[0].match(/^([~!@#%\^&\*])(.+)$/)) {
				let id     = RegExp.$2,
					prefix = RegExp.$1;
				if (config.ids && config.ids[id]) {
					id = config.ids[id];
				}
				if (config.groups && config.groups.char) {
					for (let i = 0; i < config.groups.char.length; i++) {
						if (config.groups.char[i] === prefix) {
							prefix = config.groups.prefix[i];
							break;
						}
					}
				}
				chunks[0] = prefix + id;
			} else {
				let id = chunks[0];
				if (config.ids && config.ids[id]) {
					id        = config.ids[id];
					chunks[0] = id;
				}
			}
			chunks[0] = (hash ? '#' : '') + config.base + chunks[0];
			url       = chunks.join('/');
		}
		return url;
	};

	$.wulaUI.initElement    = function (e) {
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
	$.wulaUI.load           = function () {
		let url = location.href.split('#').splice(1).join('#');
		if (!url) {// BEGIN: IE11 Work Around
			try {
				let documentUrl = window.document.URL;
				if (documentUrl) {
					if (documentUrl.indexOf('#', 0) > 0
						&& documentUrl.indexOf('#', 0) < (documentUrl.length + 1)) {
						url = documentUrl.substring(documentUrl.indexOf('#', 0) + 1);
					}
				}
			} catch (err) {
			}
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
			let ca = $('a[href="#' + url + '"]'), thirdShow = false, id = '', target = null, useTarget = true;
			if (!ca.length) {
				let urls  = url.split('/'), $i = -1, tmpa = urls.slice(0, $i);
				useTarget = false;
				while (tmpa.length > 1) {
					let url1 = tmpa.join('/');
					ca       = $('a[href="#' + url1 + '"]');
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
					ca.each((n, e) => {
						let $id = $(e).attr('id');
						if ($id && $id.length > id.length) {
							id     = $id;
							target = $(e).attr('target') || $(e).data('target');
						}
					});
				} else {
					id     = ca.attr('id');
					target = ca.attr('target') || ca.data('target');
				}
				if (id) {
					let idary = id.split('-'), ids = [id, idary.length > 3 ? idary.slice(0, -1).join('-') : false],
						ida                        = [];
					idary                          = idary.slice(1);

					$('ul.nav').find('li').removeClass('active').find('a').removeClass('active');

					for (let j = 0; j < idary.length; j++) {
						ida[j] = idary[j];
						let na = $('#navi-' + ida.join('-'));
						if (na.closest('ul.dropdown-menu').length === 0) {
							na.addClass('active').closest('li').addClass('active');
						}
						if ($width < 1024 && na.data('hideNavi') !== undefined) {
							$('#toggle-navi').not('.active').click();
						}
					}
					//extends third navi menu
					$.each(ids, (i, e) => {
						if (thirdShow || !e) {
							return;
						}
						let third = $('#' + e + '-sub');
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
				type    : "GET",
				dataType: 'html',
				cache   : true,
				beforeSend() {
					$("html").animate({
						scrollTop: 0
					}, "fast");
				}
			}).done(data => {
				let wb = (useTarget && target) ? $(target) : $('#wulaui-workbench');
				$.wulaUI.destroyElement(wb);
				wb.empty().html(data);
				$.wulaUI.initElement(wb);
			});
		}
	};
	// class
	$(document).on('click', '[data-toggle^="class"]', function (e) {
		e && e.preventDefault();
		let $this = $(e.target), $class, $target, $tmp, $classes, $targets;
		!$this.data('toggle') && ($this = $this.closest('[data-toggle^="class"]'));
		$class  = $this.data()['toggle'];
		$target = $this.data('target') || $this.attr('href');
		$class && ($tmp = $class.split(':')[1]) && ($classes = $tmp.split(','));
		$target && ($targets = $target.split(','));
		$targets && $targets.length && $.each($targets, function (index, e) {
			(e !== '#') && $(e).toggleClass($classes[index]);
		});
		$this.toggleClass('active');
	});
	let $window = $(window);
	// mobile
	let mobile  = function (option) {
		if (option === 'reset') {
			$('[data-toggle^="shift"]').shift('reset');
		} else {
			$('[data-toggle^="shift"]').shift('init');
		}
		return true;
	};
	// unmobile
	$window.width() < 768 && mobile();
	let $resize, $width = $window.width();
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
	const setHeight = function () {
		$('.app-fluid #nav > *').css('min-height', $(window).height());
		return true;
	};
	setHeight();
	// fix vbox
	const fixVbox = function () {
		$('.ie11 .vbox').each(function () {
			$(this).height($(this).parent().height());
		});
	};
	fixVbox();
	// collapse nav
	$(document).on('click', '.nav-primary a', function (e) {
		let $this = $(e.target), $active;
		$this.is('a') || ($this = $this.closest('a'));
		if ($('.nav-vertical').length) {
			return;
		}

		$active = $this.parent().siblings(".active");
		$active && $active.find('> a').toggleClass('active') && $active.toggleClass('active').find('> ul:visible').slideUp(200);

		($this.hasClass('active') && $this.next().slideUp(200)) || $this.next().slideDown(200);
		$this.toggleClass('active').parent().toggleClass('active');

		$this.next().is('ul') && e.preventDefault();

		setTimeout(function () {
			$(document).trigger('updateNav');
		}, 300);
	});
	// dropdown still
	$(document).on('click.bs.dropdown.data-api', '.dropdown .on, .dropup .on', function (e) {
		e.stopPropagation()
	});
	// slim-scroll
	const initSlim = function () {
		let $self = $(this), $data = $self.data(), $slimResize;
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