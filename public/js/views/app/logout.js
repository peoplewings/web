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
			api.post(api.getApiVersion() + '/noauth/', {}, this.logoutSuccess(this))
		},

		logoutSuccess: function(scope) {
			return function(response) {
				if (response.status===true) {
					if (response.code === 200) {
						console.log('Trying to destroy...')
						scope.goodbye()
					}
				} else {
					for (var error in response.error)
						console.error("Server said: " + error + " : " + response.error[error])
				}
			}
		},

		goodbye: function() {
			api.clearAuthToken()
			new ProfileModel({ id: api.getUserId() }).clear();
			new UserModel({ id: api.getUserId() }).clear();
			window.router.navigate("/#/")
			location.reload()
		}
	});

	return new logoutView;
});
