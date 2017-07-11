// wulaui.combox
($ => {

	$.fn.wulauiCombox = function () {
		return $(this).each(function (i, e) {
			const $this = $(e), inited = $this.data('comboxObj');
			if (inited) {
				return;
			}
			const ipt = $this.find('input');
			$this.find('li').click(function () {
				ipt.val($(this).data('value'));
			});
		});
	};

	//初始化combox
	$(() => {
		$('body').on('wulaui.widgets.init', '.wulaui', function () {
			$(this).find('[data-widget^=combox]').wulauiCombox();
		});
	})

})(jQuery);