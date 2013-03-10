define(function(require) {

	var Backbone = require('backbone');
	var api = require('api2');
	var factory = require('core/factory');

	var UserModel = Backbone.Model.extend({

		urlRoot: api.getApiVersion() + '/accounts/',

		fetch: function(options) {
			var self = this;
			api.get(this.url())
				.then(function(resp){
					self.attributes = resp.data;
					self.trigger("change");
				})
		},

		save: function(attributes, pwd) {
			var self = this;
			return api.put(this.urlRoot + this.id, { resource: attributes, currentPassword: pwd })
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

		destroy: function(data) {
			return api.post(api.getApiVersion() + '/accounts/', data);
		}
	});

	return factory(UserModel);
});
