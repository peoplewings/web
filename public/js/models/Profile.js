define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var api = require('api2');
	var factory = require('core/factory');

	var UserProfileModel = Backbone.Model.extend({

		urlRoot: api.getServerUrl() + api.getApiVersion() + '/profiles/',

		/*
		fetch: function() {
			 api.get(api.getApiVersion() + '/profiles/' + this.id, {}, this.parse)
		},
		*/
		
		parse: function(resp, xhr){
			return resp.data
		},
		
		save: function(attributes){
			var sc = this
			return api.put(api.getApiVersion() + '/profiles/' + this.id, this.attributes)
					.prop('status')
					.then(function(status){
						if (status === true){
							for (attr in sc.attributes) 
								sc.unset(attr);
							}
							return status;
						})
		},
	});

    // Returns the Model singleton instance
	return factory(UserProfileModel);
});
