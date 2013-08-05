define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var utils = require('utils');

	var Wing = require('models/wing');
	var alerts = require('views/lib/alerts');
	var wingFormTpl = require('tmpl!templates/app/profile/form.wing.html');
	var wingViewTpl = require('tmpl!templates/app/profile/view.wing.html');

	var wingFormTypeTpl = {
		accommodation: require('tmpl!templates/app/profile/form.wing.accommodation.html'),
	};
	var wingViewTypeTpl = {
		accommodation: require('tmpl!templates/app/profile/view.wing.accommodation.html'),
	};

	function wingModalTpl() {
		var content = wingFormTpl.apply(null, arguments);
		return '<div class="box-standard">' + content + '</div>';
	}

	var dataToWing = {
		accommodation: function(data) {
			var extraFields = _.pick(data, 'wheelchair', 'about', 'whereSleepingType',
				'additionalInformation', 'liveCenter', 'preferredGender', 'petsAllowed',
				'address', 'postalCode', 'smoking', 'iHavePet', 'blankets', 'number',
				'capacity');

			extraFields.publicTransport = data.transport;
			return extraFields;
		}
	};

	var defaultWing = new Wing.uncached({
		type: 'Accommodation',
		extraFields: {},
	});

	var WingsView = Backbone.View.extend({
		el: '#main',

		events: {
			'click #add-wing-btn': function(e) {
				e.preventDefault();
				this.wingModal = utils.showModal({
					header: 'Add Wing',
					accept: 'Save',
					loadingText: 'Saving...',
					content: wingModalTpl(defaultWing.toJSON(), {
						creating: true,
						wingTypeView: wingFormTypeTpl,
					}),
					form: '.wing-form.new-wing',
					thin: true,
				});
				this.initWing();
			},

			'click input#inputSharingOnce': function(event) {
				var target = $(event.target);
				var container = target.closest('.wings-info');

				if (target.is(':checked'))
					container.find('#sharing-dates').show();
				else {
					container.find('#sharing-dates').hide();
					container.find('.input-date').val('');
				}
			},

			'click a.edit-wing-btn': 'editWing',
			'click a.delete-wing-btn': 'deleteWing',
			'click button.cancel-wing-btn': 'cancelEdition',

			'submit .wing-form.new-wing': 'createWing',
			'submit .wing-form.edit-wing': 'submitWing',
		},

		initialize: function(collection) {
			_.bindAll(this, 'createWing');
			this.cityHolder = {};
			this.wings = collection;
		},

		dataToWing: function(wing, data) {
			var globalData = _.pick(data, 'id', 'type', 'author', 'dateStart',
				'dateEnd', 'name', 'status', 'bestDays', 'city', 'sharingOnce');

			globalData.extraFields = dataToWing[data.type.toLowerCase()](data);
			wing.set(globalData);
		},

		_wingFormHelper: function(event) {
			event.preventDefault();
			var error = false;

			var form = $(event.target);
			if (!form.valid())
				error = true;

			var data = this.parseForm(form);

			if (data.sharingOnce) {
				if (!data.dateStart || !data.dateEnd) {
					error = true;
					form.find('#wing-form-errors-date')
						.html('This field is required')
						.show();
				} else if (data.dateStart > data.dateEnd) {
					error = true;
					form.find('#wing-form-errors-date')
						.html('End date should be bigger than start date')
						.show();
				} else
					form.find('#wing-form-errors-date').hide();
			}

			if (error)
				return null;

			return data;
		},

		createWing: function(event) {
			var data = this._wingFormHelper(event);
			if (!data) return;
			var button = $('accept-modal-btn');
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
			var data = this._wingFormHelper(event);
			if (!data) return;
			var form = $(event.target);
			var wingId = +form.attr('data-rel');
			var wing = this.wings.get(wingId);
			var button = form.find('button.save-wing-btn');
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

		parseForm: function(form) {
			var data = utils.serializeForm(form);

			if (this.cityHolder.city) {
				data.city = this.cityHolder.city;
				this.cityHolder.city = null;
			} else {
				data = _.omit(data, 'city');
			}

			if (!data.sharingOnce)
				data = _.omit(data, ['dateStart', 'dateEnd']);

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
			this.refreshWing(wingId, false);
		},

		refreshWing: function(wingId, isEditing) {
			var tpl = isEditing ? wingFormTpl : wingViewTpl;
			var subTpl = isEditing ? wingFormTypeTpl : wingViewTypeTpl;
			var wing = this.wings.get(wingId);
			$('#wing-box-' + wingId).html(tpl(wing.toJSON(), {
				myProfile: true,
				wingTypeView: subTpl
			}));
			utils.resetMain(150);
			return wing;
		},

		initWing: function(wing) {
			this.$('.wing-form').validate();
			this.$('input.input-date')
				.datepicker({
					minDate: new Date(),
					dateFormat: 'yy-mm-dd',
				})
				.val('');

			if (wing && wing.get('sharingOnce')) {
				this.$('input[name=dateStart]').val(wing.get('dateStart'));
				this.$('input[name=dateEnd]').val(wing.get('dateEnd'));
			}

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
