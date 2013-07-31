define(function(require) {

	var Backbone = require('backbone');
	var api = require('api');
	var Promise = require('promise');
	var factory = require('core/factory');
	var Wing = require('models/Wing');
	var Wings = require('collections/wings');

	function getId(item) {
		return item.id;
	}

	var Preview = Backbone.Model.extend({

		urlRoot: api.getApiVersion() + '/profiles/',

		url: function() {
			return this.urlRoot + this.id + (this.isMyProfile() ? '' : '/preview');
		},

		urlWings: function() {
			return api.getApiVersion() + '/wings/?author=' + this.id;
		},

		isMyProfile: function() {
			return api.getUserId() === this.id;
		},

		fetch: function() {
			var wings = new Wings(null, { author: this.id });

			return Promise.parallel(
				wings.fetch(),
				Backbone.Model.prototype.fetch.call(this)
			).spread(this.afterLoad.bind(this));
		},

		parse: function(response) {
			return response.data;
		},

		afterLoad: function(wings) {
			this.formattedBirthday = this.parseBirthday({
				day: this.birthDay,
				month: this.birthMonth,
				year: this.birthYear,
				privacy: this.showBirthday,
			});

			this.wings = wings;
			wings.on('change', this.trigger.bind(this, 'change'));
		},

		parseWing: function(data) {
			return new Wing(data);
		},

		parseBirthday: function(options) {
			switch (options.privacy) {
			case 'F':
				return options.month + '-' + options.day + '-' + options.year;
			case 'P':
				return options.month + '-' + options.day;
			case 'N':
				return '';
			}
		},

		save: function(data) {
			if (data.interestedIn)
				data.interestedIn = [{ gender: data.interestedIn }];
			return Backbone.Model.prototype.save.call(this, data);
		},

		getWingById: function(id) {
			return _.find(this.wings, function(wing) {
				return wing.id === id;
			});
		},

		findIndexByWingId: function(id) {
			var ids = this.wings.map(getId);

			var index = ids.indexOf(id);
			return index !== -1 ? index : null;
		},

		pick: function() {
			return _.pick(this.attributes, _.toArray(arguments));
		}
	});

	// Returns the Model singleton instance
	return factory(Preview);
});
