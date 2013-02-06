define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var utils = require('utils');
	var api = require('api');
	var loginTpl = require('text!templates/home/login.html');
	var alertTpl = require('text!templates/lib/alert.html');
	var UserModel = require('models/Account');
	var appLoggedHeader = require('views/app/header');
	var homeLoggedView = require('views/app/home');

	var spinner = new Spinner(utils.getSpinOpts());

	var loginView = Backbone.View.extend({
		el: "#main",
		events: {
			"submit form#login-form": "submitLogin"
		},
		render: function() {
			$(this.el).html(loginTpl);
		},
		submitLogin: function(e) {
			e.preventDefault(e);
			$('.alert').remove()
			var data = utils.serializeForm()
			api.post(api.getApiVersion() + '/auth/', data, this.loginSuccess(data.remember, this))
			spinner.spin(document.getElementById('main'));
			$('#' + e.target.id).remove()
		},
		loginSuccess: function(loggedIn, scope) {
			console.log('loginSuccess')
			return function(response) {
				spinner.stop()
				if(response.status === true) {
					if(response.code === 200) {
						if(loggedIn === "on") api.saveAuthToken(response.data.xAuthToken, true)
						else api.saveAuthToken(JSON.stringify({
							auth: response.data.xAuthToken,
							uid: response.data.idAccount
						}), false)
						//Get User Account details
						api.get(api.getApiVersion() + '/accounts/' + api.getUserId(), {}, function(response) {
							if(response.status === true) {
								response.data.id = api.getUserId()
								var user = new UserModel(response.data)
								homeLoggedView.render()
								appLoggedHeader.render()
							}
						})
					}
				} else {
					scope.render()
					var tpl = _.template(alertTpl, {
						extraClass: 'alert-error',
						heading: "Error: ",
						message: response.msg
					})
					$('#main').prepend(tpl)
				}
			}
		}
	});
	return new loginView;
});
