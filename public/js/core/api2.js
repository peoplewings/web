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

				if (!response.errors || !response.errors.length) {
					prom.reject(new Error('Server error'));
					alerts.error('ERROR', 'Sorry an error ocurred');
					return;
				}

				var errorOptions = {autoclose:5000};

				response.errors.forEach(function(error) {
					switch (error) {
						case 'AUTH_REQUIRED':
							logout();
							break;

						case 'INVALID_USER_OR_PASS':
							alerts.error('Wrong email or password', errorOptions);
							break;

						case 'INACTIVE_USER':
							alerts.error('Your account is not activated. Please check your email inbox', errorOptions);
							break;

						case 'EXPIRED_KEY':
							alerts.error('Your key has expired.', errorOptions);
							break;

						case 'USED_KEY':
							alerts.error('This key is already activated.', errorOptions);
							break;

						case 'EMAIL_IN_USE':
							alerts.error('The gicen email is already in use', errorOptions);
							break;

						case 'BAD_REQUEST':
						case 'FIELD_REQUIRED':
						case 'FORBIDDEN':
						case 'INCORRECT_PASSWORD':
						case 'INTERNAL_ERROR':
						case 'INVALID':
						case 'INVALID_FIELD':
						case 'JSON_ERROR':
						case 'METHOD_NOT_ALLOWED':
						case 'NO_CONTENT':
						case 'NOT_EMPTY':
						case 'START_DATE_GT_END_DATE':
						case 'TOO_LONG':
						case 'VALIDATION_ERROR':
							alerts.error(JSON.stringify(error, null, '\t'), {autoclose:0});
							break;

						default:
							alerts.error('UNKNOWN ERROR TYPE:\n' + JSON.stringify(error, null, '\t'), {autoclose:0});
					}
				});

				prom.reject(response.errors);
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
