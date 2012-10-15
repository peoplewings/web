define([
  'jquery',
  'backbone',
  'utils',
  'api',
  'views/home/header',
  'views/app/home',
  'text!templates/home/login.html'
], function($, Backbone, utils, api, appHeader, homeLoggedView, loginTpl){

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
		//POST credentials
		api.post('/auth/', data, this.loginSuccess(data.remember))
		//Start loader
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
					//Redirect to home page
					homeLoggedView.render()
					appHeader.destroy()
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