define(function(require) {

	var Backbone = require('backbone');
	var api = require('api');
	var factory = require('core/factory');

	var Wing = Backbone.Model.extend({

		urlRoot: api.getApiVersion() + '/wings/',

		url: function() {
			return this.urlRoot + (this.id ? this.id + '/' : '');
		},

		parse: function(response) {
			return response.success ? response.data : response;
		}
	});

	// Returns the Model singleton instance
	return factory(Wing);
});
