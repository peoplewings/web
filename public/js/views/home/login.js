define([
  'jquery',
  'backbone',
  'utils',
  'api',
  'views/home/header',
  'views/app/header',
  'views/app/home',
  'text!templates/home/login.html',
  'models/User',
], function($, Backbone, utils, api, appHeader, appLoggedHeader, homeLoggedView, loginTpl, UserModel){

  var spinner = new Spinner(utils.getSpinOpts());

  var loginView = Backbone.View.extend({
    el: "#main",
	events:{
		"submit form#login-form": "submitLogin"
	},
    render: function(){
      $(this.el).html(loginTpl);
    },
	submitLogin: function(e){
		e.preventDefault(e);
		var data = utils.serializeForm()
		api.post('/auth/', data, this.loginSuccess(data.remember))
		spinner.spin(document.getElementById('main'));
		$('#' + e.target.id).remove()
	},
	loginSuccess: function(loggedIn){
		return function(response){
			spinner.stop()
			if (response.status===true) {
				if (response.code === 200) {
					if ( loggedIn === "on" ) api.saveAuthToken(response.data.xAuthToken, true)
					else api.saveAuthToken(response.data.xAuthToken, false)
					//Get User Account details
					api.get('/accounts/me', {}, function(response){
						if (response.status === true){
							response.data.id = "me"
							var user = new UserModel(response.data)
							appHeader.destroy()
							homeLoggedView.render()
							appLoggedHeader.render()
						}
					})
				}
			}else {
					for ( error in response.error){
						console.error("Server said: " + error + " : " + response.error[error])
					}
			}
		}	
	}
  });
  return new loginView;
});