/*globals FB */

define(function(require) {

	var Promise = require('promise');
	var api = require('api');
	var cookies = require('core/cookies');
	var login = require('tools/login');

	function askFbLogin() {
		var prom = new Promise();

		FB.login(function(response) {
			if (!response.authResponse) prom.reject();
			else prom.resolve(response.authResponse);
		}, { scope: 'email,user_about_me,user_birthday,user_hometown,user_location' });

		return prom.future;
	}

	function pwLogin(userID) {
		var cookie = cookies.startWith('fbsr_');

		return api.post(api.getApiVersion() + '/authfb/', {
			fbid: userID,
			appid: cookie.name,
			token: cookie.value,
		});
	}

	function connect() {
		return askFbLogin()
			.then(linkPeoplewings);
	}

	function linkPeoplewings(userID) {
		pwLogin(userID).then(function(response) {
			if (response.status)
				return response.data;
			else
				throw 'PW_FB_LOGIN_FAILED';
		}).then(function(data) {
			login.onSuccess(data, true);
		});
	}

	return {
		connect: connect,
		linkPeoplewings: linkPeoplewings,
	};
});
