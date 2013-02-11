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

			'click .option-Chat': 'reply',
			'click .option-Accept': 'optAccept',
			'click .option-Maybe': 'optMaybe',
			'click .option-Reopen': 'optReopen',
			'click .option-Deny': 'optDeny',
			'click .option-Cancel': 'optDeny',
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
						.then(function(data){
							self.parseOptions(data.options, data.firstSender, data.wing.state)
							self.data = data;
							return data;
						})
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
					state: data.wing.state,
					flagDirection: data.firstSender === api.getUserId()
				},
				{
					wingParameters: parameters
				});
			});

			var self = this;
			function openTpl(item) {
				return openItemTpl(item, data.wing, {
					isMessage: isMessage,
					options: data.options,
					flagDirection: data.firstSender === api.getUserId(),
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
				options: data.options,
				previous: prevThread,
				next: nextThread,
				parameters: data.wing.parameters,
				state: self.data.wing.state,
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
					.val('')
					
			this.$('#write-response > div.state-flag')
					.hide();

			this.$('#edit-wing-params')
				.hide();

			var e = Handlebars.helpers['enum'];
			this.$('.state-flag')
				.removeClass(e(this.data.wing.state, "notification-state"))
				.addClass(e(this.prevState, "notification-state"))
				.find("span")
				.text(e(this.prevState, "notification-state"));

			this.data.wing.state = this.prevState;
		},

		sendResponse: function() {
			var resp = { content: this.$('#write-response textarea').val() };
			if (!resp.content)
				return Promise.resolved(false);

			if (this.data.kind === "request" || this.data.kind === "invite"){
				resp.wingParameters = this.getWingParameters(this.data.wing.state);
				resp.state = this.getWingState();
			}

			var self = this;
			return api.post('/api/v1/notificationsthread/', {
				reference: this.current.id,
				data: resp,
			}).then(function() {
				return self.render(self.current.id);
			});
		},

		optAccept: function() {
			this.prevState = this.data.wing.state;
			this.data.wing.state = "A";
			this.reply();

			this.$('#edit-wing-params')
				.show();

			var e = Handlebars.helpers['enum'];
			this.$('.state-flag')
				.show()
				.addClass(e("A", "notification-state"))
				.find("span")
				.text(e("A", "notification-state"));

			this.initWingForm();
		},

		optMaybe: function() {
			this.prevState = this.data.wing.state;
			this.data.wing.state = "M";
			this.reply();

			this.$('#edit-wing-params')
				.show();

			var e = Handlebars.helpers['enum'];
			this.$('.state-flag')
				.show()
				.addClass(e("A", "notification-state"))
				.find("span")
				.text(e("A", "notification-state"));

			this.initWingForm();
		},

		optReopen: function() {
			this.reply();



			this.data.wing.state = "P";
		},

		optDeny: function() {
			this.prevState = this.data.wing.state;
			this.data.wing.state = "D";

			this.reply();
			
			this.$('#write-response > .params-box')
			.show();

			var e = Handlebars.helpers['enum'];
			this.$('.state-flag')
				.show()
				.addClass(e("D", "notification-state"))
				.find("span")
				.text(e("D", "notification-state"));

			this.initWingForm();
		},

		initWingForm: function(){
			this.$("input[name=startDate]").datepicker().datepicker("option", "dateFormat", "yy-mm-dd");
			this.$("input[name=endDate]").datepicker().datepicker("option", "dateFormat", "yy-mm-dd");

			this.$('select[name=capacity]')
				.val(this.data.wing.parameters.capacity);
		},

		parseOptions: function(options, firstSender, wingState){
			if (api.getUserId() == firstSender)
				options[options.indexOf("Deny")] = "Cancel";
			if (wingState == "D")
				options[options.indexOf("Pending")] = "Reopen";
		},

		getWingParameters: function(state){
			if (state == 'M' || state == 'A'){
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

	return new threadView;
});
