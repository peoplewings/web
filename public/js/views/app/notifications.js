define(function(require){

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var Promise = require("promise");
	var utils = require('utils');

	var notificationsTpl = require("tmpl!templates/app/notifications.html");
	var itemTpl = require("tmpl!templates/app/notification.html");
	var alerts = require("views/lib/alerts");

	var AccountModel = require("models/Account");
	var ProfileModel = require("models/ProfileModel");

	api.listenUpdate('notifs', function(count) {
		$('#notif-count')
			.css('display', count ? 'block' : 'none')
			.html(count);
	});


	api.listenUpdate('avatar', function(state) {
		if (state === true){
			var account = new AccountModel({
					id: api.getUserId()
			});
			account.fetch();

			var profile = new ProfileModel({
					id: api.getUserId()
			});
			profile.fetch(router.previewView.refreshBox("basic-box"));
			alerts.success('Your profile picture has been updated');
		}
	});

	var NotificationsView = Backbone.View.extend({
		el: "#main",

		activePage: 1,
		lastPage: null,

		events: {
			'click #search-btn': 'filter',
			'click #notifications-pager a.button-pager-next': 'nextPage',
			'click #notifications-pager a.button-pager-previous': 'previousPage',
			'click #delete-all-selected': function(e) {
				e.preventDefault();
				this.removeSelection();
			},
			'change .messages-check': function(e){
				var thread = $(e.target).closest('.notification-item').data('thread');

				this.selection = this.selection.filter(function(a) { return a !== thread; });
				if ($(e.target).is(':checked'))
					this.selection.push(thread);
			},
			'change #main-checker': function(e) {
				var a = this.$list.find('input[type="checkbox"]');
				if ($(e.target).is(':checked')) {
					a.attr('checked', 'checked');
					this.selection = this.threads.concat();
				} else {
					a.removeAttr('checked');
					this.selection = [];
				}
			},
			'keyup #search-query': function(event) {
				if (event.keyCode === 13)
					this.filter();
			}
		},

		initialize: function(){
			this.selection = [];
			this.refresh = this.refresh.bind(this);
			this.threads = null;
		},

		render: function(filters) {
			this.rendered = true;
			this.$el.html(notificationsTpl(filters));
			this.$list = this.$('#notifications-list');

			if (Object.keys(filters || {}).length)
				this.unserializeFilters(filters);

			this.selectTab(filters && filters.kind);
			var self = this;
			this.$('#notification-type').delegate('li', 'click', function() {
				self.$('.button.selected').removeClass('selected');
				self.$('.button[data-filter="' + $(this).data('filter') + '"]').addClass('selected');
				self.$('#search-query').val('');
				self.filter();
			});

			this.$('#notification-sender').delegate('input', 'change', this.filter.bind(this));
			this.$('select#ri-filters').on('change', this.filter.bind(this));

			this.$('#ri-status').on('change', this.filter.bind(this));

			//this.$('#ri-status').on('change', this.filter.bind(this)).hide(); Sergi was here, so what?!


			return this.loadData(filters).then(this.refresh);
		},

		unserializeFilters: function(filters) {
			if (filters.search)
				this.$('#search-query').val(filters.search);

			if(filters.target) {
				filters.target.split(',').forEach(function(target) {
					this.$('#notification-sender [name="' + target + '"]').attr('checked', 'checked');
				}, this);
			}

			if (filters.state)
				this.$('#ri-status').val(filters.state);

			if (filters.order)
				this.$('#ri-filters').val(filters.order);
		},

		serializeFilters: function() {
			if (!this.rendered)
				return null;

			var result = {};

			if (this.activePage !== 1)
				result.page = this.activePage;

			var query = this.$('#search-query').val();
			if (query)
				result.search = query;

			var kind = this.$('.button.selected').data('filter');
			if (kind)
				result.kind = kind;

			var target = this.$('#notification-sender input:checked');
			if (target.length)
				result.target = target.toArray().map(function(el) { return el.getAttribute('name') }).join(',');

			var status = this.$('#ri-status').val();
			if (kind === 'reqinv' && status)
				result.state = status;

			var order = this.$('#ri-filters').val();
			if (order && order !== 'date')
				result.order = order;

			return Object.keys(result).length ? result : null;
		},

		filter: function() {
			this.resetPager();
			this.applyFilters();
		},

		applyFilters: function() {
			var filters = this.lastFilters || this.serializeFilters();
			this.lastFilters = null;
			document.location.hash = filters ? '#/messages/filter/' + JSON.stringify(filters) : '#/messages';
		},

		loadData: function(params) {
			if (params && params.target && params.target.indexOf(',') !== -1)
				params.target = null;

			return api.get('/api/v1/notificationslist', params)
				.prop('data')
				.then(function(data) {
					data.items.forEach(function(item) {
						if (item.location.indexOf('Not specified') === 0)
							item.location = null;
						item.isMessage = item.kind === 'message';
					});

					return data;
				});
		},

		removeSelection: function() {
			var self = this;
			api.put('/api/v1/notificationslist', { threads: this.selection })
			.then(this.render.bind(this))
			.then(function(){
				alerts.success('Threads successfully deleted');
				self.selection.length = 0;
			});
		},

		getThreads: function() {
			var self = this;
			return this.threads ?
				Promise.normalize(this.threads) :
				this.loadData().then(function(data) {
					self.threads = data.items.map(function(item) {
						return item.reference;
					});
					return self.threads;
				});
		},

		refresh: function(data) {
			if (!this.lastPage)
				this.lastPage = Math.ceil(data.count / data.items.length);

			var self = this;
			this.$list.html(data.items.map(itemTpl).join(''));
			this.$list.children()
				.click(function(evt) {
					if ($(evt.target).attr('href'))
						return;
					var thread = $(this).data('thread');
					self.lastFilters = self.serializeFilters();
					document.location.hash = '#/messages/' + thread;
				})
				.map(function() {
					var check = $('<div class="messages-check"><input type="checkbox"></div>');
					$(this).prepend(check);
					return check.get(0);
				})
				.click(function() {
					event.stopPropagation();
				});

			this.renderCounters(data.startResult, data.endResult, data.count);

			this.threads = data.items.map(function(item) {
				return item.reference;
			});
			utils.resetMain();

			return this.threads;
		},

		destroy: function(){
			this.remove();
			this.unbind();
		},

		selectTab: function(type) {
			type = type || '';
			this.$('.button.selected').removeClass('selected');
			this.$('.button[data-filter="' + type + '"]').addClass('selected');

			if (type === 'reqinv')
				this.addFilters();
			else
				this.removeFilters();
		},

		addFilters: function(){
			if (this.$('#ri-status').is(':visible'))
				return;

			this.$('#ri-status').show();
			this.$("#ri-filters")
			    .append('<option value="type">Wing Type</option>')
			    .append('<option value="date-start">Wing Date</option>');
		},

		removeFilters: function(){
			if (!this.$('#ri-status').is(':visible'))
				return;

			this.$('#ri-status').hide();
			this.$("#ri-filters")
				.find('option[value=type], option[value=date-start]')
				.remove();
		},

		renderCounters: function(){
			var args = arguments;
			this.$(".resultCounter").find("span").wrap(function(span){
				$(this).text(args[span]);
			});
		},

		nextPage: function(e){
			if (e) e.preventDefault();
			if (this.activePage + 1 > this.lastPage)
				return Promise.resolved(false);

			++this.activePage;
			return this.applyFilters();
		},

		previousPage: function(e){
			if (e) e.preventDefault();
			if (this.activePage - 1 < 1)
				return Promise.resolved(false);

			--this.activePage;
			return this.applyFilters();
		},

		resetPager: function(){
			this.activePage = 1;
			this.lastPage = null;
		}
	});

	return new NotificationsView;
});
