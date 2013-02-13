define(function(require) {

	var Promise = require('promise');
	var alerts = require('views/lib/alerts');
	var server = 'http://peoplewings-backend.herokuapp.com';
	var apiVersion = '/api/v1';

	function logout() {
		alerts.error('ERROR', 'Invalid session');
		localStorage.removeItem("Peoplewings-Auth-Token");
		document.location.hash = '/login'
		document.location.refresh(true);
	}

	function request(method, uri, body) {
		var prom = new Promise();
		var url = server + uri
		var request = new XMLHttpRequest();
		var requestBody = null

		request.open(method, url, true);

		request.onreadystatechange = function(oEvent) {
			if(request.readyState === 4) {
				if (request.status == 401)
					return logout();

				try {
					var response = JSON.parse(request.responseText);
				} catch(err) {
					console.error('Invalid JSON (', uri, '): ', request.responseText);
					return prom.reject(err);
				}

				if (response.status)
					return prom.resolve(response);

				// ANALYZE ERROR

				if (!response.errors || !response.errors.length)
					return alerts.error('ERROR', 'Sorry an error ocurred');

				response.errors.forEach(function(error) {
					switch (error) {
						case 'AUTH_REQUIRED':
							logout();
							break;

						case 'INVALID':
						case 'FIELD_REQUIRED':
						case 'TOO_LONG':
						case 'NOT_EMPTY':
						case 'NO_CONTENT':
						case 'FORBIDDEN':
						case 'INTERNAL_ERROR':
						case 'START_DATE_GT_END_DATE':
							alerts.error(JSON.stringify(error, null, '\t'), {autoclose:0});
							break;

						default:
							alerts.error('UNKNOWN ERROR TYPE:\n' + JSON.stringify(error, null, '\t'), {autoclose:0});
					}
				});
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
