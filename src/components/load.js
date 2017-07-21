($ => {
	//自动加载
	$.fn.wulauiLoad         = function () {
		return $(this).each((i, e) => {
			let me = $(e), inited = me.data('loaderObj');
			if (!inited) {
				me.data('loaderObj', new doLoad(me));
			}
		})
	};
	$.fn.reload             = function () {
		return $(this).each((i, e) => {
			let inited = $(e).data('loaderObj');
			if (inited) {
				inited.reload();
			}
		})
	};
	const doLoad            = function (element) {
		this.autoload = element.data('auto') !== undefined;
		this.lazy     = element.data('lazy') !== undefined;
		this.element  = element;
		if (this.autoload) {
			this.reload();
		}
	};
	// reload
	doLoad.prototype.reload = function (force) {
		let dirty = this.element.data('dirty'), checkDirty = this.element.data('checkDirty');
		if (dirty && checkDirty !== undefined) {
			let $this = this.element;
			$.confirm({
				content: checkDirty || $.lang.core.changNotSaved,
				title  : $this.data('confirmTitle') || $.lang.core.confirmTile,
				icon   : $this.data('confirmIcon') || 'fa fa-question-circle',
				type   : $this.data('confirmType') || 'orange',
				theme  : $this.data('confirmTheme') || 'material',
				buttons: {
					ok    : {
						text    : $.lang.core.yes1,
						btnClass: 'btn-blue',
						keys    : ['enter', 'a'],
						action() {
							_doLoad.apply(this, [true]);
						}
					},
					cancel: {
						text: $.lang.core.cancel
					}
				}
			});
		} else {
			_doLoad.apply(this, [force]);
		}
	};
	const _doLoad           = function (force) {
		let ourl = this.url ? this.url : '';
		this.url = this.element.data('load');
		if (!this.url || (!force && this.lazy && ourl === this.url)) {
			return;
		}
		let be           = $.Event('ajax.build');
		be.opts          = $.extend({element: this.element}, this.element.data() || {});
		be.opts.url      = this.url;
		be.opts.method   = 'GET';
		be.opts.action   = 'update';
		be.opts.dataType = 'html';
		be.opts.target   = this.element;

		this.element.trigger(be);
		if (!be.isDefaultPrevented()) {
			$.ajax(be.opts);
		}
	};
	$(() => {
		$('body').on('wulaui.widgets.init', '.wulaui', function () {
			$(this).find('[data-load]').wulauiLoad();
		});
	})
})(jQuery);