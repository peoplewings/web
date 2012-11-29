define([
  'jquery',
  'backbone',
  'utils',
  'api',
  'views/home/header',
  'text!templates/home/login.html',
  'text!templates/lib/alert.html',
  'models/User',
], function($, Backbone, utils, api, homeHeader, loginTpl, alertTpl, UserModel){

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
		$('.alert').remove()
		var data = utils.serializeForm()
		api.post(api.getApiVersion() + '/auth/', data, this.loginSuccess(data.remember, this))
		spinner.spin(document.getElementById('main'));
		$('#' + e.target.id).remove()
	},
	loginSuccess: function(loggedIn, scope){
		console.log('loginSuccess')
		return function(response){
			spinner.stop()
			if (response.status === true) {
				if (response.code === 200) {
					if ( loggedIn === "on" ) api.saveAuthToken(response.data.xAuthToken, true)
					else api.saveAuthToken(JSON.stringify({ auth: response.data.xAuthToken, uid: response.data.idAccount, pid: response.data.idProfile}), false)
					//Get User Account details
					api.get(api.getApiVersion() + '/accounts/' + api.getUserId(), {}, function(response){
						if (response.status === true){
							response.data.id = api.getUserId()
							var user = new UserModel(response.data)
							homeHeader.destroy()
							require(['views/app/header', 'views/app/home'], function(appLoggedHeader, homeLoggedView){
								console.log("IIIII")
								homeLoggedView.render()
								appLoggedHeader.render()
							})
						}
					})
				}
			}else {
				scope.render()
				var tpl = _.template(alertTpl, {extraClass: 'alert-error', heading: "Error: ", message: response.msg})
				$('#main').prepend(tpl)
			}
		}	
	}
  });
  return new loginView;
});