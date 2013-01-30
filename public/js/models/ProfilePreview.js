define(function(require) {

	var Backbone = require('backbone');
	var api = require('api2');
	var factory = require('core/factory');

	var Preview = Backbone.Model.extend({

		idAttribute: "_id",
		
		urlRoot: api.getServerUrl() + api.getApiVersion() + "/profiles/" + api.getUserId(),

		parse: function(resp, xhr){
			return resp.data
		},

	});

    // Returns the Model singleton instance
	return factory(Preview);
});
