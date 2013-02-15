define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var utils = require('utils');
	var api = require('api2');
	var alerts = require('views/lib/alerts');
	var UserModel = require('models/Account');
	var Header = require('views/app/header');
	var loginTpl = require('text!templates/home/login.html');

	var spinner = new Spinner(utils.getSpinOpts());

	var loginView = Backbone.View.extend({

		el: "#main",

		events: {
			"submit form#login-form": "submitLogin"
		},

		render: function() {
			$(this.el).html(loginTpl);
			this.$('form').validate();
			this.$inputEmail = this.$("#inputEmail")
			this.$inputPassword = this.$("#inputPassword")
		},

		submitLogin: function(e) {
			e.preventDefault(e);

			if (this.$inputPassword.val() == '' || this.$inputEmail.val() == '')
				return;

			spinner.spin(document.getElementById('main'));
			var self = this
			var formData = utils.serializeForm()

			api.post(api.getApiVersion() + '/auth/', formData)
			.prop('data')
			.then(function(data){
				self.loginSuccess(data, formData.remember)
			})
			.fin(function(){
				self.$inputPassword.val('');
				spinner.stop();
			})
		},

		loginSuccess: function(data, remember) {
			var self = this;

			api.saveAuthToken(JSON.stringify({
				auth: data.xAuthToken,
				uid: data.idAccount
			}));

			api.get(api.getApiVersion() + '/accounts/' + api.getUserId(), {})
			.prop("data")
			.then(function(data){
				var user = new UserModel(data);

				router.header = new Header
				router.header.render();

				router.navigate("#/search");
			})
			.fin(function(){
				self.$inputPassword.val("")
				self.$inputEmail.val("")
			});
		}
	});

	return new loginView;
});
