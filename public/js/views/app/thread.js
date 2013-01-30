define(function(require) {

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var Promise = require("promise");
	var UserAccount = require('models/Account');
	var notifications = require('views/lib/notifications');
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

			'click #delete-thread': 'remove',
			'click #open-request': 'request',
			'click #open-invite': 'invite',
			'click #open-message': 'reply',

			'click #response-reply': 'reply',
			'click #response-request': 'request',
			'click #reponse-invite': 'invite',

			'click #send-response': 'sendResponse',
			'click #cancel-response': 'cancelResponse',

			'click .option-chat': 'reply',
			'click .option-accept': 'optAccept',
			'click .option-maybe': 'optMaybe',
			'click .option-reopen': 'optReopen',
			'click .option-deny': 'optDeny',
			'click .option-cancel': 'optDeny',
		},

		initialize: function() {
			this.refresh = this.refresh.bind(this);
		},

		render: function(id) {
			var self = this;

			this.current = { id: id };
			return notifList.getThreads().then(function(threads) {
				var index = threads.indexOf(id);

				var prevThread = threads[index - 1];
				var nextThread = threads[index + 1];

				return Promise.all(
					prevThread || notifList.previousPage().then(function(threads) { return threads && threads[threads.lenght - 1] }),
					nextThread || notifList.    nextPage().then(function(threads) { return threads && threads[0] })
				).spread(function(prevThread, nextThread) {
					return api.get('/api/v1/notificationsthread/' + id)
						.prop('data')
						.then(self.refresh.bind(self, prevThread, nextThread));
				});
			});
		},

		refresh: function(prevThread, nextThread, data) {
			var last = data.items.pop();
			var isMessage = data.kind === 'message';
			var parameters = null

			if (!isMessage) {
				parameters = data.wing.parameters
				parameters['wingType'] = data.wing.type
				parameters['numPeople'] = data.wing.parameters.capacity
			}



			var items = data.items.map(function(item, index) {

				if (!isMessage)
					parameters['message'] = data.wing.parameters.wingName

				return _.extend(
				{
					index: index,
					isMessage: data.kind === 'message',
					created: item.created,
					interlocutorId: item.senderId,
					age: item.senderAge,
					name: item.senderName,
					location: item.senderLocation,
					verified: item.senderVerified,
					avatar: item.senderSmallAvatar,
					connected: item.senderConnected,
					content: item.content.message,
				},
				{
					wingParameters: parameters
				});
			});

			function openTpl(item) {
				return openItemTpl(item, data.wing, {
					isMessage: isMessage,
					options: [ 'accept', 'chat', 'maybe', 'reopen', 'cancel', 'deny' ]
				});
			}

			this.current.interlocutor = {
				id: last.senderId,
				name: last.senderName,
			};

			var avatar = new UserAccount({ id: api.getUserId() }).get('avatar');
			this.$el.html(threadTpl(data, {
				isMessage: isMessage,
				iStarted: data.firstSender === api.getUserId(),
				options: [ 'accept', 'chat', 'maybe', 'reopen', 'cancel', 'deny' ],
				previous: prevThread,
				next: nextThread,
				me: { avatar: avatar },
				items: items.map(itemTpl).join('') + openTpl(last),
			}));

			var allButLast = Array.prototype.slice.call(self.$('#notif-list').children(), 0, -2);
			$(allButLast).click(function openItem() {
				var closed = $(this);
				var open = $(openTpl(data.items[$(this).data('index')]));

				$(this).replaceWith(open);
				open.click(function closeItem() {
					$(this).replaceWith(closed);
					closed.click(openItem);
				});
			});
		},

		remove: function() {
			api.put('/api/v1/notificationslist', { threads: [ this.current.id ] }).then(this.back.bind(this));
		},

		back: function() {
			notifList.applyFilters();
		},

		previous: function() {
			document.location.hash = '#/messages/' + this.$('#previous').data('id');
		},

		next: function() {
			document.location.hash = '#/messages/' + this.$('#next').data('id');
		},

		createNotification: function(event, type) {
		},

		request: function(event) {
			var inter = this.current.interlocutor;
			notifications.request(inter.id, inter.name);
		},

		invite: function(event) {
			var inter = this.current.interlocutor;
			notifications.invitation(inter.id, inter.name);
		},

		reply: function(event) {
			this.$('#response-options').hide();
			this.$('#write-response')
				.show()
				.find('textarea')
					.focus();
		},

		cancelResponse: function() {
			this.$('#response-options').show();
			this.$('#write-response')
				.hide()
				.find('textarea')
					.val('');
		},

		sendResponse: function() {
			var content = this.$('#write-response textarea').val();
			if (!content)
				return Promise.resolved(false);

			var self = this;
			return api.post('/api/v1/notificationsthread/', {
				reference: this.current.id,
				data: { content: content }
			}).then(function() {
				return self.render(self.current.id);
			});
		},

		optAccept: function() {
			console.log('accept');
		},

		optMaybe: function() {
			console.log('maybe');
		},

		optReopen: function() {
			console.log('reopen');
		},

		optDeny: function() {
			console.log('deny');
		},
	});

	return new threadView;
});
