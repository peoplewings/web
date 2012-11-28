define([
  "jquery",
  "backbone",
  "api",
  "views/home/header",
  "views/app/header",
  "views/home/main",
  "views/app/feedback",
], function($, Backbone, api, headerView, appHeaderView, homeView, feedView){
	
  var logoutView = Backbone.View.extend({
	logout: function(){
		api.post(api.getApiVersion() + '/noauth/', {}, this.logoutSuccess(this))
	},
	logoutSuccess: function(scope){
		return function(response){
			if (response.status===true) {
				if (response.code === 200) {
					console.log('Trying to destroy...')
					scope.goodbye()
				}
			}else {
					for ( error in response.error){
						console.error("Server said: " + error + " : " + response.error[error])
					}		
			}
		}
	},
	goodbye: function(){
		//if server says OK we clear the authToken from session or local storage
		api.clearAuthToken()
		//Destroy old views
		appHeaderView.destroy()
		feedView.close()
		//render the home View
		headerView.render();
		homeView.render();	
	}
  });

  return new logoutView;
});