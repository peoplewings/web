define([
	"backbone",
	"api",
], function(Backbone, api) {

	var WingModel = Backbone.Model.extend({
		
		urlRoot: api.getServerUrl() + api.getApiVersion() + '/profiles/' + api.getProfileId() + '/accomodations/',
        // Model Constructor
        initialize: function() {
		
        },
		parse: function(resp, xhr){
			return resp.data
		}
		
	});

	return WingModel;
});