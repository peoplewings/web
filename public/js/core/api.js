var API = function(){
	
	var baseUrl = 'http://peoplewings-backend.herokuapp.com'
	var apiVersion = '/api/v1'
	
	function errorCb(error){
			console.log(error)
	}
	
	function requestPOST(resource, values, successCb, failCb){
		
		var headers = {}
		
		if (loadAuthToken()) headers = { "X-Auth-Token": loadAuthToken() }
		$.ajax({
		  url: baseUrl + resource,
		  type: 'post',
		  crossDomain: true,
		  data: JSON.stringify(values),
  		  dataType: "json",
		  contentType: "application/json",
    	  success: successCb,
	      failure: failCb | errorCb,
		  headers: headers,
  		  //withCredentials: true
		})
	}
	function requestGET(resource, method, parameters, successCb, failCb){
		
		var headers = {}
		
		if (loadAuthToken()) headers = { "X-Auth-Token": loadAuthToken()}
		
		$.ajax({
		  url: baseUrl + resource,
		  type: method,
		  data: parameters,
		  crossDomain: true,
		  dataType: "json",
    	  success: successCb,
	      failure: failCb | errorCb,
		  headers: headers,
		  //withCredentials: true
		})
	}
	function requestPUT(resource, values, successCb, failCb){
		
		var headers = {}
		
		if (loadAuthToken()) headers = { "X-Auth-Token": loadAuthToken() }
		
		$.ajax({
		  url: baseUrl + resource,
		  type: 'put',
		  crossDomain: true,
		  data: JSON.stringify(values),
		  dataType: "json",
		  contentType: "application/json",
    	  success: successCb,
	      failure: failCb | errorCb,
		  headers: headers
		})
	}
	function requestDELETE(resource, values, successCb, failCb){
		
		var headers = {}
		
		if (loadAuthToken()) headers = { "X-Auth-Token": loadAuthToken() }
		//console.log(values)
		$.ajax({
		  url: baseUrl + resource,
		  type: 'delete',
		  crossDomain: true,
		  data: JSON.stringify(values),
   		  dataType: "json",
		  contentType: "application/json",
    	  success: successCb,
	      failure: failCb | errorCb,
		  headers: headers
		})
	}
	function loadAuthToken(){
		if (loadSettings() != null) return $.parseJSON(loadSettings()).auth
	}
	function loadSettings() {
		//console.log("localStorage: " + localStorage.getItem("Peoplewings-Auth-Token"))
		//console.log("sessionStorage: " + sessionStorage.getItem("Peoplewings-Auth-Token"))
        return localStorage.getItem("Peoplewings-Auth-Token") || sessionStorage.getItem("Peoplewings-Auth-Token")
    }
	
	return {
		get: function(resource, values, success, error){
			requestGET(resource, 'GET', values, success, error)
		},
		post: function(resource, values, success, error){
			requestPOST(resource, values, success, error)
		},
		put: function(resource, values, success, error){
			requestPUT(resource, values, success, error)
		},
		delete: function(resource, values, success, error){
			requestDELETE(resource, values, success, error)
		},
		saveAuthToken: function(authToken, persist) {
			if (persist) localStorage.setItem("Peoplewings-Auth-Token", authToken)
			else sessionStorage.setItem("Peoplewings-Auth-Token", authToken)
        }, 
        clearAuthToken: function() {
            localStorage.removeItem("Peoplewings-Auth-Token")
			sessionStorage.removeItem("Peoplewings-Auth-Token")
        },
        userIsLoggedIn: function() {
            return loadAuthToken() != null
        },
		getAuthToken: function() {
			if (loadSettings() != null) return $.parseJSON(loadSettings()).auth
			else return "AnonymousUser"
		},
		getServerUrl: function(){
			return baseUrl
		},
		getApiVersion: function(){
			return apiVersion
		},
		getUserId: function(){
			if (loadSettings() != null) return $.parseJSON(loadSettings()).uid
		},
		getProfileId: function(){
			if (loadSettings() != null) return $.parseJSON(loadSettings()).pid
		},
	}
	
}();