define([
  "jquery",
  "backbone",
  "api",
  "views/app/header",
  "views/home/main",
  "models/User",
  "models/Profile",
], function($, Backbone, api, appHeaderView, homeView, UserModel, ProfileModel){
	
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
		var profile = new ProfileModel({id: api.getProfileId()})
		var user = new UserModel({id: api.getProfileId()})		
		//Remove memory models!!
		user.clear()
		profile.clear()
		//if server says OK we clear the authToken from session or local storage
		api.clearAuthToken()
		//Destroy old views??
		//appHeaderView.destroy()
		//$("#feedback-btn").hide()
		window.router.navigate("/#/")
		location.reload()
	}
  });

  return new logoutView;
});