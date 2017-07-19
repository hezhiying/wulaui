($ => {

	$.fn.wulapopmenu = function () {
		return $(this).each((i, e) => {
			let me = $(e), inited = me.data('popMenuObj');
			if (!inited) {
				me.data('popMenuObj', new popMenu(me));
			}
		})
	};

	const popMenu = function (element) {
		this.target = element.data('popMenu');
		this.arg    = element.data('popArg') || 'id';
		let me      = this;
		if (this.target) {
			element.children('[data-id]').hover(function () {
				let $this = $(this), toolbar = $this.data('popmenu'), id = $this.data('id');
				if (!toolbar) {
					toolbar = $(me.target).clone(true);
					$this.data('popmenu', toolbar);
					toolbar.css({
						'position': 'absolute',
						'right'   : 5,
						'bottom'  : 5,
						'padding' : 0,
						'margin'  : 0
					}).find('[data-ajax]').on('ajax.build', function (e) {
						if (e.opts && e.opts.url)
							e.opts.url = e.opts.url + (e.opts.url.indexOf('?') > 0 ? '&' : '?') + me.arg + '=' + id;
					});
					toolbar.appendTo($this);
				}
				toolbar.show();
				return false;
			}, function () {
				let $this = $(this), popMenu = $this.data('popmenu');
				if (popMenu) {
					popMenu.hide();
				}
				return false;
			});
		}
	};

	$(() => {
		$('body').on('wulaui.widgets.init', '.wulaui', function () {
			$(this).find('[data-pop-menu]').wulapopmenu();
		});
	})
})(jQuery);