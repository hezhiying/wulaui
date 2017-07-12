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

	const Validator = function (form) {

		this.form               = form;
		this.rules              = prepareValidateRule(form.data('validate'));
		const name              = form.attr('name');
		this.rules.onsubmit     = false;
		this.rules.errorClass   = 'parsley-error';
		this.rules.validClass   = 'parsley-success';
		this.rules.wrapper      = 'ul';
		this.rules.wrapperClass = 'parsley-error-list';
		this.rules.errorElement = 'li';
		this.validator          = form.validate(this.rules);
		let me                  = this;
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
			e.opts.data =  $(this).serializeArray();
		}).on('wulaui.widgets.init', '.wulaui', function () {
			$(this).find('form[data-validate]').wulaform();
		});
	});
})(jQuery);