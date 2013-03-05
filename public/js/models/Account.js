define(function(require) {

	var Backbone = require('backbone');
	var api = require('api2');
	var factory = require('core/factory');

	var UserModel = Backbone.Model.extend({

		urlRoot: api.getServerUrl() + api.getApiVersion() + '/accounts/',
		
		/*
		fetch: function(options) {
            api.get(api.getApiVersion() + '/accounts/' + this.id, {}, this.parse)
        },
		*/

		save: function(attributes, pwd) {
			var sc = this
			return api.put(api.getApiVersion() + '/accounts/' + this.id, { resource: attributes, currentPassword: pwd })
				.prop('status')
				.then(function(status){
					if (status === true){
						for (attr in attributes) 
							sc.set(attr, attributes[attr]);
					}
					return status;
				})
		},

		parse: function(resp, xhr) {
			return resp.data
		},
		
		destroy: function(data) {
			var sc = this
			return api.post(api.getApiVersion() + '/accounts/', data)
					.prop('status')
					.then(function(status){
						if (status === true){
							for (attr in sc.attributes) 
								sc.unset(attr);
							}
							return status;
						})
		}
	});

	return factory(UserModel);
});
