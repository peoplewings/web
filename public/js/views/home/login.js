define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var utils = require('utils');
	var api = require('api2');
	var facebook = require('tools/facebook');
	var Header = require('views/app/header');
	var loginTpl = require('text!templates/home/forms/login.html');

	var spinner = require('views/lib/spinner');

	function loginCompleted(data) {
		api.saveAuthToken(JSON.stringify({
			auth: data.xAuthToken,
			uid: data.idAccount
		}));

		router.header = new Header;
		router.navigate("#/search");
	}


	var LoginView = Backbone.View.extend({

		el: "#main",

		events: {
			"submit form#login-form": "submitLogin",
			"click .fb-login": "facebookLogin",
		},

		render: function() {
			$(this.el).html(loginTpl);
			this.$('form').validate();
			this.$inputEmail = this.$("#inputEmail");
			this.$inputPassword = this.$("#inputPassword");

			$("#feedback-btn").hide();
		},

		facebookLogin: function() {
			facebook.connect(loginCompleted);
		},

		submitLogin: function(e) {
			e.preventDefault(e);

			if (this.$inputPassword.val() === '' || this.$inputEmail.val() === '')
				return;

			spinner.show('login');
			var self = this;
			var formData = utils.serializeForm();

			api.post(api.getApiVersion() + '/auth/', formData)
				.prop('data')
				.then(function(data){
					self.loginSuccess(data, formData.remember);
				})
				.fin(function(){
					self.$inputPassword.val('');
					spinner.hide('login');
				});
		},

		loginSuccess: function(data) {
			this.$inputPassword.val("");
			this.$inputEmail.val("");
			loginCompleted(data);
		}
	});

	return new LoginView;
});
