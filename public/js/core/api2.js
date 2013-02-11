define(function(require) {

	var Promise = require('promise');
	var server = 'http://peoplewings-backend.herokuapp.com';
	var apiVersion = '/api/v1';

	function request(method, uri, body) {
		var prom = new Promise();
		var url = server + uri
		var request = new XMLHttpRequest();
		var requestBody = null

		request.open(method, url, true);

		request.onreadystatechange = function(oEvent) {
			if(request.readyState === 4) {
				try {
					var responseBody = request.responseText ? JSON.parse(request.responseText) : null;
				} catch(err) {
					console.error('Invalid JSON (', uri, '): ', request.responseText);
					return prom.reject(err);
				}

				if (request.status)
					return prom.resolve(responseBody);

				// ANALYZE ERROR

				if (request.status === 401) {
					localStorage.removeItem("Peoplewings-Auth-Token");
					document.location.hash = '/login'
					document.location.refresh(true);
					return;
				}


				console.error('Unknown request code', request.responseText);
			}
		}
		if(body) {
			requestBody = JSON.stringify(body);
			request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
		}
		if(loadAuthToken()) {
			request.setRequestHeader("X-Auth-Token", JSON.parse(loadAuthToken()).auth)
		}
		request.send(requestBody)

		return prom.future;
	}

	function addParams(url, params) {
		return url + '?' + _.map(params, function(value, key) {
			return encodeURIComponent(key) + '=' + encodeURIComponent(value);
		}).join('&');
	}

	function loadAuthToken() {
		return localStorage.getItem("Peoplewings-Auth-Token")
	}

    return {
		delete: function(uri, body) {
			return request('DELETE', uri, body);
		},
		put: function(uri, body) {
			return request('PUT', uri, body);
		},
		post: function(uri, body) {
			return request('POST', uri, body);
		},
		get: function(uri, params) {
			return request('GET', addParams(uri, params), null);
		},

		urlEncode: function(params){
			return addParams("", params);
		},
		saveAuthToken: function(authToken) {
			localStorage.setItem("Peoplewings-Auth-Token", authToken)
		},
		clearAuthToken: function() {
			localStorage.removeItem("Peoplewings-Auth-Token")
		},
		userIsLoggedIn: function() {
			return loadAuthToken() != null
		},
		getServerUrl: function() {
			return server
		},
		getApiVersion: function() {
			return apiVersion
		},
		getUserId: function() {
			if(loadAuthToken() != null) return JSON.parse(loadAuthToken()).uid
		},
		getAuthToken: function() {
			if(loadAuthToken() != null) return JSON.parse(loadAuthToken()).auth
		}
    };

});
