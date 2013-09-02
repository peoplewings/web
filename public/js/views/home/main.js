/*globals introJs */
//jshint camelcase:false

define(function(require) {

	require('jquery.Datepicker');
	var $ = require('jquery');
	var Backbone = require('backbone');
	var api = require('api');
	var utils = require('utils');
	var mainTpl = require('tmpl!templates/home/main.html');
	var peopleTpl = require('tmpl!templates/home/search.people.html');
	var accomodationTpl = require('tmpl!templates/home/search.accomodation.html');
	var ResultsView = require('views/home/results');
	var Promise = require('promise');

	function cleanFormDataHelper(defaults, value, key, formData) {
		var def = defaults[key];

//jshint eqeqeq:false
		if (value === '' || value == def)
			delete formData[key];
	}


	var MainHomeView = Backbone.View.extend({

		el: '#main',
		type: null,

		events: {
			'submit form#people-search-form': 'searchPeople',
			'submit form#accomodation-search-form': 'searchAccommodation',
			'click span.advanced-search': '_onClickAdvancedSearchButton',
			'click span.basic-search': '_onClickBasicSearchButton',
		},

		initialize: function() {

		},

		render: function(type, params) {
			this.type = type;
			$(this.el).html(mainTpl(
				{
					selected: type,
					logged: api.getUserId() ? true : false,
				}));

			this.$('#people').html(peopleTpl(params));
			this.$('#accommodation').html(accomodationTpl(params));

			this.$('input[name=startDate]').datepicker({
				minDate: new Date(),
				dateFormat: 'yy-mm-dd',
			});
			this.$('input[name=endDate]').datepicker({
				minDate: new Date(),
				dateFormat: 'yy-mm-dd',
			});

			this.search = new google.maps.places.Autocomplete(document.getElementById('inputLocation'), { types: ['(cities)'] });
			this.search = new google.maps.places.Autocomplete(document.getElementById('inputWings'), { types: ['(cities)'] });

			/*
			 * BUG: Do search is never reached if user selects city by pressing Enter
			 */
			google.maps.event.addListener(this.search, 'place_changed', this.setCityField.bind(this));

			if (params)
				this.unserializeParams(params);

			if (!api.userIsLoggedIn())
				$('#feedback-btn').hide();

			if (this.advanced && type === 'people') this.showAdvancedSearch();
			if (this.advanced && type === 'accommodation') this.showAdvancedSearchAcc();

		},

		setCityField: function(){
			var place = this.search.getPlace();
			var cc = null;

			if (place)
				cc = utils.getCityAndCountry(place.address_components);
			if (!cc)
				return;

			this.cityField = cc.city;
		},

		unserializeParams: function(params){
			var self = this;
			_.each(params, function(value, key){
				self.$('[name=' + key + ']')
				.val(value);
			});
		},

		renderResults: function(type, query, myId, results, myWings) {
			if (this.resultsView)
				this.resultsView.close();

			this.resultsView = new ResultsView({
				logged: api.userIsLoggedIn(),
				query: query,
				type: type,
			});

			this.resultsView.render(results, myWings ? myWings.length : true, myId);

			if (window.router.firstExecution) {
				window.router.firstExecution = false;

				var body = $(document.body)
					.addClass('tutorial-running');

				var end = function() {
					body.removeClass('tutorial-running');
				};

				introJs()
					.setOption('showStepNumbers', false)
					.oncomplete(end)
					.onexit(end)
					.start();
			}
		},

		displayErrors: function(errors) {
			var self = this;

			errors.map(function(error){
				self.$('.form-errors.' + error.css)
				.html('<label class="error">' + error.text + '</label>');
			});
		},

		_defaults: {
			'people': {
				wingType: 'people',
				language: 'all',
				gender: 'Both',
				startAge: 18,
				endAge: 98,
				page: 1,
			},
			'accommodation': {
				capacity: 1,
				language: 'all',
				type: 'Host',
				gender: 'Both',
				startAge: 18,
				endAge: 98,
				page: 1,
			}
		},

		execute: function(type, params) {
			var myId = api.getUserId();
			var filters = _.defaults(params, this._defaults[type]);
			this.render(type, filters);
			return Promise.parallel(
				api.get(api.getApiVersion() + '/profiles', filters).prop('data'),
				myId && api.get(api.getApiVersion() + '/wings?author=' + myId).prop('data')
			).spread(this.renderResults.bind(this, type, filters, myId ? myId : false));

		},

		searchPeople: function(e) {
			var errors = [];
			e.preventDefault();

			var crc = this.$('#inputLocation').val();
			this.$('#inputLocation').val(crc.split(',')[0]);

			if (errors.length)
				return this.displayErrors(errors);

			var formData = utils.serializeForm(e.target.id);
			if (this.cityField){
				formData.wings = this.cityField;
				this.cityField = null;
			}

			formData.page = 1;
			_.each(formData, cleanFormDataHelper.bind(null, this._defaults.people));
			if (!this.advanced){
				delete formData.hero;
			};
			//Trigger false isn't working here due to BacboneJS bug I guess
			router.navigate('#/search/people/' + api.urlEncode(formData), {trigger: false});

		},

		searchAccommodation: function(e) {
			var errors = [];
			e.preventDefault();

			var crc = this.$('#inputWings').val();
			this.$('#inputWings').val(crc.split(',')[0]);

			if (new Date($('input[name=endDate]').val()) < new Date($('input[name=startDate]').val()))
				errors.push({css: 'date-error', text: 'Invalid dates'});

			if (+$('select[name=endAge]').val() < +$('select[name=startAge]').val())
				errors.push({css: 'age-error', text: 'Invalid age'});

			if (errors.length)
				return this.displayErrors(errors);

			var formData = utils.serializeForm(e.target.id);
			if (this.cityField){
				formData.wings = this.cityField;
				this.cityField = null;
			}

			formData.page = 1;
			_.each(formData, cleanFormDataHelper.bind(null, this._defaults.accommodation));
			if (!this.advanced){
				delete formData.hero;
			};
			//Trigger false isn't working here due to BacboneJS bug I guess
			router.navigate('#/search/accommodation/' + api.urlEncode(formData), {trigger: false});
		},

		_onClickAdvancedSearchButton: function(e) {
			e.preventDefault();
			this.type && this.type === 'people' ? this.showAdvancedSearch() : this.showAdvancedSearchAcc()
		},

		showAdvancedSearch: function() {
			this.$('#inputName').css('display', 'block');
			this.$('.advanced-search').css('display', 'none');
			this.$('.basic-search').css('display', 'block');
			this.advanced = true;
		},

		showAdvancedSearchAcc: function() {
			this.$('#inputNameAcc').css('display', 'block');
			this.$('.advanced-search').css('display', 'none');
			this.$('.basic-search').css('display', 'block');
			this.advanced = true;
		},

		_onClickBasicSearchButton: function(e) {
			e.preventDefault();
			this.type && this.type === 'people' ? this.showBasicSearch() : this.showBasicSearchAcc()
		},

		showBasicSearch: function() {
			this.$('#inputName').css('display', 'none');
			this.$('.advanced-search').css('display', 'block');
			this.$('.basic-search').css('display', 'none');
			this.advanced = false;
		},

		showBasicSearchAcc: function() {
			this.$('#inputNameAcc').css('display', 'none');
			this.$('.advanced-search').css('display', 'block');
			this.$('.basic-search').css('display', 'none');
			this.advanced = false;
		},

	});

	return new MainHomeView;
});
