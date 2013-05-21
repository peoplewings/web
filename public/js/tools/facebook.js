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
		}).then(pwCallback);
	}

	function pwCallback(response) {
		if (response.status) {

			api.saveAuthToken(JSON.stringify({
				auth: response.data.xAuthToken,
				uid: response.data.idAccount
			}));

			router.header = new Header;
			router.navigate("#/search");
		}

		return response.status;
	}

	function connect() {
		return askFbLogin().then(pwLogin);
	}

	return {
		connect: connect,
	};
});
