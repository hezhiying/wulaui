
($ => {
	$.i18n = function (source, params) {
		if (arguments.length === 1) {
			return () => {
				let args = $.makeArray(arguments);
				args.unshift(source);
				return $.i18n.apply(this, args);
			};
		}
		if (params === undefined) {
			return source;
		}
		if (arguments.length > 2 && params.constructor !== Array) {
			params = $.makeArray(arguments).slice(1);
		}
		if (params.constructor !== Array) {
			params = [params];
		}
		$.each(params, (i, n) => {
			source = source.replace(new RegExp("\\{" + i + "\\}", "g"), () => {
				return n;
			});
		});
		return source;
	};
})(jQuery);
