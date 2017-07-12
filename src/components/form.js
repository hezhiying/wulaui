($ => {
	const prepareValidateRule = function (rules) {
		if ('object' !== typeof rules) {
			rules = $.parseJSON(rules);
		}
		if (rules.rules) {
			for (let i in rules.rules) {
				for (let j in rules.rules[i]) {
					if (j == 'pattern') {
						eval('var rule = ' + rules.rules[i][j] + ';');
						rules.rules[i][j] = rule;
					}
				}
			}
		}
		return rules;
	};
	const errorPlacement      = function (error, element) {
		if (element.is('[type=checkbox]') || element.is('[type=radio]')) {
			let wrap = element.closest('div');
			if (wrap.is('.checkbox') || wrap.is('.radio')) {
				wrap = wrap.parent().closest('div');
			}
			if (wrap.children('span')) {
				error.insertBefore(wrap.children('span'));
			} else {
				error.appendTo(wrap);
			}
		} else {
			let e = $.Event('form.placement');
			element.trigger(e, [error, element]);
			if (!e.isDefaultPrevented()) {
				error.insertAfter(element);
			}
		}
	};
	const Validator           = function (form) {
		this.form                 = form;
		this.rules                = prepareValidateRule(form.data('validate'));
		const name                = form.attr('name');
		this.rules.errorPlacement = errorPlacement;
		this.rules.onsubmit       = false;
		this.rules.ignoreTitle    = true;
		this.rules.errorClass     = 'parsley-error';
		this.rules.validClass     = 'parsley-success';
		this.rules.wrapper        = 'ul';
		this.rules.wrapperClass   = 'parsley-error-list';
		this.rules.errorElement   = 'li';
		//可以通过事件定制高级验证规则
		let e                     = new $.Event('form.init.rule');
		e.form                    = this;
		this.form.trigger(e);

		this.validator = form.validate(this.rules);
		let me         = this;
		form.on('ajax.before', function () {
			return me.validate();
		});

		//注册销毁事件
		form.closest('.wulaui').on('wulaui.widgets.destroy', this.destroy);
	};

	Validator.prototype.validate = function (errors) {
		if (!this.validator) {
			return false;
		}
		if (this.validator.form()) {
			if (errors) {
				this.validator.showErrors(errors);
				return;
			}
			if (this.validator.pendingRequest) {
				this.validator.formSubmitted = true;
				return false;
			}
		}
		return this.form.valid();
	};

	Validator.prototype.destroy = function () {
		if (this.validator) {
			this.validator.destroy();
			this.validator = null;
		}
	};

	$.fn.wulaform = function () {
		let me = $(this);
		if (me.length) {
			requirejs(['validator'], () => {
				me.each(function () {
					let $this = $(this);
					if (!$this.data('validateObj')) {
						$this.data('validateObj', new Validator($this));
					}
				});
			});
		}
		return me;
	};

	$(() => {
		$(document).on('ajax.build', 'form[data-ajax]', function (e) {
			e.opts.data = $(this).serializeArray();
		}).on('wulaui.widgets.init', '.wulaui', function () {
			$(this).find('form[data-validate]').wulaform();
		});
	});
})(jQuery);