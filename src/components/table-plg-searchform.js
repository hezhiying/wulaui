($ => {
	const nuiSearchForm = function (form) {
		let targetId = form.data('tableForm');
		if (targetId) {
			let target = $(targetId).data('formTarget');
			if (target && $.isFunction(target.form) && $.isFunction(target.reload)) {
				target.form(form);
				form.submit(function (event) {
					event.preventDefault();
					target.reload(null, true);
					return false;
				});
			}
		}
	};
	$.fn.wulaplgform    = function () {
		return $(this).each(function (i, elm) {
			let form = $(elm);
			if (!form.data('formObj')) {
				form.data('formObj', new nuiSearchForm(form));
			}
		});
	};
	$(() => {
		$('body').on('wulaui.table.init', 'table[data-table]', function () {
			let id = $(this).attr('id');
			if (id) {
				$('form[data-table-form="#' + id + '"]').wulaplgform();
			}
		});
	});
})(jQuery);
