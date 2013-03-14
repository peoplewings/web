define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var utils = require('utils');
	var api = require('api2');
	var UserModel = require('models/Account');
	var Header = require('views/app/header');
	var loginTpl = require('text!templates/home/login.html');

	var spinner = new Spinner(utils.getSpinOpts());

	var LoginView = Backbone.View.extend({

		el: "#main",

		events: {
			"submit form#login-form": "submitLogin"
		},

		render: function() {
			$(this.el).html(loginTpl);
			this.$('form').validate();
			this.$inputEmail = this.$("#inputEmail");
			this.$inputPassword = this.$("#inputPassword");
		},

		submitLogin: function(e) {
			e.preventDefault(e);

			if (this.$inputPassword.val() === '' || this.$inputEmail.val() === '')
				return;

			spinner.spin(document.getElementById('main'));
			var self = this;
			var formData = utils.serializeForm();

			api.post(api.getApiVersion() + '/auth/', formData)
				.prop('data')
				.then(function(data){
					self.loginSuccess(data, formData.remember);
				})
				.fin(function(){
					self.$inputPassword.val('');
					spinner.stop();
				});
		},

		loginSuccess: function(data, remember) {
			api.saveAuthToken(JSON.stringify({
				auth: data.xAuthToken,
				uid: data.idAccount
			}));

			this.$inputPassword.val("");
			this.$inputEmail.val("");
			
			router.header = new Header;
			router.navigate("#/search");

		}
	});

	return new LoginView;
});
