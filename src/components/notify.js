($ => {
	$.notifyS  = (message, title) => {
		nott(message, title, 'check-square', 'sucess');
	};
	$.notifyI  = (message, title) => {
		nott(message, title, 'info-circle', 'info');
	};
	$.notifyW  = (message, title) => {
		nott(message, title, 'warning', 'warning');
	};
	$.notifyD  = (message, title) => {
		nott(message, title, 'warning', 'danger');
	};
	const nott = (message, title, icon, type) => {
		$.notify({title: title ? title : '', message: message, icon: 'fa fa-' + icon}, {
			type     : type,
			z_index  : 9000,
			placement: {
				from : "top",
				align: "center"
			}
		});
	};
})(jQuery);