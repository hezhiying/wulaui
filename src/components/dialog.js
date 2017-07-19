($ => {
	//页面加载完成时处理
	$(() => {
		$('body').on('click', '[data-dialog]', function () {
			let $this = $(this);
			if ($this.data('dialog')) {
				let content = $($this.data('dialog'));
				if (content.length === 1) {
					let be              = $.Event('build.dialog');
					be.dialogTitle      = $this.data('dialogTitle') || false;
					be.dialogType       = $this.data('dialogType') || 'default';
					be.dialogWidthClass = $this.data('dialogWidthCls') || false;
					be.buttons          = false;
					$this.trigger(be);
					if (!be.isDefaultPrevented()) {
						content  = content.html();
						let opts = {
							title         : be.dialogTitle || false,
							content       : content,
							type          : be.dialogType || 'default',
							closeIcon     : true,
							closeIconClass: 'fa fa-close',
							onContentReady: function () {
								$.wulaUI.initElement($(this.$content));
							},
							onDestroy     : function () {
								$.wulaUI.destroyElement($(this.$content));
							},
							columnClass   : 'medium'
						};
						if (be.dialogWidthClass) {
							opts.columnClass = be.dialogWidthClass;
						}
						if (be.buttons) {
							opts.buttons = be.buttons;
							$.confirm(opts);
						} else {
							$.dialog(opts);
						}
					}
				}
			}
			return false;
		});
	});
})(jQuery);
