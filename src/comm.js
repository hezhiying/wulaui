if ("undefined" === typeof jQuery) {
	throw new Error("WulaUI's JavaScript requires jQuery");
}
Date.now = Date.now || function () {
		return +new Date;
	};

($ => {
	"use strict";
	$.wulaUI = {
		settings: {
			home: '#',
			hash: false
		}
	};
})(jQuery);