define(function(require) {

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var utils = require("utils");
	var logoutView = require("views/app/logout");
	var settingsTpl = require("tmpl!templates/app/settings.html");
	var alerts = require('views/lib/alerts');
	var UserModel = require("models/Account");

	var settingsView = Backbone.View.extend({

		el: "#main",

		events: {
			"submit form#settings-form": "submitSettings",
			"click a[href='#myModal']": function() {
				$('#myModal').modal({
					show: false
				})
			},
			"click button#delete-account-btn": "deleteAccount",
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

		initialize: function(options) {
			this.model = new UserModel({
				id: api.getUserId()
			})
			this.model.on("change", this.render.bind(this));

		},

		render: function() {
			$(this.el).html(settingsTpl(this.model.toJSON()));

			this.$('#settings-form').validate(this.validation)

			this.$('#delete-account-form').validate()
		},

		submitSettings: function(e) {
			e.preventDefault();
			this.$("#save-settings-btn").button('loading');
			var data = utils.serializeForm('settings-form');
			var values = {};

			_.each(data, function(value, key) {
				if (key != "repeatPassword" && key != "repeatEmail" && key != "current_password")
					values[key] = value;
			});

			this.model.save(values, data.current_password)
				.then(function(status) {
					alerts.success('Account updated');
				}, function() {
					alerts.defaultError();
				})
				.fin(function() {
					$('#settings-form')[0].reset();
					self.$("#save-settings-btn").button('reset');
				});
		},

		deleteAccount: function() {
			if (!$('#delete-account-form').valid())
				return;
			
			this.$("#delete-account-btn").button('loading');
			
			var data = utils.serializeForm('delete-account-form')
			this.model.destroy(data)
			.then(function(status){
				logoutView.goodbye();
			})
		}
	});

	return settingsView;

});
