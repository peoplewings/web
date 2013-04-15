define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');

	var helpTpl = require('tmpl!templates/home/help-center.html');

	var HelpCenter = Backbone.View.extend({

		el: "#main",

		render: function(tab) {

			$(this.el).html(helpTpl);

			if (tab) this.selectTab('#' + tab);
		},
		selectTab: function(tabId) {
			this.$('.tab-content .tab-pane').removeClass('active');
			$(tabId).addClass('active');

			$(".tabs ul li").removeClass("active");
			$('.tabs ul li a[href=' + tabId + ']')
			.parent()
			.addClass("active");
		},

	});

	return new HelpCenter;
});