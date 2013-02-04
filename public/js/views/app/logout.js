define([
  "jquery",
  "backbone",
  "api",
  "views/app/header",
  "views/home/main",
  "models/Account",
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
		api.clearAuthToken()

		var profile = new ProfileModel({id: api.getUserId()})
		var user = new UserModel({id: api.getUserId()})		
		user.clear()
		profile.clear()
		
		window.router.navigate("/#/")
		location.reload()
	}
  });

  return new logoutView;
});