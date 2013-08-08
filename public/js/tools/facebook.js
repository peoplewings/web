/*globals FB */

define(function(require) {

	var Promise = require('promise');
	var api = require('api');
	var cookies = require('core/cookies');

	function askFbLogin() {
		var prom = new Promise();

		console.log('FB_LOGIN');
		FB.login(function(response) {
			console.log('RESPONSE', response);
			if (!response.authResponse) prom.reject();
			else console.log('FB',response.authResponse), prom.resolve(response.authResponse);
		}, { scope: 'email,user_about_me,user_birthday,user_hometown,user_location' });

		return prom.future;
	}

	function pwLogin(fbData) {
		var cookie = cookies.startWith('fbsr_');

		return api.post(api.getApiVersion() + '/authfb/', {
			fbid: fbData.userID,
			appid: cookie.name,
			token: cookie.value,
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
