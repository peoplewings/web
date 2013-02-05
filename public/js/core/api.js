API = function() {

	var server = 'http://peoplewings-backend.herokuapp.com'
	var apiVersion = '/api/v1'

	function request(method, uri, body, callback, errorCallback) {

		var url = server + uri

		var request = new XMLHttpRequest();
		var requestBody = null

		request.open(method, url, true);

		request.onreadystatechange = function(oEvent) {
			var responseBody = null;
			var cb = callback ||
			function() {};

			if(request.readyState === 4) {
				if(request.responseText) {
					responseBody = JSON.parse(request.responseText)
				}
				if(request.status < 300) {
					cb(responseBody, request.status)
				} else {
					if(request.status === 401) {
						localStorage.removeItem("Peoplewings-Auth-Token");
						location.hash = '/login'
					}

					if(errorCallback) errorCallback(responseBody, request.status);
					else throw new Error(responseBody);
				}
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
	}

	function addParams(uri, params) {
		var separator = "?";
		var url = uri;
		for(var prop in params) {
			url += separator + encodeURIComponent(prop) + "=" + encodeURIComponent(params[prop])
			separator = "&";
		}
		return url
	}

	function loadAuthToken() {
		return localStorage.getItem("Peoplewings-Auth-Token")
	}
	return {
		delete: function(uri, body, callback, errorCallback) {
			request('DELETE', uri, body, callback, errorCallback);
		},
		put: function(uri, body, callback, errorCallback) {
			request('PUT', uri, body, callback, errorCallback);
		},
		post: function(uri, body, callback, errorCallback) {
			request('POST', uri, body, callback, errorCallback);
		},
		get: function(uri, params, callback, errorCallback) {
			request('GET', addParams(uri, params), null, callback, errorCallback);
		},
		encodeParams: function(params){
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
		},
	}
}();