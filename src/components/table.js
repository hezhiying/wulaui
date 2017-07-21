($ => {
	// data-source: url for loadding table rows
	// data-sort: field,dir default
	// data-tree: true or false
	// data-hh: hide head
	// data-expend: auto expend
	// data-tfoot: auto-generate tfoot
	// data-auto: auto-load data
	// th[data-sort] : sort field
	const nuiTable                = function (table) {
		let me               = this;
		this.table           = table;
		this.data            = {};
		this.isTree          = table.data('tree') !== undefined;
		this.hideHead        = table.data('hh') !== undefined;
		this.autoExpend      = table.data('expend') !== undefined;
		this.autoLoad        = table.data('auto') !== undefined;
		this.noHover         = table.data('noHover') !== undefined;
		this.source          = table.data('table');
		this.id              = table.attr('id');
		this.currentTreeNode = null;
		if (this.isTree) {
			this.folderOpenIcon  = table.data('folderIcon1') || 'fa fa-minus-circle';
			this.folderCloseIcon = table.data('folderIcon2') || 'fa fa-plus-circle';
			this.leafIcon        = table.data('leafIcon') || '';
		}
		if (this.noHover) {
			table.addClass('table');
		} else {
			table.addClass('table table-hover');
		}
		if (!this.isTree) {
			table.addClass('table-striped');
		}
		table.data('tableObj', this);
		table.data('formTarget', this);
		table.data('pagerTarget', this);
		table.data('loaderObj', this);
		this.initSorter();
		if (this.id) {
			let sform = $('form[data-table-plugin=SearchForm]').filter('[data-for="#' + this.id + '"]');
			if (sform.length === 0) {
				this.initData();
			}
		} else {
			this.initData();
		}
		this.table.find('th input[type="checkbox"].grp').click(function () {
			let $this    = $(this), checked = $this.prop('checked');
			let selected = me.table.find('td input[type="checkbox"].grp');
			selected.prop('checked', checked);
			if (checked) {
				me.table.find('tbody tr').addClass('nui-selected');
			} else {
				me.table.find('tbody tr').removeClass('nui-selected');
			}
			me.table.find('th input[type="checkbox"].grp').not($this).prop('checked', checked);
		});
		if (this.isTree) {
			if (this.table.find('tbody tr').length > 0) {
				this.initTree();
			}
			this.table.on('click', 'tbody tr > td:first-child span.tt-folder', function () {
				let h = $(this), node = me.currentTreeNode = h.parent().parent();
				if (node.data('parent') !== undefined) {
					if (h.hasClass('node-open')) {
						h.removeClass(me.folderOpenIcon).removeClass('node-open').addClass(me.folderCloseIcon);
						collapseNode(node, me);
					} else {
						h.removeClass(me.folderCloseIcon).addClass('node-open').addClass(me.folderOpenIcon);
						if (node.data('loaded')) {
							expendNode(node, me);
						} else {
							me.reload();
						}
					}
				}
			});
		}
		if (this.hideHead) {
			this.table.find('thead').hide();
			this.table.find('tfoot').hide();
		}
		this.table.trigger('wulaui.table.init');
	};
	nuiTable.prototype.initData   = function () {
		if (this.autoLoad) {
			let me = this, limit = 10, pager = $('div[data-table-plugin=Pager][data-for="#' + me.id + '"]');

			if (!this.data.cp) {
				if (pager.length === 1 && pager.data('limit')) {
					limit = parseInt(pager.data('limit'), 10);
				}
				this.data.cp    = 1;
				this.data.limit = limit;
			} else if (pager.length === 1) {
				pager.data('limit', this.data.limit);
				pager.find('select').val(this.data.limit);
				if (this.pagerCtl) {
					this.pagerCtl.limit   = this.data.limit;
					this.pagerCtl.current = this.data.cp;
				}
			}

			if (this.data.sf) {
				me.table.find("div.sorthd i").removeClass('fa-sort-up fa-sort-down');
				let abc = me.table.find("div[data-field='" + this.data.sf + "']");
				if (this.data.dir === 'd') {
					abc.data('dir', 'a');
					abc.find('i').addClass('fa-sort-down');
				} else {
					abc.data('dir', 'd');
					abc.find('i').addClass('fa-sort-up');
				}
			}
			this.inited = false;
			if (me.table.parents('.nui-dialog').length > 0) {
				setTimeout(function () {
					me.reload();
					me.inited = true;
				}, 200);
			} else {
				this.reload();
				this.inited = true;
			}
		}
	};
	nuiTable.prototype.initSorter = function () {
		let defaultSort = this.table.attr('data-sort'), me = this;
		this.table.find('th[data-sort]').each(function (i, n) {
			let th = $(n), sort = th.attr('data-sort');
			if (sort) {
				let sorts = sort.split(',');
				let field = sorts.shift(), dir = 'd', cls = 'fa fa-sort pull-right m-t-xs ';
				if (sorts.length > 0) {
					dir = sorts.shift();
					if (dir !== 'd' && dir !== 'a') {
						dir = 'd';
					}
				}
				if (defaultSort === sort) {
					me.data.sf  = field;
					me.data.dir = dir;
					if (dir === 'd') {
						cls += 'fa-sort-down text-info';
						dir = 'a';
					} else {
						cls += 'fa-sort-up text-info';
						dir = 'd';
					}
				}
				let html = '<div class="sorthd" data-field="' + field + '"';
				html += ' data-dir="' + dir + '">' + th.html();
				html += '<i class="' + cls + '"></i></div>';
				th.empty().append($(html)).removeAttr('data-sort');
			}
		});
		if (this.table.data('tfoot')) {
			let tfoot = $('<tfoot></tfoot>');
			this.table.find('thead tr').clone().appendTo(tfoot);
			this.table.append(tfoot);
		}
		let ths = this.table.find('div.sorthd');
		ths.click(function () {
			ths.find('i').removeClass('fa-sort-down fa-sort-up text-info');
			let th = $(this), f = th.data('field'), d = th.data('dir'),
				th2                                   = $("div[data-field='" + f + "']");
			me.doSort(f, d, function () {
				if (d === 'd') {
					th2.data('dir', 'a');
					th2.find('i').removeClass('fa-sort-up').addClass('fa-sort-down text-info');
				} else {
					th2.data('dir', 'd');
					th2.find('i').removeClass('fa-sort-down').addClass('fa-sort-up text-info');
				}
			});
		});
	};

	nuiTable.prototype.initTree   = function (html) {
		let me = this;
		if (!html) {
			html = this.table.find('tbody tr');
		}
		let level = 0, ref = '0';
		if (me.currentTreeNode !== null) {
			level = me.currentTreeNode.data('ttLevel');
			ref   = me.currentTreeNode.attr('rel');
		}
		let cls = 'tt-folder', icon = me.folderCloseIcon;
		$.each(html, function (i, n) {
			let $this = $(n), id = $this.attr('rel');
			if ($this.data('handleAdded')) {
				return;
			}
			let children = html.is('[parent="' + id + '"]');
			if ($this.data('parent') || children) {
				cls = 'tt-folder';
				if (!$this.attr('data-parent')) {
					$this.attr('data-parent', 'true');
				}
				icon = me.autoExpend && (children || !me.autoLoad) ? me.folderOpenIcon : me.folderCloseIcon;
			} else {
				cls  = 'tt-leaf';
				icon = me.leafIcon;
			}
			if (!$this.attr('parent')) {
				$this.attr('parent', ref);
			}
			let parent = $this.attr('parent');
			if (html.is('[rel="' + parent + '"]')) {
				$this.css('display', 'none');
			} else {
				$this.css('display', 'table-row');
			}
			$this.find('td:first').prepend($('<span class="' + cls + ' ' + icon + '"></span>'));
			$this.find('td:first').prepend($('<span class="tt-line"></span>'));
			$this.data('handleAdded', true);
			$this.data('ttLevel', level);
			$this.data('loaded', children);
		});
		if (me.autoExpend) {
			me.table.find("tbody tr[parent='0']").each(function (i, n) {
				expendNode($(n), me);
			});
		}
	};
	nuiTable.prototype.reloadNode = function (ids) {
		let me = this;
		if (ids) {
			ids = '' + ids;
			ids = ids.split(',');
			$.each(ids, function (i, e) {
				me.currentTreeNode = me.table.find('tr[rel=' + e + ']').eq(0);
				if (me.currentTreeNode && me.currentTreeNode.data('loaded')) {
					let icon = me.currentTreeNode.find('td:first-child span.tt-folder');
					me.currentTreeNode.data('loaded', false);
					if (icon.hasClass('node-open')) {
						clearSubNode(me.currentTreeNode, me);
						me.currentTreeNode.find('td:first-child span.tt-folder').removeClass(me.folderOpenIcon).removeClass('node-open').addClass(me.folderCloseIcon);
						me.reload()
					}
				}
			});
		} else {
			if (me.currentTreeNode) {
				me.currentTreeNode.data('loaded', false);
				me.currentTreeNode = null;
			}
			this.reload();
		}
	};
	nuiTable.prototype.doPage     = function (cp, limit, reload, ct) {
		this.data.cp         = cp;
		this.currentTreeNode = null;
		if (limit) {
			this.data.limit = limit;
		}
		if (reload) {
			this.reload(null, ct);
		}
	};

	nuiTable.prototype.doSort = function (field, order, cb) {
		this.currentTreeNode = null;
		this.data.sf         = field;
		this.data.dir        = order;
		this.reload(cb);
	};

	nuiTable.prototype.reload = function (cb, search) {
		if (!this.source) {
			return;
		}
		let me = this, data = [], pageit = false;
		if (me.searchForm) {
			data = me.searchForm.serializeArray();
		}
		if (search || !this.inited) {
			data.push({
				name : 'count',
				value: 1
			});
			pageit = true;
		}
		if (search) {
			this.data.cp         = 1;
			this.currentTreeNode = null;
			if (this.pagerCtl) {
				this.pagerCtl.current = 1;
			}
		}

		data.push({
			name : 'pager[page]',
			value: this.data.cp
		});

		data.push({
			name : 'pager[size]',
			value: this.data.limit
		});

		if (this.data.sf) {
			data.push({
				name : 'sort[name]',
				value: this.data.sf
			});
			if (this.data.dir) {
				data.push({
					name : 'sort[dir]',
					value: this.data.dir
				});
			} else {
				data.push({
					name : 'sort[dir]',
					value: 'd'
				});
			}
		}

		if (me.currentTreeNode !== null) {
			data.push({
				name : 'parentId',
				value: me.currentTreeNode.attr('rel')
			});
			me.currentTreeNode.find('.tt-folder').addClass('fa-spin');
		}

		$.ajax(me.source, {
			dataType: 'html',
			element : me.table,
			data    : data,
			method  : 'get'
		}).done(function (html) {
			me.table.find('th input[type="checkbox"].grp').prop('checked', false);
			html            = $(html);
			let disableTree = html.data('disableTree');
			if (me.isTree && !disableTree) {
				if (me.currentTreeNode) {
					html = html.find('tr');
					me.initTree(html);
					me.currentTreeNode.after(html);
					me.currentTreeNode.data('loaded', true);
					me.currentTreeNode.find('.tt-folder').removeClass('fa-spin ' + me.folderCloseIcon).addClass(me.folderOpenIcon + ' node-open');
					expendNode(me.currentTreeNode, me);
				} else {
					me.table.find('tbody').remove();
					me.table.find('thead').after(html);
					me.initTree();
				}
			} else {
				let tb = me.table.find('tbody');
				$.wulaUI.destroyElement(tb);
				tb.remove();
				me.table.find('thead').after(html);
			}

			if ($.isFunction(cb)) {
				cb();
			}

			if (me.pagerCtl && $.isFunction(me.pagerCtl.pageIt)) {
				let total = -1;
				if (pageit) {
					let ot = html.data('total');
					if (ot === '') {
						total = -1;
					} else {
						total = parseInt(ot || 0, 10);
					}
				}
				me.pagerCtl.pageIt(total);
			}
			$.wulaUI.initElement(html);
		});
	};

	nuiTable.prototype.form  = function (form) {
		if (form) {
			this.searchForm = form;
			this.initData();
		} else {
			return this.searchForm;
		}
	};
	nuiTable.prototype.pager = function (pager) {
		if (pager) {
			this.pagerCtl = pager;
		} else {
			return this.pagerCtl;
		}
	};
	$.fn.wulatable           = function () {
		return $(this).each(function (i, elm) {
			let table = $(elm);
			if (!table.data('tableObj')) {
				new nuiTable(table);
			}
		});
	};

	const expendNode   = function (node, table) {
		let treeid = node.attr('rel'), tree = table.table, subLevel = node.data('ttLevel') + 1;
		if (!node.data('childrenMoved')) {
			node.after(tree.find('[parent="' + treeid + '"]'));
			node.data('childrenMoved', true);
		}
		let ml = (subLevel * 10) + 'px';
		tree.find('[parent="' + treeid + '"]').each(function (i, n) {
			let $this = $(n), h = $this.find('td:first span.tt-folder');
			$this.data('ttLevel', subLevel);
			$this.find('td:first span.tt-line').css({'margin-left': ml});
			$this.css({'display': 'table-row'});
			if (h.hasClass('node-open')) {
				expendNode($this, table);
			}
		});
	};
	const collapseNode = function (node, table) {
		let treeid = node.attr('rel');
		let tree   = table.table;
		tree.find('[parent="' + treeid + '"]').each(function (i, n) {
			let $this = $(n);
			collapseNode($this, table);
			$this.css('display', 'none');
		});
	};
	const clearSubNode = function (node, table) {
		let treeid = node.attr('rel');
		let tree   = table.table;
		tree.find('[parent="' + treeid + '"]').each(function (i, n) {
			let $this = $(n);
			clearSubNode($this, table);
			$this.css('display', 'none').remove();
		});
	};

	$(() => {
		$('body').on('wulaui.widgets.init', '.wulaui', function () {
			$(this).find('[data-table]').wulatable();
		})
	});

})(jQuery);
