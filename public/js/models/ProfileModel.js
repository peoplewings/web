define(function(require) {

	var Backbone = require('backbone');
	var api = require('api2');
	var phrases = require('phrases');
	var factory = require('core/factory');

	var Preview = Backbone.Model.extend({

		urlRoot: api.getServerUrl() + api.getApiVersion() + "/profiles/",

		url: function(){
			return  (api.getUserId() === this.id) ? this.urlRoot + this.id : this.urlRoot + this.id + "/preview";
		},

		parse: function(resp){
			resp.data.replyTime = moment.duration(resp.data.replyTime).humanize();
			resp.data.civilState = phrases.choices.civilState[resp.data.civilState];
			return resp.data;
		},

		save: function(data){
			var self = this;
			var aux = [];

			_.each(data, function(value, attr){
				console.log(attr, value)
				debugger
				if (attr === "civilState"){
					debugger
					//self.set("civilState", )
				}
				if (attr === "interestedInF" || attr === "interestedInM"){
					aux.push({ gender: value});
					self.set('interestedIn', aux);
				}
				else
					self.set(attr, value);
			});
			return api.put(api.getApiVersion() + '/profiles/' + this.id, this.attributes)
					.prop('status');
		}

	});

    // Returns the Model singleton instance
	return factory(Preview);
});
