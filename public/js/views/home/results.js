define(function(require){

	var $ = require('jquery');
	var Backbone = require('backbone');
	var api = require('api2');
	var utils = require('utils');
	var notifications = require('views/lib/notifications');
	var resultsTpl = require('tmpl!templates/home/search_result.html');

	var resultsView = Backbone.View.extend({

		el: "#search-results",

		events: {
			"click button.send-message-btn": "sendMessage",
			"click button.send-request-btn": "sendRequest",
			"click button.send-invitation-btn": "sendInvitation",
			"click a.nextPage": "nextPage",
			"click a.previousPage": "previousPage"
		},

		initialize: function(options){
			this.namesById = {};
			this.logged = options.logged;
			this.query = options.query;
		},
		setQuery: function(query){
			this.query = query;
		},
		render: function(results){
			var self = this;

			this.$el.html(resultsTpl({
				notlogged: !self.logged,
				startResult: results.startResult,
				endResult: results.endResult,
				totalCount: results.count,
				locationSearch: self.query.wings,
				applicant: self.query.type === "Applicant",
				results: results.profiles.map(function(result) {
					result.live = (result.online === 'ON') ? true : false;
					result.online = (result.online === 'ON') ? 'Online' : false;
					result.id = result.profileId;
					result.replyTime = utils.formatReplyTime(+result.replyTime);
					self.namesById[result.id] = result.firstName + ' ' + result.lastName;
					return result;
				})
			}));

			this.lastPage = results.count/results.endResult;

		},
		nextPage: function(){
			var scope = this;
			if (+this.query.page === this.lastPage)
				return false;
			this.query.page++;
			api.get(api.getApiVersion() + "/profiles", this.query).then(function(results){
				scope.render(results.data);
			});
			return false;
		},
		previousPage: function(){
			var scope = this;
			if (+this.query.page === 1)
				return false;
			this.query.page--;
			api.get(api.getApiVersion() + "/profiles", this.query).then(function(results){
				scope.render(results.data);
			});
			return false;
		},
		close: function(){
			this.remove();
			this.unbind();
		},

		sendMessage: function(event) {
			var id = $(event.target).parents('.search-result').data('profile-id');
			var name = this.namesById[id];
			notifications.message(id, name);
		},

		sendRequest: function(event) {
			var id = $(event.target).parents('.search-result').data('profile-id');
			var name = this.namesById[id];
			notifications.request(id, name);
		},

		sendInvitation: function(event) {
			var id = $(event.target).parents('.search-result').data('profile-id');
			var name = this.namesById[id];
			notifications.invitation(id, name);
		}
	});
	return resultsView;
});
