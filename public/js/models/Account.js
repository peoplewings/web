define(function(require) {

	var Backbone = require('backbone');
	var api = require('api2');
	var factory = require('core/factory');

	var UserModel = Backbone.Model.extend({

		//urlRoot: api.getServerUrl() + api.getApiVersion() + '/accounts/',
		
		fetch: function(args) {
			console.log("jdhfjkehj")
            api.get('/accounts/', {}, this.parse)
        },

		parse: function(resp, xhr) {
			return resp.data
		},
		
		destroy: function(options) {
			console.log(this.id)
			debugger;
			api.delete(this.urlRoot + this.id, options.data, options.cb)
		}
	});

	return factory(UserModel);
});
