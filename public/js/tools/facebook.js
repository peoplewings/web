define(function(require) {

	var Promise = require('promise');
	var api = require('api2');
	var Header = require('views/app/header');

	function askFbLogin() {
		var prom = new Promise();

		FB.login(function(response) {
			if (!response.authResponse) prom.reject();
			else prom.resolve(response.authResponse);
		}, { scope: 'email,user_about_me,user_birthday,user_hometown,user_location' });

		return prom.future;
	}

	function pwLogin(fbData) {
		return api.post(api.getApiVersion() + '/authfb/', {
			fbid: fbData.userID,
			cookie: document.cookie,
		});
	}

	function connect(callback) {
		return askFbLogin().then(pwLogin).then(function(response) {
			if (response.status)
				callback(response.data);
			return response.status;
		});
	}

	return {
		connect: connect,
	};
});
