define(function(require){

	var $ = require('jquery');
	var Backbone = require('backbone');
	var utils = require('utils');
	var api = require('api2');
	var UserAccount = require('models/Account');
	var resultsTpl = require('tmpl!templates/home/search_result.html');
	var modalTpl = require('tmpl!templates/lib/modal2.html');
	var sendMessageTpl = require('tmpl!templates/lib/send-message.html');

	var resultsView = Backbone.View.extend({
		//el: "#search-results",
		events: {
			"click button.send-message-btn": "sendMessage",
			"click button.send-request-btn": "sendRequest",
			"click button.send-invitation-btn": "sendInvitation",
			"click a.nextPage": "nextPage",
			"click a.previousPage": "previousPage"
		},

		initialize: function(options){
			this.namesById = {};
			this.targetEl = options.target
			this.logged = options.logged
			this.query = options.query
			this.blurrStyle = (this.logged === false) ? 'style="color: transparent;text-shadow: 0 0 5px rgba(0,0,0,0.5)"' : ""
		},
	    render: function(results){
	    	var self = this;

			this.$el.html(resultsTpl({
				blurrStyle: this.blurrStyle,
				startResult: results.startResult,
				endResult: results.endResult,
				totalCount: results.count,
				results: results.profiles.map(function(result) {
					result.id = result.resourceUri.split("/")[4];
					self.namesById[result.id] = result.firstName + ' ' + result.lastName;
					return result;
				})
			}));
			$(this.targetEl).after(this.$el)
	    },
		nextPage: function(evt){
			//console.log("next", this.query.page)
			var scope = this
			this.query.page++
			api.get(api.getApiVersion() + "/profiles", this.query).then(function(results){
				scope.render(results.data)
			})
			return false
		},
		previousPage: function(){
			//console.log("previous", this.query.page)
			var scope = this
			this.query.page--
			api.get(api.getApiVersion() + "/profiles", this.query).then(function(results){
				scope.render(results.data)
			})
			return false
		},
		close: function(){
			this.remove()
			this.unbind()
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
