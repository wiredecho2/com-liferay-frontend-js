;(function(A, Liferay) {
	var Tabs = Liferay.namespace('Portal.Tabs');
	var ToolTip = Liferay.namespace('Portal.ToolTip');

	var toCharCode = Liferay.Util.toCharCode;

	var BODY_CONTENT = 'bodyContent';

	var TRIGGER = 'trigger';

	Liferay.Portal.Tabs._show = function(event) {
		var names = event.names;
		var namespace = event.namespace;

		var selectedIndex = event.selectedIndex;

		var tabItem = event.tabItem;
		var tabSection = event.tabSection;

		if (tabItem) {
			tabItem.radioClass('active');
		}

		if (tabSection) {
			tabSection.show();
		}

		var tabTitle = A.one('#' + event.namespace + 'dropdownTitle');

		if (tabTitle) {
			tabTitle.html(tabItem.one('a').text());
		}

		names.splice(selectedIndex, 1);

		var el;

		for (var i = 0; i < names.length; i++) {
			el = A.one('#' + namespace + toCharCode(names[i]) + 'TabsSection');

			if (el) {
				el.hide();
			}
		}
	};

	Liferay.provide(
		Tabs,
		'show',
		function(namespace, names, id, callback) {
			var namespacedId = namespace + toCharCode(id);

			var tab = A.one('#' + namespacedId + 'TabsId');
			var tabSection = A.one('#' + namespacedId + 'TabsSection');

			var details = {
				id: id,
				names: names,
				namespace: namespace,
				selectedIndex: names.indexOf(id),
				tabItem: tab,
				tabSection: tabSection
			};

			if (callback && A.Lang.isFunction(callback)) {
				callback.call(this, namespace, names, id, details);
			}

			Liferay.fire('showTab', details);
		},
		['aui-base']
	);

	Liferay.publish(
		'showTab',
		{
			defaultFn: Liferay.Portal.Tabs._show
		}
	);

	ToolTip._getText = function(id) {
		var node = A.one('#' + id);

		var text = '';

		if (node) {
			var toolTipTextNode = node.next('.taglib-text');

			if (toolTipTextNode) {
				text = toolTipTextNode.html();
			}
		}

		return text;
	};

	ToolTip.hide = function() {
		var instance = this;

		var cached = instance._cached;

		if (cached) {
			cached.hide();
		}
	};

	Liferay.provide(
		ToolTip,
		'show',
		function(obj, text) {
			var instance = this;

			var cached = instance._cached;

			if (!cached) {
				cached = new A.Tooltip(
					{
						cssClass: 'tooltip-help',
						html: true,
						opacity: 1,
						stickDuration: 100,
						visible: false,
						zIndex: Liferay.zIndex.TOOLTIP
					}
				).render();

				cached.after(
					'visibleChange',
					A.bind('_syncUIPosAlign', cached)
				);

				instance._cached = cached;
			}

			if (obj.jquery) {
				obj = obj[0];
			}

			obj = A.one(obj);

			if (text == null) {
				text = instance._getText(obj.guid());
			}

			cached.set(BODY_CONTENT, text);
			cached.set(TRIGGER, obj);

			var tooltipTimeout;
			var tooltip = cached.get('boundingBox');

			var hideTooltip = function() {
				tooltipTimeout = A.later(
					cached.stickDuration,
					tooltip,
					function() {
						cached.hide();
					}
				);
			};

			obj.detach('hover');
			tooltip.detach('hover');

			obj.on(
				'hover',
				A.bind('_onBoundingBoxMouseenter', cached),
				hideTooltip
			);

			tooltip.on(
				'hover',
				function(event) {
					tooltipTimeout.cancel();

					obj.on(
						'lfr-tooltip|mouseenter',
						function(event) {
							tooltipTimeout.cancel();

							this.detach('lfr-tooltip|mouseenter');
						}
					);
				},
				hideTooltip
			);

			cached.show();
		},
		['aui-tooltip-base']
	);
})(AUI(), Liferay);