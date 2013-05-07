define(function(require) {

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
			"click .pager-content a.button-pager-next": "nextPage",
			"click .pager-content a.button-pager-previous": "previousPage"
		},

		reset: function(options) {
			this.$el = $('#search-results');
			this.el = this.$el[0];
			this.namesById = {};
			this.logged = options.logged;
			this.query = options.query;
		},
		setQuery: function(query) {
			this.query = query;
		},
		render: function(results) {
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
					self.namesById[result.id]  = result.firstName + ' ' + result.lastName;
					return result;
				})
			}));

			this.lastPage = results.count / results.endResult;

			$('[id^=collapse]').on('hide', function() {
				self.toggleCollapsibleText(this, 'less', 'more');
			});

			$('[id^=collapse]').on('show', function() {
				self.toggleCollapsibleText(this, 'more', 'less');
			});

			if (!self.logged)
				$("#feedback-btn").hide();

		},
		nextPage: function() {
			debugger;
			var scope = this;
			if (+this.query.page === this.lastPage) return false;
			this.query.page++;
			api.get(api.getApiVersion() + "/profiles", this.query).then(function(results) {
				scope.render(results.data);
			});
			return false;
		},
		previousPage: function() {
			var scope = this;
			if (+this.query.page === 1) return false;
			this.query.page--;
			api.get(api.getApiVersion() + "/profiles", this.query).then(function(results) {
				scope.render(results.data);
			});
			return false;
		},
		close: function() {
			this.remove();
			this.unbind();
		},

		_sendNotification: function(event, type) {
			if (!this.logged)
				return router.navigate('#/register');

			var id = $(event.target).parents('.search-result').data('profile-id');
			var name = this.namesById[id];
			notifications[type](id, name);
		},

		sendMessage: function(event) {
			this._sendNotification(event, 'message');
		},
		sendRequest: function(event) {
			this._sendNotification(event, 'request');
		},
		sendInvitation: function(event) {
			this._sendNotification(event, 'invitation');
		},

		toggleCollapsibleText: function(target, targetText, replaceText) {
			var heading = $(target).next('.accordion-heading').find('span');
			var re = new RegExp('(' + targetText + ')');
			var changed = heading.html().replace(re, replaceText);
			heading.html(changed);
			if (targetText === 'more')
				$(heading).css('background-position', '-858px -16px');
			else
				$(heading).css('background-position', '-658px -16px');
		}
	});
	return resultsView;
});
