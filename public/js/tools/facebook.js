define(function(require) {

	var Promise = require('promise');
	var api = require('api2');

	function askFbLogin() {
		var prom = new Promise();

		FB.login(function(response) {
			if (!response.authResponse) prom.reject();
			else prom.resolve(response.authResponse);
		}, { scope: 'email,user_about_me,user_birthday,user_hometown,user_location' });

		return prom.future;
	}

	function pwCallback(data) {
		if (data.status) {
			api.saveAuthToken(JSON.stringify({
				auth: data.xAuthToken,
				uid: data.idAccount
			}));

			router.header = new Header;
			router.navigate("#/search");
		}

		return data.status;
	}

	function pwLogin(fbData) {
		return api.post(api.getApiVersion() + '/authfb/', { fbid: fbData.userID })
			.then(pwCallback);
	}

	function pwRegister() {
		var prom = new Promise();

		FB.api('/me', function(response) {
			var birth = response.birthday.split('/').map(function(a) { return parseInt(a, 10) });

			var registerData = {
				fbid: response.id,
				firstName: response.first_name,
				lastName: response.last_name,
				email: response.email,
				gender: response.gender[0].toUpperCase() + response.gender.substr(1),
				birthdayDay: birth[0],
				birthdayMonth: birth[1],
				birthdayYear: birth[2],
			};

			api.post(api.getApiVersion() + '/connectfb/', registerData)
				.then(pwCallback)
				.then(prom.resolve.bind(prom));
		});

		return prom.future;
	}

	function connect() {
		return askFbLogin()
			.then(pwLogin)
			.then(function(success) {
				return success || pwRegister();
			});
	}

	return {
		connect: connect,
	};
});
