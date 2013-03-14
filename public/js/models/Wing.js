define(function(require) {

	var Backbone = require('backbone');
	var api = require('api2');

	var WingModel = Backbone.Model.extend({

		urlRoot: api.getApiVersion() + '/profiles/' + api.getUserId() + '/accomodations/',

		fetch: function(options){
			var self = this;
			api.get(this.url())
				.then(function(resp){
					self.attributes = resp.data;
					self.trigger("change");
					if (options && options.success)
						options.success();
				});
		},
	});

	return WingModel;
});
