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
			'keyup .search-query': function(event) {
				if (event.keyCode === 13)
					this.search();
			}
		},

		initialize: function(){
			this.refresh = this.refresh.bind(this);
		},

		search: function() {
			var query = $('.search-query').val();

			api.get('/api/v1/notificationslist?search=' + encodeURIComponent(query))
				.prop('data')
				.then(this.refresh);
		},

		render: function(){
			this.$el.html(notificationsTpl);
			this.$list = this.$('#notifications-list');
			this.$('.notification-type').delegate('li', 'click', this.onTypeFilterClick.bind(this));

			api.get('/api/v1/notificationslist')
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
			console.log('FILTER BY NOTIFICATION TYPE: ' + target.data('filter'));
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
		}
	});

	return new notificationsView;
});
