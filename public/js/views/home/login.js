define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var utils = require('utils');
	var api = require('api2');
	var loginTpl = require('text!templates/home/login.html');
	var alertTpl = require('text!templates/lib/alert.html');
	var UserModel = require('models/Account');
	var Header = require('views/app/header');

	var spinner = new Spinner(utils.getSpinOpts());

	var loginView = Backbone.View.extend({

		el: "#main",

		events: {
			"submit form#login-form": "submitLogin"
		},

		render: function() {

			$(this.el).html(loginTpl);

			this.$inputEmail = this.$("#inputEmail")
			this.$inputPassword = this.$("#inputPassword")
		},

		submitLogin: function(e) {
			e.preventDefault(e);

			spinner.spin(document.getElementById('main'));
			$('.alert').remove()

			if ( this.$inputPassword.val() == "" || this.$inputEmail.val() == "")
				return;

			var self = this
			var formData = utils.serializeForm()

			api.post(api.getApiVersion() + '/auth/', formData)
			.then(function(response){

				if (!response.status){
					self.loginFail(response.msg)
				}
				else
					self.loginSuccess(response.data, formData.remember)
			})
			.fin(function(){
				spinner.stop()
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
				debugger
				var user = new UserModel(data);

				router.header = new Header
				router.header.render();

				router.navigate("#/search");

			})
			.fin(function(){

				self.$inputPassword.val("")
				self.$inputEmail.val("")

			});
		},

		loginFail: function(msg){

			this.$el.prepend(alertTpl({
				extraClass: 'alert-error',
				heading: "",
				message: msg
			}));

			this.$inputPassword.val("");
		}
	});

	return new loginView;
});
