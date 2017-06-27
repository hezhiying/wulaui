// wulaUI
(function ($) {
	"use strict";
	const storage = window.localStorage;

	$.wulaUI.init = function (opts, load) {

		this.settings = $.extend({}, this.settings, opts || {});

		$('body .wulaui').trigger('wulaui.widgets.init');

		if (this.settings.hash) {
			$(window).on('hashchange', this.load);

			if (window.location.hash && load) {
				this.load();
			} else if ($.wulaUI.settings.home !== '#') {
				window.location.hash = this.settings.home;
			} else {
				$('nav.nav-primary ul li:first').addClass('active');
			}
		}
		return $.wulaUI;
	};

	$.wulaUI.load = function () {
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
			let ca = $('a[href^="#' + url + '"]'), thirdShow = false, id = '';
			if (ca.length) {
				if (ca.length > 1) {
					ca.each((n, e) => {
						let $id = $(e).attr('id');
						if ($id && $id.length > id.length) {
							id = $id;
						}
					});
				} else {
					id = ca.attr('id');
				}
				if (id) {
					let idary = id.split('-'), ids = [id, idary.length > 3 ? idary.slice(0, -1).join('-') : false],
						ida                        = [];
					idary                          = idary.slice(1);

					$('#third-navi-item').find('li').removeClass('active').find('a').removeClass('active');

					$('ul.nav li').find('li').removeClass('active').find('a').removeClass('active');

					for (let j = 0; j < idary.length; j++) {
						ida[j] = idary[j];
						$('#navi-' + ida.join('-')).addClass('active').closest('li').addClass('active');
					}
					if (ca.closest('ul.dropdown-menu').length) {
						ca.removeClass('active').closest('li').removeClass('active');
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
				beforeSend (){
					$("html").animate({
						scrollTop: 0
					}, "fast");
				}
			}).done(data => {
				$('#wulaui-workbench')
					.trigger('wulaui.widgets.destory')
					.html(data)
					.trigger('wulaui.widgets.init');
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
})(jQuery);