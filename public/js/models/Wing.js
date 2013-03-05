define(function(require) {

	var Backbone = require('backbone');
	var api = require('api2');

	var WingModel = Backbone.Model.extend({

		urlRoot: api.getServerUrl() + api.getApiVersion() + '/profiles/' + api.getUserId() + '/accomodations/',

		parse: function(resp){
			return resp.data;
		}
	});

	return WingModel;
});
