var API = function(){
	
	var baseUrl = 'http://peoplewings-backend.herokuapp.com/api/v1'
	
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
		  contentType: "application/json",
    	  success: successCb,
	      failure: failCb | errorCb,
		  headers: headers
		})
	}
	function requestGET(resource, method, parameters, successCb, failCb){
		
		var headers = {}
		
		if (loadAuthToken()) headers = { "X-Auth-Token": loadAuthToken() }
		
		$.ajax({
		  url: baseUrl + resource,
		  type: method,
		  crossDomain: true,
		  dataType: "json",
    	  success: successCb,
	      failure: failCb | errorCb,
		  headers: headers
		})
	}
	
	function loadAuthToken() {
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
        }
	}
	
}();