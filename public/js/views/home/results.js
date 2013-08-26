define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var Promise = require('promise');
	var api = require('api');
	var notifications = require('views/lib/notifications');
	var resultsTpl = require('tmpl!templates/home/search_result.html');
	var chatMng = require('views/chat/chat_manager');

	var resultsView = Backbone.View.extend({

		el: '#search-results',

		events: {
			"click button.send-chat-btn": "sendChat",
			'click button.send-message-btn': 'sendMessage',
			'click button.send-request-btn': 'sendRequest',
			'click button.send-invitation-btn': 'sendInvitation',
			'click .pager-content a.button-pager-next': 'nextPage',
			'click .pager-content a.button-pager-previous': 'previousPage'
		},

		initialize: function(options) {
			this.$el = $('#search-results');
			this.el = this.$el[0];
			this.namesById = {};
			this.logged = options.logged;
			this.query = options.query;
			this.type = options.type;
		},

		setQuery: function(query) {
			this.query = query;
		},
		render: function(results, hasWings, myId) {
			var self = this;
			this.$el.html(resultsTpl({
				notlogged: !self.logged,
				isPeople: this.type === 'people',
				startResult: results.startResult,
				endResult: results.endResult,
				totalCount: results.count,
				locationSearch: self.query.wings,
				applicant: self.query.type === 'Applicant',
				iHaveWings: hasWings,
				results: results.profiles.map(function(result) {
					result.id = result.profileId;
					result.isNotMine = result.profileId !== myId;
					self.namesById[result.id]  = result.firstName + ' ' + result.lastName;
					return result;
				})
			}));

			this.$('span.dot.online').tooltip({
				animation: true,
				placement: 'right',
				trigger: 'hover',
				delay: {
					show: 500,
					hide: 100,
				}
			});

			this.lastPage = results.count / results.endResult;

			$('[id^=collapse]').on('hide', function() {
				self.toggleCollapsibleText(this, 'less', 'more');
			});

			$('[id^=collapse]').on('show', function() {
				self.toggleCollapsibleText(this, 'more', 'less');
			});

			if (!self.logged)
				$('#feedback-btn').hide();

		},
		nextPage: function() {
			var scope = this;
			var myId = api.getUserId();
			if (+this.query.page === this.lastPage) return false;
			this.query.page++;

			Promise.parallel(
				api.get(api.getApiVersion() + '/profiles', this.query).prop('data'),
				myId && api.get(api.getApiVersion() + '/wings?author=' + myId).prop('data')
			).spread(scope.render.bind(this));
			return false;
		},
		previousPage: function() {
			var scope = this;
			var myId = api.getUserId();
			if (+this.query.page === 1) return false;
			this.query.page--;

			Promise.parallel(
				api.get(api.getApiVersion() + '/profiles', this.query).prop('data'),
				myId && api.get(api.getApiVersion() + '/wings?author=' + myId).prop('data')
			).spread(scope.render.bind(this));
			return false;
		},
		close: function() {
			this.remove();
			this.unbind();
		},

		_sendNotification: function(event, type) {
			var id = this._sendHelper(event);
			var name = this.namesById[id];
			notifications[type](id, name);
		},

		_sendHelper: function(event) {
			if (!this.logged)
				return router.navigate('#/register');

			var id = $(event.target).parents('.search-result').data('profile-id');
			return id;
		},

		sendChat: function(event) {
			var id = this._sendHelper(event);
			chatMng.openRoom(id);
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
