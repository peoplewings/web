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
			return  this.me() ? this.urlRoot + this.id + "/accomodations" : this.urlRoot + this.id + "/accomodations/preview";
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

		fetchWing: function(options){
			if (!options)
				return;

			var self = this;
			api.get(this.urlWings() + "/" + options.wingId)
			.then(function(resp){
				self.setWing(options.wingId, self.parseWing(resp.data));
				if (options.success)
					options.success();
			});
		},

		fetchWings: function(options){
			var self = this;
			api.get(this.urlWings())
			.then(function(resp){
				self.set("wingsCollection", resp.data.map(self.parseWing));
				self.trigger("change:wingsCollection");

				if (options.success)
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

			this.set("wingsCollection", wings.map(this.parseWing.bind(this)));
		},

		parseWing: function(wing){
			wing.bestDaysVerbose = phrases.choices.wingDaysChoices[wing.bestDays];
			wing.smokingVerbose = phrases.choices.smoking[wing.smoking];
			wing.whereSleepingTypeVerbose = phrases.choices.whereSleepingType[wing.whereSleepingType];
			wing.statusVerbose = phrases.choices.wingStatus[wing.status];
			wing.myProfile = this.me();
			return wing;
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

			var copy = _.omit(this.attributes, ["replyTimeVerbose","civilStateVerbose", "wingsCollection"]);

			return api.put(this.urlRoot + this.id, copy);
		},

		setWing: function(id, update){
			var index = this.findIndexByWingId(id);
			this.attributes.wingsCollection[index] = update;
			this.trigger("change:wingsCollection");
		},

		findWingById: function(id){
			return _.find(this.get("wingsCollection"), function(wing){
				return wing.id === id;
			});
		},

		findIndexByWingId: function(id){
			var index = null;
			_.find(this.get("wingsCollection"), function(wing, idx){
				if (wing.id === id){
					index = idx;
				}
				return wing.id === id;
			});

			return index;
		},

		deleteWingById: function(id){
			var wing = this.findWingById(id);
			var collection = this.get("wingsCollection");

			this.set("wingsCollection", _.omit(collection, wing));

			console.log(this.get("wingsCollection"));

			debugger;
		},

	});

	// Returns the Model singleton instance
	return factory(Preview);
});
