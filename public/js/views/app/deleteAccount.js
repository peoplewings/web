define(function(require) {

	var Backbone = require('backbone');
	var api = require('api2');
	var utils = require('utils');
	var alerts = require('views/lib/alerts');
	var logoutView = require("views/app/logout");
	var deleteTpl = require('tmpl!templates/app/delete-account.html');
	var AccountModel = require("models/Account");

	var DeleteAccount = Backbone.View.extend({

		el: '#main',

		events: {
			"submit form#delete-account-form" : "deleteAccount"
		},

		initialize: function() {
			this.model = new AccountModel({
				id: api.getUserId()
			});
		},

		render: function() {
			$(this.el).html(deleteTpl);
			this.$('#delete-account-form').validate();
		},

		deleteAccount: function(evt){
			evt.preventDefault();
			if (!this.$('#' + evt.target.id).valid())
				return;

			this.$("#delete-account-btn").button('loading');

			var data = utils.serializeForm(evt.target.id);
			var self = this;
			this.model.destroy(data)
			.then(function() {
				alerts.success('Account deleted, you will be redirected to home.');
				setTimeout(logoutView.goodbye, 500);
			}, function() {
				alerts.defaultError();
			})
			.fin(function(){
				self.$("#delete-account-btn").button('reset');
				self.$('#' + evt.target.id)[0].reset();
			});

		},
	});

	return new DeleteAccount;
});
