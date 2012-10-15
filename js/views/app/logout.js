define([
  "jquery",
  "backbone",
  "api",
  "views/home/header",
  "views/home/main",
], function($, Backbone, api, headerView, homeView){
	
  var logoutView = Backbone.View.extend({
	logout: function(){
		api.post('/noauth/', {}, this.logoutSuccess("foo"))
	},
	logoutSuccess: function(foo){
		return function(response){
			if (response.status===true) {
				if (response.code === 200) {
					//if server says OK we clear the authToken from session or local storage
					api.clearAuthToken()
					//render the home View
					headerView.render();
					$('header').html(headerView.el)
					homeView.render();
					
				}
			}else {
					for ( error in response.error){
						console.error("Server said: " + error + " : " + response.error[error])
					}		
			}
		}
	}
  });

  return new logoutView;
});