define(function(require) {

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var utils = require("utils");
	var logoutView = require("views/app/logout");
	var settingsTpl = require("tmpl!templates/app/settings.html")
	var alertTpl = require("tmpl!templates/lib/alert.html")
	var UserModel = require("models/Account")

	var settingsView = Backbone.View.extend({

		el: "#main",

		events: {
			"submit form#settings-form": "submitSettings",
			"click a[href='#myModal']": function() {
				$('.alert').remove()
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

			$('#settings-form').validate(this.validation)

			$('#delete-account-form').validate()
		},

		submitSettings: function(e) {
			e.preventDefault(e);
			var data = utils.serializeForm('settings-form')
			var values = {}

			_.each(data, function(value, key) {
				if (key != "repeatPassword" && key != "repeatEmail" && key != "current_password")
				values[key] = value
			});

			this.model.save(values, data.current_password)
				.then(function(status) {
					if (status === true) {
						tpl = alertTpl({
							extraClass: 'alert-success',
							heading: "Account updated"
						})
					} else {
						tpl = alertTpl({
							extraClass: 'alert-error',
							heading: "Account couldn't be updated" + ": ",
							message: 'Please try again later'
						})
					}
				}, function() {

				})
				.fin(function() {
					$('#settings-form')[0].reset()
				})
		},

		deleteAccount: function() {
			if (!$('#delete-account-form').valid())
				return;

			var data = utils.serializeForm('delete-account-form')

			this.model.destroy(data)
				.then(function(status) {
					if (status === true) {
						$('#myModal').modal('hide')
						logoutView.goodbye()
					} else {
						$('.alert').remove()
						var tpl = alertTpl({
							extraClass: 'alert-error',
							heading: "Couldn't delete your account" + ": ",
							message: 'Please retype your password'
						})
						$('#myModal > .modal-body').prepend(tpl)
						$('#delete-account-form')[0].reset()
					}
				});
		}
	});

	return settingsView;

});
