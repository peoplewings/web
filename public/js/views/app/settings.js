//jshint camelcase:false

define(function(require) {

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var utils = require("utils");
	var settingsTpl = require("tmpl!templates/app/account/settings.html");
	var alerts = require('views/lib/alerts');
	var AccountModel = require("models/Account");

	var settingsView = Backbone.View.extend({

		el: "#main",

		events: {
			"submit form#settings-form": "submitSettings",
		},

		validation: {
			rules: {
				password: {
					minlength: 8,
					validpassword: true
				},
				repeatPassword: {
					minlength: 8,
					equalTo: '#pass'
				},
				createPassword: {
					minlength: 8,
					validpassword: true
				},
				repeatCreatePassword: {
					minlength: 8,
					equalTo: '#create-pass'
				},
				email: {
					email: true
				},
				repeatEmail: {
					email: true,
					equalTo: '#inputEmail'
				},
			},
			errorPlacement: function(error, element) {
				error.appendTo(element.nextAll("span.help-block"));
			},
		},

		initialize: function() {
			this.model = new AccountModel({
				id: api.getUserId()
			});
			this.model.on("change", this.render.bind(this));
		},

		render: function() {
			$(this.el).html(settingsTpl(this.model.toJSON()));
			this.$('#settings-form').validate(this.validation);	
			this.displayPasswordForm();	
		},

		displayPasswordForm: function() {
			if (this.model.attributes.hasPass === false){
				this.$('[data-has-pass]').hide();
				this.$('[data-has-no-pass]').show();
			} else {
				this.$('[data-has-pass]').show();
				this.$('[data-has-no-pass]').hide();
			}
		},

		submitSettings: function(e) {
			e.preventDefault();
			this.$("#save-settings-btn").button('loading');
			var data = utils.serializeForm('settings-form');
			var values = _.omit(data, 'repeatPassword', 'repeatEmail', 'current_password', 'repeatCreatePassword')			
			var self = this;

			values.hasPass = true;
			this.model.save(values, data.current_password)
			.then(function() {
				alerts.success('Account updated');
				self.displayPasswordForm();
			}, function(errors) {
				var l = errors.length;
				for (var i = 0; i < l; i++){
					if (errors[i].type === 'INCORRECT_PASSWORD')
						self.$('#inputPassword').val();
					else
						alerts.defaultError();
				}
			})
			.fin(function() {
				self.$('#settings-form')[0].reset();
				self.$("#save-settings-btn").button('reset');
			});
		},
	});

return settingsView;

});
