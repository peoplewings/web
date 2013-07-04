define(function(require) {

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var Promise = require("promise");
	var UserAccount = require('models/Account');
	var alerts = require('views/lib/alerts');
	var notifications = require('views/lib/notifications');
	var notifList = require("views/app/notifications");
	var threadTpl = require("tmpl!templates/app/thread.html");
	var itemTpl = require("tmpl!templates/app/thread-item.html");

	var ThreadView = Backbone.View.extend({
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

			'click .option-Chat': 'reply',
			'click .option-Accept': 'optAccept',
			'click .option-Maybe': 'optMaybe',
			'click .option-Reopen': 'optReopen',
			'click .option-Deny': 'optDeny',
			'click .option-Cancel': 'optDeny',

			'click li.thread-item': 'toggleContent',
		},

		responseValidation: {
			rules: {
				startDate: {
					date: true,
				},
				endDate: {
					date: true,
				}
			},
			errorPlacement: function(error, element) {
				error.appendTo(element.nextAll("span.help-block"));
			},
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
					prevThread || notifList.previousPage().then(function(threads) { return threads && threads[threads.lenght - 1]; }),
					nextThread || notifList.    nextPage().then(function(threads) { return threads && threads[0]; })
				).spread(function(prevThread, nextThread) {
					return api.get('/api/v1/notificationsthread/' + id)
						.prop('data')
						.then(function(data){
							if (data.kind !== "message")
								self.parseOptions(data.options, data.firstSender, data.wing.state);

							data.items = data.items.map(function(item){
								if (item.senderLocation.indexOf('Not specified') === 0)
									item.senderLocation = null;

								return item;
							});

							self.data = data;
							return data;
						})
						.then(self.refresh.bind(self, prevThread, nextThread));
				});
			});
		},

		refresh: function(prevThread, nextThread, data) {
			var isMessage = data.kind === 'message';
			var isRequest = data.kind === 'request';
			var me = api.getUserId();
			var avatar = new UserAccount({ id: api.getUserId() }).get('avatar');

			var items = data.items.map(function(item, index) {
				var a = _.extend(item, {
					index: index,
					fromMe: item.senderId === me,
					reference: data.reference,
					isMessage: isMessage,
					isRequest: isRequest,

					id: null,
					read: null,
					online: null,
				});

				return a;
			});

			this.$el.html(threadTpl(data, {
				isMessage: isMessage,
				options: data.options,
				previous: prevThread,
				next: nextThread,
				me: { avatar: avatar },
				items: items.map(itemTpl).join(''),
			}));

			this.$('li .messages-content').hide().last().show();
		},

		remove: function() {
			var self = this;
			return api.put('/api/v1/notificationslist', {
				threads: [ this.current.id ],
			}).then(function() {
				alerts.success('Thread removed');
				self.back();
			}, function(error) {
				debugger;
				alerts.defaultError(error);
			});
		},

		toggleContent: function(event) {
			if ($(event.target).attr('href'))
				return;
			var item = $(event.target).closest('li.thread-item');
			if (!item.next().is('.response-item'))
				item.find('.messages-content').toggle();
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

		createNotification: function() {
		},

		request: function() {
			var inter = this.current.interlocutor;
			notifications.request(inter.id, inter.name);
		},

		invite: function() {
			var inter = this.current.interlocutor;
			notifications.invitation(inter.id, inter.name);
		},

		reply: function() {
			if (this.data.kind !== "message")
				this.prevState = this.data.wing.state;

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

			this.$('#write-response > span.state-flag')
					.hide();

			this.$('#edit-wing-params')
				.hide();

			if (this.prevState) {
				var e = Handlebars.helpers['enum'];
				this.$('.state-flag')
					.removeClass(e(this.data.wing.state, "notification-state"))
					.addClass(e(this.prevState, "notification-state"))
					.find("span")
					.text(e(this.prevState, "notification-state"));

				this.data.wing.state = this.prevState;
			}
		},

		sendResponse: function() {
			var form = this.$("#edit-wing-params > form");
			if (form.length && !form.valid())
				return Promise.resolved(false);

			var resp = { content: this.$('#write-response textarea').val() };
			if (!resp.content)
				return Promise.resolved(false);

			if (this.data.kind === "request" || this.data.kind === "invite"){
				resp.wingParameters = this.getWingParameters(this.data.wing.state);
				resp.state = this.getWingState();
			}

			this.$("#send-response").button('loading');

			var self = this;
			return api.post('/api/v1/notificationsthread/', {
				reference: this.current.id,
				data: resp,
			}).then(function() {
				return self.render(self.current.id);
			}).then(function() {
				alerts.success('Response sent');
				self.$("#send-response").button('reset');
			}, function() {
				debugger;
				alerts.defaultError();
			});
		},

		optAccept: function() {
			this.reply();
			this.data.wing.state = "A";
			this.$('#edit-wing-params').show();
			this.handleOption(this.data.wing.state, this.prevState);
		},

		optMaybe: function() {
			this.reply();
			this.data.wing.state = "M";
			this.$('#edit-wing-params').show();
			this.handleOption(this.data.wing.state, this.prevState);
		},

		optReopen: function() {
			this.reply();
			this.data.wing.state = "P";
			this.$('#edit-wing-params').show();
			this.handleOption(this.data.wing.state, this.prevState);
		},

		optDeny: function() {
			this.reply();
			this.data.wing.state = "D";
			this.$('#write-response > .params-box').show();
			this.handleOption(this.data.wing.state, this.prevState);
		},

		handleOption: function(option, prevState) {
			var e = Handlebars.helpers['enum'];
			this.$('.state-flag')
				.show()
				.removeClass(e(prevState, "notification-state"))
				.addClass(e(option, "notification-state"))
				.find("span")
				.text(e(option, "notification-state"));

			this.$("#wing-params-form")
				.validate(this.responseValidation);


			this.$("input[name=startDate]").datepicker({
				minDate: new Date(),
				dateFormat: "yy-mm-dd",
			});

			this.$("input[name=endDate]").datepicker({
				minDate: new Date(),
				dateFormat: "yy-mm-dd",
			}).rules("add", {
				gte: this.$("input[name=startDate]"),
			});

			this.$('select[name=capacity]')
				.val(this.data.wing.parameters.capacity);
		},

		parseOptions: function(options, firstSender, wingState){
			if (api.getUserId() === firstSender)
				options[options.indexOf("Deny")] = "Cancel";
			if (wingState === "D")
				options[options.indexOf("Pending")] = "Reopen";
		},

		getWingParameters: function(state){
			if (state === 'M' || state === 'A' || state === 'P'){
				this.data.wing.parameters.startDate = +new Date(this.$("input[name=startDate]").val())/1000;
				this.data.wing.parameters.endDate = +new Date(this.$("input[name=endDate]").val())/1000;
				this.data.wing.parameters.capacity = this.$("select[name=capacity]").val();
			}

			return {
				startDate: this.data.wing.parameters.startDate,
				endDate: this.data.wing.parameters.endDate,
				capacity: this.data.wing.parameters.capacity,
				flexibleStartDate: this.data.wing.parameters.flexibleStartDate,
				flexibleEndDate: this.data.wing.parameters.flexibleEndDate,
			};
		},

		getWingState: function(){
			return this.data.wing.state;
		}
	});

	return new ThreadView;
});
