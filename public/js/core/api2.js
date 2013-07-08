define(function(require) {

	var _ = require('underscore');
	var Promise = require('promise');
	var alerts = require('views/lib/alerts');
	var spinner = require('views/lib/spinner');
	var config = require("config");

	var server = config.getValue('server');
	var apiVersion = config.getValue('apiVersion');

	function logout() {
		alerts.error('Your session has expired');
		localStorage.removeItem("Peoplewings-Auth-Token");
		document.location.hash = '/login';
		document.location.reload();
		// jsHint se queja de que se asigne un valor a una función
		//jshint -W021
		logout = function() { };
	}

	var updateListeners = {};

	function parseUpdates(updates) {
		console.log('UPDATES', updates);
		_.each(updates, function(value, key) {
			var listeners = updateListeners[key];
			if (!listeners)
				return;

			listeners.forEach(function(listener) {
				listener(value);
			});
		});
	}

	function registerUpdateListener(type, callback) {
		if (!updateListeners[type])
			updateListeners[type] = [];

		updateListeners[type].push(callback);
	}

	function simpleRequest(method, url, headers, body) {
		var prom = new Promise();
		var xhr = new XMLHttpRequest();
		xhr.open(method, url, true);

		_.each(headers, function(value, key) {
			xhr.setRequestHeader(key, value);
		});

		xhr.onreadystatechange = function() {
			if(xhr.readyState === 4)
				prom.resolve(xhr);
		};

		xhr.send(body);
		return prom.future;
	}


	function request(method, uri, body) {
		var reqId = _.uniqueId('request');
		var prom = new Promise();
		var url = server + uri;
		var xhr = new XMLHttpRequest();
		var requestBody = null;

		var resource = /\/api\/v1\/(\w+)/.exec(uri)[1];
		if (resource !== 'control')
			spinner.show(reqId, 1000);
		xhr.open(method, url, true);

		xhr.onreadystatechange = function() {
			if(xhr.readyState === 4) {
				spinner.hide(reqId);

				if (xhr.status === 401)
					return logout();

				pooling.restart();

				var response;
				try {
					response = JSON.parse(xhr.responseText);
				} catch(err) {
					console.error('Invalid JSON (', uri, '): ', xhr.responseText);
					return prom.reject(err);
				}

				if (response.updates)
					parseUpdates(response.updates);

				if (response.status)
					return prom.resolve(response);

				// ANALYZE ERROR

				if (!response.errors || !response.errors.length) {
					prom.reject(new Error('Server error'));
					alerts.error('ERROR', 'Sorry an error ocurred');
					return;
				}

				var errorOptions = {autoclose:60000};

				response.errors.forEach(function(error) {
					body;

					switch (error.type) {
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
						case 'INCORRECT_PASSWORD':
							alerts.error('Incorrect password', errorOptions);
							break;
						case 'UNDERAGE':
							prom.resolve({"errors": [{"type": "UNDERAGE"}], "status": false});
							break;
						case 'INVALID':
							if (error.extras.length !== 0)
								alerts.error('Invalid field ' + error.extras[0], errorOptions);
							else
								debugger;
							break;
						case 'BAD_REQUEST':
						case 'FIELD_REQUIRED':
						case 'FORBIDDEN':
						case 'INTERNAL_ERROR':
						case 'INVALID_FIELD':
						case 'JSON_ERROR':
						case 'METHOD_NOT_ALLOWED':
						case 'NO_CONTENT':
						case 'NOT_EMPTY':
						case 'START_DATE_GT_END_DATE':
						case 'TOO_LONG':
						case 'VALIDATION_ERROR':
							if (config.getValue('debug'))
								alerts.error(JSON.stringify(error, null, '\t'), {autoclose:0});
							break;

						default:
							if (config.getValue('debug'))
								alerts.error('UNKNOWN ERROR TYPE:\n' + JSON.stringify(error, null, '\t'), {autoclose:0});
					}
				});

				prom.reject(response.errors);
			}
		};

		if(body) {
			requestBody = JSON.stringify(body);
			xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
		}

		var token = loadAuthToken();
		if(token) {
			xhr.setRequestHeader("X-Auth-Token", token.auth);
		}

		xhr.send(requestBody);
		return prom.future;
	}

	function addParams(url, params) {
		return url + '?' + _.map(params, function(value, key) {
			return encodeURIComponent(key) + '=' + encodeURIComponent(value);
		}).join('&');
	}

	var pooling = {
		// seconds
		interval: 60,

		start: function() {
			this.timeout = setTimeout(this.tick, this.interval * 1000);
		},

		stop: function() {
			clearTimeout(this.timeout);
		},

		restart: function() {
			this.stop();
			this.start();
		},

		tick: function() {
			this.stop();
			if (loadAuthToken())
				request('GET', apiVersion + '/control');
		}
	};
	pooling.tick = pooling.tick.bind(pooling);
	pooling.start();

	function json(data) {
		return data ? JSON.parse(data) : null;
	}
	function loadAuthToken() {
		var data = json(localStorage.getItem('Peoplewings-Auth-Token'));
		if (!data) return null;
		if (data.remember) return data;
		return json(sessionStorage.getItem('Peoplewings-Auth-Token'));
	}
	function saveAuthToken(authToken) {
		var data = JSON.stringify(authToken);
		localStorage.setItem('Peoplewings-Auth-Token', data);
		sessionStorage.setItem('Peoplewings-Auth-Token', data);
	}
	function clearAuthToken() {
		localStorage.removeItem('Peoplewings-Auth-Token');
		sessionStorage.removeItem('Peoplewings-Auth-Token');
	}


	return {
		request: simpleRequest,

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

		control: function() {
			request('GET', apiVersion + '/control');
		},

		listenUpdate: registerUpdateListener,

		urlEncode: function(params){
			return addParams("", params);
		},
		saveAuthToken: saveAuthToken,
		clearAuthToken: clearAuthToken,
		userIsLoggedIn: function() {
			return loadAuthToken();
		},
		getServerUrl: function() {
			return server;
		},
		getApiVersion: function() {
			return apiVersion;
		},
		getUserId: function() {
			var token = loadAuthToken();
			return token ? token.uid : null;
		},
		getAuthToken: function() {
			var token = loadAuthToken();
			return token ? token.auth : null;
		}
	};

});
