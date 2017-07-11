if ("undefined" === typeof jQuery) {
	throw new Error("WulaUI's JavaScript requires jQuery");
}
Date.now = Date.now || function () {
		return +new Date;
	};

($ => {
	"use strict";
	// 注册jquery
	if ('function' === typeof define && define.amd) {
		define('jquery', [], function () {
			return $;
		});
	}
	// wulaui
	$.wulaUI = {
		settings: {
			home     : '#',
			hash     : false,
			appConfig: {ids: [], groups: []},
			requirejs: {
				baseUrl: '/',
				paths  : {}
			}
		}
	};
})(jQuery);