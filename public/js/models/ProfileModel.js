define(function(require) {

	var Backbone = require('backbone');
	var api = require('api2');
	var Promise = require('promise');
	var phrases = require('phrases');

	var factory = require('core/factory');

	var Preview = Backbone.Model.extend({

		me: function(){
			return api.getUserId() === this.id;
		},

		urlRoot: api.getApiVersion() + "/profiles/",

		url: function(){
			return this.me() ? this.urlRoot + this.id : this.urlRoot + this.id + "/preview";
		},

		urlWings: function(){
			return  this.me() ? this.urlRoot + this.id + "/accomodations": this.urlRoot + this.id + "/accomodations/preview";
		},

		fetch: function(options) {
			var self = this;
			Promise.parallel(
				api.get(this.url()),
				api.get(this.urlWings())
				).spread(function(profile, wings) {
					self.parse(profile.data, wings.data);

					if (options && options.success)
						options.success();
				});
		},

		parse: function(profile, wings){
			profile.civilStateVerbose = phrases.choices.civilState[profile.civilState];
			profile.replyTimeVerbose = moment.duration(+profile.replyTime).humanize();

			profile.birthdayVerbose = this.parseBirthday({
				day: profile.birthDay,
				month: profile.birthMonth,
				year: profile.birthYear,
				privacy: profile.showBirthday,
			});

			this.attributes = profile;

			var parsed = wings.map(function(wing){
				wing.bestDaysVerbose = phrases.choices.wingDaysChoices[wing.bestDays];
				wing.smokingVerbose = phrases.choices.smoking[wing.smoking];
				wing.whereSleepingTypeVerbose = phrases.choices.whereSleepingType[wing.whereSleepingType];
				wing.statusVerbose = phrases.choices.wingStatus[wing.status];
				return wing;
			});

			this.set("wingsCollection", parsed);
		},

		parseBirthday: function(options){
			switch (options.privacy){
				case "F":
					return options.month + "-" + options.day + "-" + options.year;
				case "P":
					return options.month + "-" + options.day;
				case "N":
					return "";
			}
		},

		save: function(data){
			var self = this;

			_.each(data, function(value, attr){
				self.set(attr, value);
				if (attr === "interestedIn")
					self.set(attr, [{gender: value}]);
			});

			var copy = _.omit(this.attributes, ["replyTimeVerbose","civilStateVerbose"]);

			return api.put(this.urlRoot + this.id, copy);
		}

	});

	// Returns the Model singleton instance
	return factory(Preview);
});
