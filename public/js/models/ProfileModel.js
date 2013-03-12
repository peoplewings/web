define(function(require) {

	var Backbone = require('backbone');
	var api = require('api2');
	var Promise = require('promise');
	var phrases = require('phrases');

	var factory = require('core/factory');

	var Preview = Backbone.Model.extend({

		urlRoot: api.getApiVersion() + "/profiles/",

		url: function(){
			return (api.getUserId() === this.id) ? this.urlRoot + this.id : this.urlRoot + this.id + "/preview";
		},

		fetch: function(options) {
			var self = this;
			/*Promise.parallel(
			api.get(this.url())
				.then(function(resp){
					self.attributes = resp.data;
					if (options && options.success)
						options.success();
				});*/

			Promise.parallel(
				api.get(this.url()),
				api.get(api.getApiVersion() + "/profiles/" + self.id + "/accomodations/preview")
				).spread(function(profile, wings) {
					profile.data.civilState = phrases.choices.civilState[profile.data.civilState];
					profile.data.replyTime = moment.duration(+profile.data.replyTime).humanize();
					self.attributes = profile.data;

					var parsed = wings.data.map(function(wing){
						wing.bestDays = phrases.choices.wingDaysChoices[wing.bestDays];
						wing.smoking = phrases.choices.smoking[wing.smoking];
						wing.whereSleepingType = phrases.choices.whereSleepingType[wing.whereSleepingType];
						wing.status = phrases.choices.wingStatus[wing.status];
						return wing;
					});
					self.set("wingsCollection", parsed);

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
