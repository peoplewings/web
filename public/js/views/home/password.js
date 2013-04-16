define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var utils = require('utils');
	var api = require('api2');

	var responseView = require('views/lib/balloon.response');
	var confirmTpl = require('tmpl!templates/lib/responses/password.check-email.html');

	var pwdTpl = require('tmpl!templates/lib/responses/password.changed.html');
	var mailTpl = require('tmpl!templates/home/forms/forgot-password.html');
	var passTpl = require('tmpl!templates/home/forms/change-password.html');

	var spinner = require('views/lib/spinner');


	var PasswordView = Backbone.View.extend({
		el: "#main",

		events:{
			"submit form#forgot-form": "submitForgot",
			"submit form#password-form": "submitNewPwd"
		},

		validation: {
			rules: {
				newPassword: {
					minlength: 8,
					validpassword: true,
				},
				newPassword2: {
					minlength: 8,
					equalTo: "#inputPassword"
				}
			},
		},

		errorPlacement: function(error, element){
			error.appendTo(element.nextAll("span.help-block"));
		},

		initialize: function(){
		},

		render: function(token){
			var tpl = token ? passTpl({token: token}) : mailTpl;
			$(this.el).html(tpl);

			if (!token){
				$('#forgot-form').validate({
					errorPlacement: this.errorPlacement
				});
			}
			else {
				$('#password-form')
				.validate(_.extend(this.validation, this.errorPlacement));
			}
		},

		submitForgot: function(e){
			e.preventDefault(e);
			spinner.show('password');
			$(e.target).find('button[type=submit]').button('loading');
			var data = utils.serializeForm(e.target.id);

			var self = this;
			api.post(api.getApiVersion() + '/forgot', data)
			.then(function(){
				$(e.target).find('button[type=submit]').button('reset');
				spinner.hide('password');
				self.$('#forgot-form').remove();
				responseView.render({
					content: confirmTpl({
						email: data.email
					})
				});
			});
		},

		submitNewPwd: function(e){
			e.preventDefault(e);
			spinner.show('password');
			$(e.target).find('button[type=submit]').button('loading');
			var data = utils.serializeForm(e.target.id);

			var self = this;
			api.post(api.getApiVersion() + '/forgot', {forgotToken: data.forgotToken, newPassword: data.newPassword})
			.then(function(){
				$(e.target).find('button[type=submit]').button('reset');
				spinner.hide('password');
				self.$('#password-form').remove();
				responseView.render({
					content: pwdTpl
				});
			});
		}
	});

return new PasswordView;
});
