define(function(require) {

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var Promise = require("promise");
	var notifList = require("views/app/notifications");
	var threadTpl = require("tmpl!templates/app/thread.html");
	var itemTpl = require("tmpl!templates/app/notification.html");
	var openItemTpl = require("tmpl!templates/app/open-notification.html");

	var threadView = Backbone.View.extend({
		el: "#main",

		events: {
			'click #back': 'back',
			'click #previous': 'previous',
			'click #next': 'next',
		},

		initialize: function() {
			this.refresh = this.refresh.bind(this);
		},

		render: function(id) {
			var self = this;
			console.log('Estoy dentro B-|');
			Promise.debug = true;

			notifList.getThreads().then(function(threads) {
				var index = threads.indexOf(id);

				var prevThread = threads[index - 1];
				var nextThread = threads[index + 1];

				Promise.all(
					prevThread || notifList.previousPage().then(function(threads) { return threads && threads[threads.lenght - 1] }),
					nextThread || notifList.    nextPage().then(function(threads) { return threads && threads[0] })
				).spread(function(prevThread, nextThread) {
					self.$el.html(threadTpl({
						previous: prevThread,
						next: nextThread
					}));

					self.$list = self.$('#notif-list');
					api.get('/api/v1/notificationsthread/' + id)
						.prop('data')
						.then(self.refresh);
				});
			});
		},

		refresh: function(data) {
			var last = data.items.pop();
			var items = data.items.map(function(item) {
				return {
					isMessage: true,
					created: item.created,
					id: item.senderId,
					age: item.senderAge,
					name: item.senderName,
					location: item.senderLocation,
					verified: item.senderVerified,
					avatar: item.senderSmallAvatar,
					connected: item.senderConnected,
					content: item.content.message,
				};
			});

			this.$list.html(items.map(itemTpl).join('') + openItemTpl(last));
		},

		back: function() {
			document.location.hash = '#/messages';
		},

		previous: function() {
			document.location.hash = '#/messages/' + this.$('#previous').data('id');
		},

		next: function() {
			document.location.hash = '#/messages/' + this.$('#next').data('id');
		},
	});

	return new threadView;
});
