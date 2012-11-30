define([
  "jquery",
  "backbone",
  "api",
  "views/home/header",
  "views/app/header",
  "views/home/main",
  "models/User",
  "models/Profile",
], function($, Backbone, api, headerView, appHeaderView, homeView, UserModel, ProfileModel){
	
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
		var profile = new ProfileModel({id: api.getProfileId()})
		var user = new UserModel({id: api.getProfileId()})		
		user.clear()
		profile.clear()
		
		api.clearAuthToken()
		//Destroy old views
		appHeaderView.destroy()
		$("#feedback-btn").hide()
		//Remove memory models
		
		//render the home View
		headerView.render();
		homeView.render();
		location.hash = "/" 
	}
  });

  return new logoutView;
});