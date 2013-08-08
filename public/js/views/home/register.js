//jshint camelcase:false

define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var api = require('api');
	var utils = require('utils');
	var texts = require('tools/texts');
	var spinner = require('views/lib/spinner');
	var facebook = require('tools/facebook');
	var Header = require('views/app/header');

	var responseView = require('views/lib/balloon.response');

	var registerTpl = require('tmpl!templates/home/forms/register.html');
	var confirmTpl = require('tmpl!templates/lib/responses/register.check-email.html');
	var underageTpl = require('tmpl!templates/lib/responses/register.underage.html');

	var RegisterView = Backbone.View.extend({

		el: '#main',

		events: {
			'submit form#register-form': 'submitRegister',
			'click .fb-register': 'facebookConnect',
		},

		validation: {
			rules: {
				password: {
					minlength: 8,
					validpassword: true
				},
				confirm_password: {
					minlength: 8,
					equalTo: '#pass',
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
					max: 'You need to be +18 years old to register'
				},
				hasAcceptedTerms: 'Please accept our terms'
			},
			errorPlacement: function(error, element) {
				error.appendTo(element.nextAll('span.help-block'));
			},
		},

		facebookConnect: function() {
			facebook.connect();
		},

		render: function() {
			$(this.el).html(registerTpl({
				month: texts.months,
			}));

			this.$('#register-form').validate(this.validation);
			$('#feedback-btn').hide();
		},

		submitRegister: function(e) {
			e.preventDefault(e);

			var self = this;
			var data = utils.serializeForm(e.target.id);

			data.birthdayYear = +data.birthdayYear;
			data.birthdayMonth = +data.birthdayMonth;
			data.birthdayDay = +data.birthdayDay;

			spinner.show('register');

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
