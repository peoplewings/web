//jshint camelcase:false

define(function(require) {

	require("jquery.Datepicker");
	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var utils = require("utils");
	var mainTpl = require("tmpl!templates/home/main.html");
	var peopleTpl = require("tmpl!templates/home/search.people.html");
	var accomodationTpl = require("tmpl!templates/home/search.accomodation.html");
	var ResultsView = require("views/home/results");

	var MainHomeView = Backbone.View.extend({

		el: "#main",

		events: {
			"submit form#people-search-form": "searchPeople",
			"submit form#accomodation-search-form": "searchAccommodation",
		},

		initialize: function() {

		},

		render: function(type, params) {
			$(this.el).html(mainTpl({ selected: type }));

			this.$("#people").html(peopleTpl(params));
			this.$("#accommodation").html(accomodationTpl(params));

			this.$("input[name=startDate]").datepicker({
				minDate: new Date(),
				dateFormat: "yy-mm-dd",
			});
			this.$("input[name=endDate]").datepicker({
				minDate: new Date(),
				dateFormat: "yy-mm-dd",
			});

			this.search = new google.maps.places.Autocomplete(document.getElementById("inputLocation"), { types: ['(cities)'] });
			this.search = new google.maps.places.Autocomplete(document.getElementById("inputWings"), { types: ['(cities)'] });

			/*
			 * BUG: Do search is never reached if user selects city by pressing Enter
			 */
			google.maps.event.addListener(this.search, 'place_changed', this.setCityField.bind(this));

			if (params)
				this.unserializeParams(params);

			if (!api.userIsLoggedIn())
				$("#feedback-btn").hide();

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
				self.$("[name=" + key + "]")
				.val(value);
			});
		},

		renderResults: function(type, query, results) {
			if (this.resultsView)
				this.resultsView.close();

			this.resultsView = new ResultsView({
				logged: api.userIsLoggedIn(),
				query: query,
				type: type,
			});

			this.resultsView.render(results);

			if (window.router.firstExecution) {
				window.router.firstExecution = false;

				var body = $(document.body)
					.addClass('tutorial-running');

				function end() {
					body.removeClass('tutorial-running');
				}

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
			var filters = _.defaults(params, this._defaults[type]);
			this.render(type, filters);
			return api.get(api.getApiVersion() + "/profiles", filters)
				.prop('data')
				.then(this.renderResults.bind(this, type, filters));
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

			_.each(this._defaults['people'], function(value, key) {
				if (formData[key] == value)
					delete formData[key];
			});

			//Trigger false isn't working here due to BacboneJS bug I guess
			router.navigate("#/search/people/" + api.urlEncode(formData), {trigger: false});

		},

		searchAccommodation: function(e) {
			var errors = [];
			e.preventDefault();

			var crc = this.$('#inputWings').val();
			this.$('#inputWings').val(crc.split(',')[0]);

			if (new Date($("input[name=endDate]").val()) < new Date($("input[name=startDate]").val()))
				errors.push({css: 'date-error', text: 'Invalid dates'});

			if (+$("select[name=endAge]").val() < +$("select[name=startAge]").val())
				errors.push({css: 'age-error', text: 'Invalid age'});

			if (errors.length)
				return this.displayErrors(errors);

			var formData = utils.serializeForm(e.target.id);
			if (this.cityField){
				formData.wings = this.cityField;
				this.cityField = null;
			}

			formData.page = 1;

			_.each(this._defaults['accommodation'], function(value, key) {
				if (formData[key] == value)
					delete formData[key];
			});

			//Trigger false isn't working here due to BacboneJS bug I guess
			router.navigate("#/search/accommodation/" + api.urlEncode(formData), {trigger: false});
		},

	});

	return new MainHomeView;
});
