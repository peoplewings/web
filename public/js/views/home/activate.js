define(function(require) {

	var api = require('api');
	var Backbone = require('backbone');
	var alerts = require('views/lib/alerts');

	var ActivateView = Backbone.View.extend({
		render: function(token){
			var data = { activationKey: token };

			api.post(api.getApiVersion() + '/activation', data).then(function() {
				alerts.success('Account activation complete. You can now login with your credentials');
				router.navigate('#/login');
			});

			$('#feedback-btn').hide();
		},
	});

	return new ActivateView;
});
