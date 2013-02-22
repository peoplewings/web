define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var api = require('api2');
	var appHeaderView = require('views/app/header');
	var homeView = require('views/home/main');
	var UserModel = require('models/Account');
	var ProfileModel = require('models/Profile');

	var logoutView = Backbone.View.extend({

		logout: function() {
			var self = this;

			api.post(api.getApiVersion() + '/noauth/', {})
				.then(function(){
					self.goodbye();
				});
		},

		goodbye: function() {
			api.clearAuthToken()
			new ProfileModel({ id: api.getUserId() }).clear();
			new UserModel({ id: api.getUserId() }).clear();
			router.navigate("/#/");
			location.reload()
		}
	});

	return new logoutView;
});
