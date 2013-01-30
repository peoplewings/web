define(function(require) {

	var api = require('api');
	var Promise = require('promise');

    return {
		delete: function(uri, body) {
			var promise = new Promise();
			api.delete(uri, body, promise.resolve.bind(promise), promise.reject.bind(promise));
			return promise.future;
    	},
	    put: function(uri, body) {
			var promise = new Promise();
			api.put(uri, body, promise.resolve.bind(promise), promise.reject.bind(promise));
			return promise.future;
    	},
    	post: function(uri, body) {
			var promise = new Promise();
			api.post(uri, body, promise.resolve.bind(promise), promise.reject.bind(promise));
			return promise.future;
    	},
    	get: function(uri, params) {
			var promise = new Promise();
			api.get(uri, params, promise.resolve.bind(promise), promise.reject.bind(promise));
			return promise.future;
    	},

    	urlEncode: api.encodeParams,
        saveAuthToken: api.saveAuthToken,
        clearAuthToken: api.clearAuthToken,
        userIsLoggedIn: api.userIsLoggedIn,
		getServerUrl: api.getServerUrl,
		getApiVersion: api.getApiVersion,
		getUserId: api.getUserId,
		getAuthToken: api.getAuthToken
    }

});
