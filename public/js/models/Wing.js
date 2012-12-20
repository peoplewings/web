define(function(require) {

	var Backbone = require('backbone');
	var api = require('api2');

	var WingModel = Backbone.Model.extend({

		urlRoot: api.getServerUrl() + api.getApiVersion() + '/profiles/' + api.getProfileId() + '/accomodations/',

		parse: function(resp, xhr){
			return resp.data
		}

	});

	return WingModel;
});
