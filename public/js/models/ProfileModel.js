define(function(require) {

	var Backbone = require('backbone');
	var api = require('api2');
	var phrases = require('phrases');
	var factory = require('core/factory');

	var Preview = Backbone.Model.extend({

		urlRoot: api.getServerUrl() + api.getApiVersion() + "/profiles/",

		url: function(){
			return this.urlRoot + this.id + "/preview";
		},

		parse: function(resp){
			resp.data.replyTime = moment.duration(resp.data.replyTime).humanize();
			resp.data.civilState = phrases.choices.civilState[resp.data.civilState];
			return resp.data;
		},

	});

    // Returns the Model singleton instance
	return factory(Preview);
});
