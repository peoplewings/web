define(function(require) {

	var Backbone = require('backbone');
	var api = require('api2');
	var factory = require('core/factory');

	var relationChoices = {
		SI: "Single",
		EN: "Engaged",
		MA: "Married",
		WI: "Widowed",
		IR: "In a relationship",
		IO: "In an open relationship",
		IC: "It's complicated",
		DI: "Divorced",
		SE: "Separated"
	};

	var Preview = Backbone.Model.extend({

		idAttribute: "_id",
		
		urlRoot: api.getServerUrl() + api.getApiVersion() + "/profiles/" + api.getProfileId(),

		parse: function(resp, xhr){
			if (resp.data){
				if (resp.data.civilState) resp.data.civilState = relationChoices[resp.data.civilState]
			}
			return resp.data
		},

	});

    // Returns the Model singleton instance
	return factory(Preview);
});
