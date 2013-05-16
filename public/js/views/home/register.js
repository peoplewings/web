//jshint camelcase:false

define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var api = require('api2');
	var utils = require('utils');
	var phrases = require("phrases");
	var spinner = require('views/lib/spinner');

	var responseView = require('views/lib/balloon.response');

	var registerTpl = require('tmpl!templates/home/forms/register.html');
	var confirmTpl = require('tmpl!templates/lib/responses/register.check-email.html');
	var underageTpl = require('tmpl!templates/lib/responses/register.underage.html');

	var RegisterView = Backbone.View.extend({

		el: "#main",

		events: {
			"submit form#register-form": "submitRegister",
			"click .fb-login": "facebookConnect",
		},

		validation: {
			rules: {
				password: {
					minlength: 8,
					validpassword: true
				},
				confirm_password: {
					minlength: 8,
					equalTo: "#pass",
				},
				/*birthdayYear: {
					max: (new Date()).getFullYear() - 18,
				},*/
				email: {
					email: true
				},
				repeatEmail: {
					email: true,
					equalTo: '#email'
				},
				terms: {
					required: true,
				}
			},
			messages: {
				birthdayYear: {
					max: "You need to be +18 years old to register"
				},
				hasAcceptedTerms: "Please accept our terms"
			},
			errorPlacement: function(error, element) {
				error.appendTo(element.nextAll("span.help-block"));
			},
		},

		facebookConnect: function() {
			FB.login(function(response) {
				if (!response.authResponse) return;

				FB.api('/me', function(response) {
					var birth = response.birthday.split('/').map(function(a) { return parseInt(a, 10) });

					var registerData = {
						fbid: response.id,
						firstName: response.first_name,
						lastName: response.last_name,
						email: response.email,
						gender: response.gender[0].toUpperCase() + response.gender.substr(1),
						birthdayDay: birth[0],
						birthdayMonth: birth[1],
						birthdayYear: birth[2],
					};

					api.post(api.getApiVersion() + '/connectfb/', registerData).then(function(data) {
						if (!data.status) throw new Error('cosa'); //register(response);

						api.saveAuthToken(JSON.stringify({
							auth: data.xAuthToken,
							uid: data.idAccount
						}));

						router.header = new Header;
						router.navigate("#/search");
					});
				});
			}, { scope: 'email,user_about_me,user_birthday,user_hometown,user_location'});
		},


		render: function() {

			$(this.el).html(registerTpl({
				month: phrases.months,
			}));

			this.$('#register-form').validate(this.validation);

			$("#feedback-btn").hide();

		},

		submitRegister: function(e) {
			e.preventDefault(e);

			var self = this;
			var data = utils.serializeForm(e.target.id);

			data.birthdayYear = +data.birthdayYear;
			data.birthdayMonth = +data.birthdayMonth;
			data.birthdayDay = +data.birthdayDay;

			spinner.show('register');

			console.log(data);
			return;

			api.post(api.getApiVersion() + '/newuser', data)
			.then(function(response){
				spinner.hide('register');
				self.$('#register-form').remove();
				if(response.status === true) {
					responseView.render({
						content: confirmTpl({email: response.data.email})
					});
				} else {
					responseView.render({
						content: underageTpl
					});
				}
			});
		},

	});

	return new RegisterView;
});
