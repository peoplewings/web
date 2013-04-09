define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');

	var helpTpl = require('tmpl!templates/home/help-center.html');

	var HelpCenter = Backbone.View.extend({

		el: "#main",

		render: function() {

			$(this.el).html(helpTpl({
			}));

		},

	});

	return new HelpCenter;
});
