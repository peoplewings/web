define(function(require) {

	var Backbone = require('backbone');
	var api = require('api2');
	var factory = require('core/factory');

	var Preview = Backbone.Model.extend({

		urlRoot: api.getServerUrl() + api.getApiVersion() + "/profiles/",

		url: function(){
			return  (api.getUserId() === this.id) ? this.urlRoot + this.id : this.urlRoot + this.id + "/preview";
		},

		parse: function(resp){
			return resp.data;
		},

		save: function(data){
			var self = this;

			_.each(data, function(value, attr){
				self.set(attr, value);

				if (attr === "interestedIn")
					self.set(attr, [{gender: value}]);
			});
			console.log("SAVE: ", this.attributes.interestedIn)
			return api.put(api.getApiVersion() + '/profiles/' + this.id, this.attributes);
		}

	});

    // Returns the Model singleton instance
	return factory(Preview);
});
