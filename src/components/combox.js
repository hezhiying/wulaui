// wulaui.combox
($ => {

	$.fn.wulauiCombox = function () {
		return $(this).each(function () {
			const $this = $(this);
			const ipt   = $this.find('input');
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