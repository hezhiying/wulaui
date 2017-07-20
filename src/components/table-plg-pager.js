($ => {
	const pagerTpl            = '<section class="col-sm-12  col-md-7 col-lg-8 text-right"><ul class="pagination pagination-sm m-t-sm m-b-none"></ul></section>';
	const tipTpl              = '<section class="col-sm-12  col-md-5 col-lg-4 hidden-sm"><div class="m-t text-muted">每页&nbsp;<select></select>条&nbsp;共<span class="tp"></span>页<span class="tr"></span>条记录</div></section>';
	const nuiPager            = function (pager) {
		let targetId = pager.data('tablePager');
		if (targetId) {
			let target = $(targetId).data('pagerTarget');
			if (target) {
				this.pagerTarget = target;
			}
		}
		pager.addClass('row');
		if (!this.pagerTarget || !$.isFunction(this.pagerTarget.pager) || !$.isFunction(this.pagerTarget.doPage)) {
			return;
		}
		this.pagerTarget.pager(this);

		this.element = pager;
		this.total   = parseInt($(targetId).find('tbody').data('total') || 0, 10);
		this.limit   = parseInt(pager.data('limit') || 20, 10);
		this.pp      = parseInt(pager.data('pp') || 5, 10);
		this.current = 1;
		if (!this.limit) {
			this.limit = 20;
		}
		if (!this.pp) {
			this.pp = 5;
		}
		let me          = this;
		let pageWrapper = $(pagerTpl);

		if (pager.data('hiddenTip') === undefined) {
			this.tipElm = $(tipTpl);
			let sbox    = this.tipElm.find('select');
			sbox.append($('<option value="5">5</option>'));
			sbox.append($('<option value="10">10</option>'));
			sbox.append($('<option value="15">15</option>'));
			sbox.append($('<option value="20">20</option>'));
			sbox.append($('<option value="30">30</option>'));
			sbox.append($('<option value="50">50</option>'));
			sbox.append($('<option value="100">100</option>'));
			sbox.val(this.limit);
			this.tipElm.find('.tr').html(this.total);
			this.tipElm.appendTo(pager);
			sbox.change(function () {
				me.limit   = $(this).val();
				me.current = 1;
				me.pagerTarget.doPage(me.current, me.limit, true, true);
			});
		} else {
			pageWrapper.removeClass('col-md-7 col-lg-8');
		}

		let pagerElm = this.pagerElm = pageWrapper.find('ul');
		pagerElm.append('<li class="disabled p-f"><a href="#" rel="1"><i class="fa fa-fast-backward"></i></a></li>');
		pagerElm.append('<li class="disabled p-p"><a href="#" rel="1"><i class="fa fa-backward"></i></a></li>');
		for (let i = 1; i <= this.pp; i++) {
			pagerElm.append('<li class="p-' + i + '"><a href="#" rel="' + i + '">' + i + '</a></li>');
		}
		pagerElm.append('<li class="disabled p-n"><a href="#" rel="1"><i class="fa fa-forward"></i></a></li>');
		pagerElm.append('<li class="disabled p-l"><a href="#" rel="1"><i class="fa fa-fast-forward"></i></a></li>');
		pageWrapper.appendTo(pager);
		pager.append($('<div class="clearfix"></div>'));
		pagerElm.on('click', 'a', function (event) {
			event.preventDefault();
			if (!$(this).parents('li').hasClass('disabled')) {
				let rel    = $(this).attr('rel');
				me.current = parseInt(rel, 10);
				me.pagerTarget.doPage(me.current, me.limit, true);
			}
			return false;
		});
		this.pagerTarget.doPage(me.current, me.limit);
		this.pageIt(this.total);
	};
	nuiPager.prototype.pageIt = function (total) {
		this.total = total >= 0 ? total : this.total;
		let tp     = Math.ceil(this.total / this.limit), pagerElm = this.pagerElm;
		if (this.tipElm) {
			this.tipElm.find('.tp').html(tp);
			this.tipElm.find('.tr').html(this.total);
		}
		if (tp < 2) {
			pagerElm.hide();
			return;
		} else {
			pagerElm.show();
		}
		pagerElm.find('li').removeClass('disabled');
		if (this.current > 1) {
			pagerElm.find('.p-f').removeClass('disabled');
			pagerElm.find('.p-p').removeClass('disabled').find('a').attr('rel', this.current - 1);
		} else {
			pagerElm.find('.p-f').addClass('disabled');
			pagerElm.find('.p-p').addClass('disabled');
		}

		if (this.current === tp) {
			pagerElm.find('.p-n').addClass('disabled');
			pagerElm.find('.p-l').addClass('disabled');
		} else {
			pagerElm.find('.p-l').removeClass('disabled').find('a').attr('rel', tp);
			pagerElm.find('.p-n').removeClass('disabled').find('a').attr('rel', this.current + 1);
		}
		let pt = Math.ceil(this.pp / 2), start = 0;
		if (tp < this.pp) {
			for (let i = this.pp; i > tp; i--) {
				pagerElm.find('.p-' + i).hide();
			}
		}

		if (this.current >= pt) {
			start = this.current - pt - 1;
		}
		if ((this.current + pt) > tp) {
			start = tp - this.pp;
		}
		start = Math.max(0, start);
		for (let i = 1; i <= Math.min(this.pp, tp); i++) {
			pagerElm.find('.p-' + i).addClass('hidden-xs').css('display', 'inline').find('a').attr('rel', start + i).html(start + i);
		}
		pagerElm.find('a[rel=' + this.current + ']').parents('li').removeClass('hidden-xs').addClass('disabled');
	};

	$.fn.wulaplgpager = function () {
		return $(this).each(function (i, elm) {
			let pager = $(elm);
			if (!pager.data('pagerObj')) {
				pager.data('pagerObj', new nuiPager(pager));
			}
		});
	};
	$(() => {
		$('body').on('wulaui.table.init', 'table[data-table]', function () {
			let id = $(this).attr('id');
			if (id) {
				$('div[data-table-pager="#' + id + '"]').wulaplgpager();
			}
		});
	});
})(jQuery);
