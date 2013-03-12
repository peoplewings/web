define(function(require) {

	var Backbone = require('backbone');
	var api = require('api2');
	var factory = require('core/factory');

	var Preview = Backbone.Model.extend({

		urlRoot: api.getApiVersion() + "/profiles/",

		url: function(){
			return (api.getUserId() === this.id) ? this.urlRoot + this.id : this.urlRoot + this.id + "/preview";
		},

		fetch: function(options) {
			var self = this;
			api.get(this.url())
				.then(function(resp){
					self.attributes = resp.data;
					if (options && options.success)
						options.success();
				});
		},

		save: function(data){
			var self = this;

			_.each(data, function(value, attr){
				self.set(attr, value);

				if (attr === "interestedIn")
					self.set(attr, [{gender: value}]);
			});

			return api.put(this.urlRoot + this.id, this.attributes);
		}

	});

	// Returns the Model singleton instance
	return factory(Preview);
});
