//jshint camelcase:false

define(function(require) {

	require("jquery.Datepicker");
	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var utils = require("utils");
	var mainTpl = require("tmpl!templates/home/main.html");
	var accomodationTpl = require("tmpl!templates/home/search.accomodation.html");
	var ResultsView = require("views/home/results");

	var MainHomeView = Backbone.View.extend({

		el: "#main",

		events: {
			"submit form#accomodation-search-form": "submitSearch",
		},

		initialize: function() {

		},

		render: function(params) {
			$(this.el).html(mainTpl);

			this.$("#accomodation").html(accomodationTpl);

			this.$("input[name=startDate]").datepicker({
				minDate: new Date(),
				dateFormat: "yy-mm-dd",
			});
			this.$("input[name=endDate]").datepicker({
				minDate: new Date(),
				dateFormat: "yy-mm-dd",
			});

			this.search = new google.maps.places.Autocomplete(document.getElementById("inputWings"), { types: ['(cities)'] });

			/*
			* BUG: Do search is never reached if user selects city by pressing Enter
			*/
			google.maps.event.addListener(this.search, 'place_changed', this.doSearch.bind(this));

			if (params)
				this.unserializeParams(params);

		},

		doSearch: function(){
			var cc = utils.getCityAndCountry(this.search.getPlace().address_components);
			if (!cc)
				return;
			else
				this.cityField = cc.city;
		},

		unserializeParams: function(params){
			var self = this;
			_.each(params, function(value, key){
				self.$("[name=" + key + "]")
				.val(value);
			});
		},

		renderResults: function(query, results) {
			if (!this.resultsView)
				this.resultsView = new ResultsView();

			this.resultsView.reset({
				logged: api.userIsLoggedIn(),
				query: query,
			});

			this.resultsView.render(results);
		},

		/* HELLO SERGI ! */
		displayErrors: function(errors) {
			this.$('.form-errors').html(errors.map(function(error) {
				return '<label class="error">' + error + '</label>';
			}));
		},

		submitSearch: function(e) {
			var errors = [];
			e.preventDefault();

			var crc = this.$('#inputWings').val();
			this.$('#inputWings').val(crc.split(',')[0]);

			if (new Date($("input[name=endDate]").val()) < new Date($("input[name=startDate]").val()))
				errors.push('Invalid dates');

			if (+$("select[name=endAge]").val() < +$("select[name=startAge]").val())
				errors.push('Invalid age');

			if (errors.length)
				return this.displayErrors(errors);

			var formData = utils.serializeForm(e.target.id);
			if (this.cityField)
				formData.wings = this.cityField;
			formData.page = 1;
			//Trigger false isn't working here due to BacboneJS bug I guess
			router.navigate("#/search/" + api.urlEncode(formData), {trigger: false});
		},

	});

	return new MainHomeView;
});
