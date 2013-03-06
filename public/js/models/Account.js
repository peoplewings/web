define(function(require) {

	var Backbone = require('backbone');
	var api = require('api2');
	var factory = require('core/factory');

	var UserModel = Backbone.Model.extend({

		urlRoot: api.getServerUrl() + api.getApiVersion() + '/accounts/',

		save: function(attributes, pwd) {
			var self = this;
			return api.put(api.getApiVersion() + '/accounts/' + this.id, { resource: attributes, currentPassword: pwd })
				.prop('status')
				.then(function(status){
					if (status) {
						_.each(attributes, function(value, name) {
							self.set(name, value);
						});
					}
					return status;
				});
		},

		parse: function(resp) {
			return resp.data;
		},

		destroy: function(data) {
			return api.post(api.getApiVersion() + '/accounts/', data);
		}
	});

	return factory(UserModel);
});
