define(function(require){

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var notificationsTpl = require("tmpl!templates/app/notifications.html");
	var itemTpl = require("tmpl!templates/app/notification.html");

	var notificationsView = Backbone.View.extend({
		el: "#main",

		initialize: function(){
		},

		render: function(){
			$(this.el).html(notificationsTpl);
			this.$list = $(this.el).find('#notifications-list');
			this.refresh();
		},

		refresh: function() {
			var list = this.$list;
			return api.get('/api/v1/notificationslist')
				.prop('data')
				.method('map', itemTpl)
				.method('join', '')
				.then(this.$list.html.bind(this.$list)));
		},

		destroy: function(){
			this.remove();
			this.unbind();
		}
	});

	return new notificationsView;
});
