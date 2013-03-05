define(function(require) {

	var Backbone = require('backbone');
	var api = require('api2');
	var factory = require('core/factory');

	var UserProfileModel = Backbone.Model.extend({

		urlRoot: api.getServerUrl() + api.getApiVersion() + '/profiles/',

		parse: function(resp){
			return resp.data;
		},

		save: function(attributes){
			var sc = this;
			var aux = [];
			_.each(attributes, function(value, attr){
				//Marranada... waiting for better solutions
				if (attr === "interestedInF" || attr === "interestedInM"){
					aux.push({ gender: value});
					sc.set('interestedIn', aux);
				}
				else
					sc.set(attr, value);
			});
			//Marranada... waiting for range helper bug
			sc.set("birthYear", "1985");

			return api.put(api.getApiVersion() + '/profiles/' + this.id, this.attributes)
					.prop('status');
		},
	});

	return factory(UserProfileModel);
});
