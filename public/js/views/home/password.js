define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var utils = require('utils');
	var api = require('api2');
	var handlersV = require('views/lib/handlers');
	var responseView = require('views/lib/response');
	var mailTpl = require('text!templates/lib/mailform.html');
	var passTpl = require('text!templates/lib/passform.html');

	var PasswordView = Backbone.View.extend({
		el: "#main",

		events:{
			"submit form#forgot-form": "submitForgot",
			"submit form#password-form": "submitNewPwd"
		},

		render: function(token){
			var tpl = token ? _.template(passTpl, {token: token}) : _.template(mailTpl);
			$(this.el).html( tpl );

			if (!token) {
				$('#forgot-form').validate();
			} else {
				$('#password-form').validate({
					rules: {
						newPassword: {
							minlength: 8,
							validpassword: true,
						},
						newPassword2: {
							minlength: 8,
							equalTo: "#inputPassword"
						}
					}
				});
			}
		},
		submitForgot: function(e){
			e.preventDefault(e);
			var data = utils.serializeForm(e.target.id);

			handlersV.submitForm(e.target.id, api.getApiVersion() + '/forgot', data, responseView, {
				legend: "Check your inbox for the reset link",
				msg: "We've sent you an e-mail that will allow you to reset your password quickly and easily",
			});
		},
		submitNewPwd: function(e){
			e.preventDefault(e);
			var data = utils.serializeForm(e.target.id);

			handlersV.submitForm(e.target.id, api.getApiVersion() + '/forgot', {forgotToken: data.forgotToken, newPassword: data.newPassword}, responseView, {
				legend: "Password changed",
				msg: "You can now log in with your new password",
			});
		}
	});

	return new PasswordView;
});
