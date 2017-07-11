($ => {
	"use strict";
	$.wulaUI.loadingBar = {
		bar    : null,
		process: null,
		init() {
			$('#loading-bar').remove();
			this.bar = $('<div class="loading-bar animated" id="loading-bar">\
				<div class="progress progress-xs">\
				<div class="progress-bar active"></div>\
				</div>\
				</div>');
			this.bar.prependTo('body');
			this.process = this.bar.find('.progress-bar')
		},
		show(){
			this.bar.find('.progress').addClass('progress-striped');
			this.process.removeClass('progress-bar-success progress-bar-danger done').width(0);
			this.bar.removeClass('fadeOut').addClass('fadeIn').show();
			this.process.width('90%')
		},
		error(){
			this.bar.find('.progress').removeClass('progress-striped');
			this.process.addClass('progress-bar-danger done').width('100%');
			this.hide()
		},
		success(){
			this.bar.find('.progress').removeClass('progress-striped');
			this.process.addClass('progress-bar-success done').width('100%');
			this.hide()
		},
		hide(){
			let me = this;
			setTimeout(function () {
				me.bar.addClass('fadeOut').hide();
			}, 1500)
		}
	};

	//初始化loadingBar
	$(() => {
		const bar = $.wulaUI.loadingBar;
		bar.init();
		$(document).ajaxStart(() => {
			bar.show();
		});
		$(document).ajaxStop(() => {
			bar.hide();
		});
		// block it
		$(document).on('ajax.send', '[data-loading]', function (e) {
			let me = e.element;
			if (me.data('loading') !== undefined && me.data('loading') !== null) {
				let jc;
				if (me.data('loading')) {
					jc         = {
						close() {
						}
					};
					let target = $(me.data('loading'));
					$.wulaUI.destroyElement(target);
					target.html('<p class="text-center m-xs"><i class="fa fa-spinner fa-spin fa-3x"></i></p>');
				} else {
					jc = $.dialog({
						title    : '',
						type     : 'theme',
						theme    : me.data('loadingTheme') || 'supervan',
						content  : '<i class="fa fa-spinner fa-spin fa-4x" aria-hidden="true"></i>',
						closeIcon: false,
						container: me.data('target') || 'body'
					});
				}
				me.data('loading', jc);
			}
		});
		//关闭block
		$(document).on('ajax.done', '[data-loading]', function (e) {
			let me = e.element;
			if (me.data('loading') !== undefined && me.data('loading') !== null) {
				try {
					me.data('loading').close();
				} catch (e) {
				}
			}
		});
	});
})(jQuery);