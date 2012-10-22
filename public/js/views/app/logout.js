define([
  "jquery",
  "backbone",
  "api",
  "views/home/header",
  "views/app/header",
  "views/home/main",
], function($, Backbone, api, headerView, appHeaderView, homeView){
	
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
					//Destroy old views
					appHeaderView.destroy()
					//render the home View
					headerView.render();
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