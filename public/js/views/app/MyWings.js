define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var utils = require('utils');

	var Wing = require('models/wing');
	var alerts = require('views/lib/alerts');
	var wingModalTpl = require('tmpl!templates/lib/modal.form.wings.html');
	var wingFormTpl = require('tmpl!templates/app/profile/form.wing.html');
	var wingViewTpl = require('tmpl!templates/app/profile/view.wing.html');

	var wingTypeTpl = {
		accomodation: require('tmpl!templates/app/profile/view.wing.accommodation.html'),
	};

	var WingsView = Backbone.View.extend({
		el: '#main',

		events: {
			//'change [name=generalStatus]': 'changeStatus',
			'click #add-wing-btn': function(e) {
				e.preventDefault();
				this.wingModal = utils.showModal({
					header: 'Add Wing',
					accept: 'Save',
					loadingText: 'Saving...',
					content: wingModalTpl,
					send: this.submitWing,
					form: 'accomodation-form',
					thin: true,
				});
				this.initWing();
			},
			'click input#inputSharingOnce': function(evt) {
				if (evt.target.checked)
					this.$('div#sharing-dates').show();
				else {
					this.$('div#sharing-dates').hide();
					this.$('[name=dateStart]').val('');
					this.$('[name=dateEnd]').val('');
				}
			},
			'click a.edit-wing-btn': 'editWing',
			'click a.delete-wing-btn': 'deleteWing',
			'click button.cancel-wing-btn': 'cancelEdition',
			'submit form#accomodation-form': 'createWing',
			'submit form[id^=accomodation-form-]': 'submitWing',
		},

		initialize: function(collection) {
			this.cityHolder = {};
			this.wings = collection;
		},

		dataToWing: function(wing, data) {
			var globalData = _.pick(data, 'id', 'type', 'author', 'dateStart',
				'dateEnd', 'name', 'status', 'bestDays', 'city', 'sharingOnce');

			var extraFields = _.pick(data, 'wheelchair', 'about', 'whereSleepingType',
				'additionalInformation', 'liveCenter', 'preferredGender', 'petsAllowed',
				'address', 'postalCode', 'smoking', 'iHavePet', 'blankets');

			extraFields.PublicTransport = data.transport;
			globalData.extraFields = new Backbone.Model(extraFields);
			wing.set(globalData);
		},

		createWing: function(event) {
			event.preventDefault();
			var target = $(event.target);
			var data = this.parseForm(target, null);
			var button = target.find('button.save-wing-btn');
			var tmpWing = new Wing.uncached();
			var self = this;

			this.dataToWing(tmpWing, data);

			button.button('loading');
			return tmpWing.save().then(function() {
				self.wings.fetch();
				self.wingModal.modal('hide');
				alerts.success('Wing saved');
			}).fin(function() {
				button.button('reset');
			});
		},

		submitWing: function(event) {
			event.preventDefault();
			var target = $(event.target);
			var wingId = +target.attr('data-rel');
			var wing = this.wings.get(wingId);
			var button = target.find('button.save-wing-btn');
			var data = this.parseForm(target.attr('id'), wing.get('city'));
			var self = this;

			this.dataToWing(wing, data);

			button.button('loading');
			return wing.save()
				.then(wing.fetch.bind(wing))
				.then(function() {
					self.refreshWing(wingId, false);
					alerts.success('Wing saved');
				}).fin(function() {
					button.button('reset');
				});
		},

		parseForm: function(form, city) {
			var data = utils.serializeForm(form);

			if (!data.sharingOnce)
				data = _.omit(data, ['dateStart', 'dateEnd']);

			data.city = this.cityHolder.city;
			data.type = 'Accommodation';
			return data;
		},

		editWing: function(event) {
			event.preventDefault();
			var wingId = +event.target.attributes['wing-id'].value;
			this.initWing(this.refreshWing(wingId, true));
		},

		cancelEdition: function(event) {
			event.preventDefault();
			var wingId = +event.target.attributes['wing-id'].value;
			this.$('#accomodation-form-' + wingId).get(0).reset();
			this.refreshWing(wingId, false);
		},

		refreshWing: function(wingId, isEditing) {
			var tpl = isEditing ? wingFormTpl : wingViewTpl;
			var wing = this.wings.get(wingId);
			$('#wing-box-' + wingId).html(tpl(wing, { myProfile: true }));
			utils.resetMain(150);
			return wing;
		},

		initWing: function(wing) {
			this.$('#accomodation-form').validate();
			this.$('input.input-date')
				.datepicker({
					minDate: new Date(),
					dateFormat: 'yy-mm-dd',
				})
				.val('');

			if (wing && wing.get('sharingOnce')) {
				this.$('div#sharing-dates').show();
				this.$('input[name=dateStart]').val(wing.get('dateStart'));
				this.$('input[name=dateEnd]').val(wing.get('dateEnd'));
			}

			this.$('div#sharing-dates').hide();

			var cityInput = this.$('#inputCity');
			var autoCity = new google.maps.places.Autocomplete(cityInput.get(0), {
				types: [ '(cities)' ]
			});

			google.maps.event.addListener(autoCity, 'place_changed',
				utils.setAutocomplete.bind(utils, autoCity, this.cityHolder));

			cityInput.keypress(function(event) {
				if (event.which === 13) event.preventDefault();
			});

			this.$('#accomodation-form').validate();
		},

		deleteWing: function(event) {
			event.preventDefault();
			var wingId = event.target.attributes['wing-id'].value;
			var wing = this.wings.get(wingId);

			if (confirm('Are you sure you want to delete this wing?')) {
				wing.destroy().then(
					alerts.success.bind(alerts, 'Wing deleted'),
					alerts.defaultError
				);
			}
		}
	});

return WingsView;
});
