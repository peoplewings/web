define(function(require) {

	var $ = require("jquery");
	var Promise = require("promise");
	var Backbone = require("backbone");
	var api = require("api2");
	var profileTpl = require("tmpl!templates/app/user-profile.html");
	var phrases = require('phrases');
	var notifications = require('views/lib/notifications');


	var userProfile = Backbone.View.extend({
		el: "#main",

		events: {
			"click button.send-message-btn": "sendMessage",
			"click button.send-request-btn": "sendRequest",
			"click button.send-invitation-btn": "sendInvitation",
		},

		initialize: function(userId) {
			this.userId = userId
			this.refresh = this.refresh.bind(this)
		},

		render: function(userId) {
			if (userId)
				this.userId = userId;

			var self = this;
			Promise.parallel(
				api.get('/api/v1/profiles/' + this.userId + '/preview'),
				api.get('/api/v1/profiles/' + this.userId + '/accomodations/preview')
			).spread(function(profile, wings) {
				profile.data.wings = wings.data.map(function(wing) {
					wing.smoking = phrases.choices["smoking"][wing.smoking]
					wing.whereSleepingType = phrases.choices["whereSleepingType"][wing.whereSleepingType]
					wing.status = phrases.choices["wingStatus"][wing.status]
					return wing
				})
				profile.data.civilState = phrases.choices["civilState"][profile.data.civilState]
				self.name = profile.data.firstName + " " + profile.data.lastName;
				return profile.data
			}).then(this.refresh);

		},

		refresh: function(data) {
			$(this.el).html(profileTpl(data))
		},

		sendMessage: function(event) {
			notifications.message(this.userId, this.name);
		},

		sendRequest: function(event) {
			notifications.request(this.userId, this.name);
		},

		sendInvitation: function(event) {
			notifications.invitation(this.userId, this.name);
		}
	});

	return userProfile;
});
