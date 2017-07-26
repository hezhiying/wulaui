($ => {
	const locale =  {
		format: 'YYYY-MM-DD',
		applyLabel:'确定',
		cancelLabel:'取消',
		customRangeLabel:'自定义',
		daysOfWeek: ["日", "一", "二", "三", "四", "五", "六" ],
		monthNames: ["一月","二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月" ],
	};

	$.fn.wulauiDateRange = function () {
		return $(this).each(function (i, e) {
			const $this = $(e), inited = $this.data('dateRangeObj');
			if (inited) {
				return;
			}
			$this.daterangepicker({
				locale: locale,
				"dateLimit": {
					"days": 70
				},
				showCustomRangeLabel:true,
				ranges: {
					'今天': [moment(), moment()],
					'昨天': [moment().subtract('days', 1), moment().subtract('days', 1)],
					'最近7天': [moment().subtract('days', 6), moment()],
					'最近30天': [moment().subtract('days', 29), moment()],
					'本月': [moment().startOf('month'), moment().endOf('month')],
					'上月': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
				}
			});
		});
	};

	//页面加载完成时处理
	$(() => {
		$('body').on('wulaui.widgets.init', '.wulaui', function () {
			$(this).find('[date-range-picker]').wulauiDateRange();
		});
	});
})(jQuery);
