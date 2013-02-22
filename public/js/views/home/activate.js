define(function(require) {

	var $ = require('jquery');
	var _ = require('underscore');
	var api = require('api2');
	var Backbone = require('backbone');
	var alerts = require('views/lib/alerts');
	var handlersV = require('views/lib/handlers');
	var responseView = require('views/lib/response');

	var activateView = Backbone.View.extend({
		render: function(token){
			var data = { activationKey: token };

			api.post(api.getApiVersion() + '/activation', data).then(function(response) {
				alerts.success('Account activation complete. You can now login with your credentials');
				router.navigate('#/login');
			});
		},
	});

	return new activateView;
});
