($ => {
	$.fn.wulatree              = function () {
		return $(this).each(function () {
			let me = $(this);
			if (!me.data('treeObj')) {
				me.data('treeObj', new WulaTree(me));
			}
		});
	};
	$.fn.wulatreeLoad          = function () {
		return $(this).each(function () {
			let treeObj = $(this).data('treeObj');
			if (treeObj) {
				$(this).trigger('ztree.setting.load');
			}
		});
	};
	$.fn.wulatreed             = function () {
		return $(this).each(function () {
			let treeObj = $(this).data('treeObj');
			if (treeObj) {
				$(this).data('treeObj', null);
				treeObj.destroy();
			}
		});
	};
	const WulaTree             = function (element) {
		let me        = this;
		this.settings = {
			view    : {},
			callback: {},
			edit    : {
				drap: {}
			},
			data    : {
				keep      : {},
				key       : {},
				simpleData: {}
			},
			check   : {}
		};
		this.url      = element.data('ztree');
		this.lazy     = element.data('lazy') !== undefined;
		if (this.url) {
			this.settings.async = {
				enable   : true,
				url      : this.url,
				type     : 'get',
				dataType : 'json',
				autoParam: ["id"]
			};
		}

		element.on('ztree.setting.load', function () {
			let e  = $.Event('ztree.init');
			e.tree = me;
			element.trigger(e);
			me.settings = e.tree.settings;
			me.nodes    = e.tree.nodes;
			if (!e.isDefaultPrevented()) {
				me.treeObj = $.fn.zTree.init(element, me.settings, me.nodes);
				element.trigger('ztree.inited', [me.treeObj]);
			}
			element.off('ztree.setting.load');
		}).closest('.wulaui').on('wulaui.widgets.destroy', me.destroy);

		if (!this.lazy) {
			element.trigger('ztree.setting.load');
		}
	};
	WulaTree.prototype.destroy = function () {
		if (this.treeObj) {
			this.treeObj.destroy();
			delete this.treeObj;
		}
	};
	$(() => {
		$('body').on('wulaui.widgets.init', '.wulaui', function () {
			$(this).find('[data-ztree]').wulatree();
		})
	})
})(jQuery);