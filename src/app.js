if ("undefined" === typeof jQuery) {
	throw new Error("WulaUI's JavaScript requires jQuery");
}
Date.now = Date.now || function () {
		return +new Date;
	};
// wulaUI
(function ($) {
	"use strict";
	$.i18n        = function (source, params) {
		if (arguments.length === 1) {
			return function () {
				let args = $.makeArray(arguments);
				args.unshift(source);
				return $.i18n.apply(this, args);
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
	$.lang        = {
		core: {
			error  : 'Oops!! ',
			warning: 'Warning ',
			success: 'Done ',
			info   : 'Tip '
		}
	};
	$.wulaUI      = {};
	$.wulaUI.init = (opts) => {
		$('body .wulaui').trigger('wulaui.widgets.init');
		return $.wulaUI;
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
		$targets && $targets.length && $.each($targets, function (index) {
			($targets[index] !== '#') && $($targets[index]).toggleClass($classes[index]);
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
		$(this).find('.no-touch .slim-scroll').each(initSlim);
	});
})(window.jQuery);