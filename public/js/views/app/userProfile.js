define(function(require) {

	var $ = require("jquery");
	var Promise = require("promise");
	var Backbone = require("backbone");
	var api = require("api2");
	var profileTpl = require("tmpl!templates/app/user-profile.html");
	var phrases = require('phrases');


	var userProfile = Backbone.View.extend({
		el: "#main",

		initialize: function(userId) {
			this.userId = userId
			this.refresh = this.refresh.bind(this)
		},

		render: function(userId) {
			if (userId) this.userId = userId
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
				return profile.data
			}).then(this.refresh);

		},

		refresh: function(data) {

			$(this.el).html(profileTpl(data))

		},


	});

	return userProfile;
});
