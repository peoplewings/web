//jshint camelcase:false

define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var api = require('api2');
	var utils = require('utils');
	var phrases = require("phrases");

	var responseView = require('views/lib/response');

	var registerTpl = require('tmpl!templates/home/register.html');
	var termsTpl = require('tmpl!templates/home/terms.html');
	var alertTpl = require('tmpl!templates/lib/alert.html');

	var RegisterView = Backbone.View.extend({

		el: "#main",

		events: {
			"submit form#register-form": "submitRegister",
			"click a#terms-link": function(e){
				e.preventDefault();
				utils.showModal("Terms and conditions", null, termsTpl);
			},
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
				birthdayYear: {
					max: (new Date()).getFullYear() - 18,
				},
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

		render: function() {

			$(this.el).html(registerTpl({
				month: phrases.months,
			}));

			this.$('#register-form').validate(this.validation);

		},

		submitRegister: function(e) {
			e.preventDefault(e);

			var self = this;
			var spinner = new Spinner(utils.getSpinOpts());
			var data = utils.serializeForm(e.target.id);

			if (data.hasAcceptedTerms === "on")
				data.hasAcceptedTerms = true;
			else {
				console.error("Hmm...");
				return;
			}

			data.birthdayYear = +data.birthdayYear;
			data.birthdayMonth = +data.birthdayMonth;
			data.birthdayDay = +data.birthdayDay;

			spinner.spin(document.getElementById('main'));

			api.post(api.getApiVersion() + '/newuser', data)
			.then(function(response){
				spinner.stop();
				if(response.status === true) {

					self.$('#register-form').remove();
					responseView.extraData = "Code: " + response.code + " - " + response.msg;
					responseView.render({
						legend: "Confirm your e-mail address",
						msg: "A confirmation email has been sent to ",
						extraInfo: data.email
					});

					$(self.el).html(responseView.el);

				} else {
					$(self.el).prepend(alertTpl( {
						extraClass: 'alert-error',
						heading: "Code: " + response.code + ". Error: ",
						message: JSON.stringify(response.errors) || response.error,
					}));
				}
			});
		},

	});

	return new RegisterView;
});
