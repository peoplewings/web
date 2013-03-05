define(function(require) {

	var api = require('api2');

	window.API = {
		delete: function(uri, body, callback, errorCallback) {
			api.delete(uri, body).then(callback, errorCallback);
		},
		put: function(uri, body, callback, errorCallback) {
			api.put(uri, body).then(callback, errorCallback);
		},
		post: function(uri, body, callback, errorCallback) {
			api.post(uri, body).then(callback, errorCallback);
		},
		get: function(uri, params, callback, errorCallback) {
			api.get(uri, params).then(callback, errorCallback);
		},

		encodeParams: api.urlEncode,
		saveAuthToken: api.saveAuthToken,
		clearAuthToken: api.clearAuthToken,
		userIsLoggedIn: api.userIsLoggedIn,
		getServerUrl: api.getServerUrl,
		getApiVersion: api.getApiVersion,
		getUserId: api.getUserId,
		getAuthToken: api.getAuthToken
	};

	return window.API;
});
