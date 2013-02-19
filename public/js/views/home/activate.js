define(function(require) {

	var $ = require('jquery');
	var _ = require('underscore');
	var Backbone = require('backbone');
	var handlersV = require('views/lib/handlers');
	var responseView = require('views/lib/response');

	var activateView = Backbone.View.extend({
		render: function(token){
			var data = { activationKey: token }
			handlersV.submitForm(undefined, api.getApiVersion() + '/activation', data, responseView, {
				legend: "Account activation complete",
				msg: "You can now log in into PEOPLEWINGS with your credentials"
			});
		},
	});

	return new activateView;
});
