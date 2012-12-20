define(function(require) {

	var Backbone = require('backbone');
	var api = require('api2');
	var factory = require('core/factory');

	var UserModel = Backbone.Model.extend({

		urlRoot: api.getServerUrl() + api.getApiVersion() + '/accounts/',

		// To set the JSON root of the model
		parse: function(resp, xhr){
			return resp.data
		},
	});

    // Returns the Model singleton instance
	return factory(UserModel);
});
