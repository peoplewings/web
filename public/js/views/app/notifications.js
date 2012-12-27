define(function(require){

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var notificationsTpl = require("tmpl!templates/app/notifications.html");
	var itemTpl = require("tmpl!templates/app/notification.html");

	var notificationsView = Backbone.View.extend({
		el: "#main",

		events: {
			'click #search-btn': 'search',
			'click #notifications-pager > button.nextPage': 'nextPage',
			'click #notifications-pager > button.previousPage': 'previousPage',
			'keyup .search-query': function(event) {
				if (event.keyCode === 13)
					this.search();
			}
		},

		initialize: function(){
			this.refresh = this.refresh.bind(this);
		},

		search: function() {
			var query = this.$('.search-query').val();

			api.get('/api/v1/notificationslist?search=' + encodeURIComponent(query))
				.prop('data')
				.then(this.refresh);
		},

		render: function(){
			this.$el.html(notificationsTpl);
			this.$list = this.$('#notifications-list');
			this.$('.notification-type').delegate('li', 'click', this.onTypeFilterClick.bind(this));
			this.$('.notification-sender').delegate('input', 'change', this.filter.bind(this));
			this.$('select.ri-filters').on('change', this.filter.bind(this))
			this.$('.ri-status')
				.hide()
				.find('select')
				.on('change', this.filter.bind(this));

			api.get('/api/v1/notificationslist')
				.prop('data')
				.then(this.refresh);
		},

		filter: function() {
			this.$('.search-query').val('');

			var data = [];

			var kind = this.$('.button.selected').data('filter');
			if (kind)
				data.push('kind=' + kind);

			var target = this.$('.notification-sender input:checked');
			if (target.length === 1)
				data.push('target=' + target.attr('name'));

			var status = this.$('.ri-status select').val()
			if (kind === 'reqinv' && status)
				data.push('state=' + status);

			var order = this.$('select.ri-filters').val();
			if (order)
				data.push('order=' + order)
				

			return api.get('/api/v1/notificationslist?' + data.join('&'))
				.prop('data')
				.then(this.refresh);
		},

		refresh: function(data) {
			data.forEach(function(item) {
				item.isMessage = item.kind === 'messages';
			});

			this.$list.html(data.map(itemTpl).join(''));
		},

		destroy: function(){
			this.remove();
			this.unbind();
		},

		onTypeFilterClick: function(event) {
			var target = $(event.currentTarget);
			var isReqInv = target.data('filter') === 'reqinv';

			this.$('.ri-status')[isReqInv ? 'show' : 'hide']();
			this.$('#search-btn').parent()
				.removeClass('offset4 offset6')
				.addClass(isReqInv ? 'offset4' : 'offset6');

			if (isReqInv) this.addFilters()
			else this.removeFilters()


			this.$('.button.selected').removeClass('selected');

			target.addClass('selected');
			this.filter();
		},

		addFilters: function(){
			this.$(".ri-filters")
			    .append('<option value="type">Wing Type</option>')
			    .append('<option value="date-start">Wing Date</option>');
		},

		removeFilters: function(){
			this.$(".ri-filters")
				.find('option[value=type]')
				.remove()
				.end()
				.find('option[value=date-start]')
				.remove()
		},

		nextPage: function(){
			console.log('nextPage')
		},

		previousPage: function(){
			console.log('previousPage')
		}
	});

	return new notificationsView;
});
