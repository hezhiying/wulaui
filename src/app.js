if ("undefined" == typeof jQuery) {
	throw new Error("WulaUI's JavaScript requires jQuery");
}
// wulaUI
(function ($) {
	"use strict";
	$.wulaUI      = {};
	$.wulaUI.init = (opts) => {
		$('body .wulaui').trigger('wulaui.widgets.init');
	};
	//处理窗口大小改变
	$(window).resize(function () {
		$(this).trigger('wulaui.layout');
		return false
	}).resize();
})(jQuery);