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
			* BUG: Do search is never reached
			* google.maps.event.addListener(this.search, 'place_changed', this.doSearch.bind(this));
			*/
			
			if (params)
				this.unserializeParams(params);

		},

		unserializeParams: function(params){
			var self = this;
			_.each(params, function(value, key){
				self.$("[name=" + key + "]")
				.val(value);
			});
		},

		renderResults: function(query, results) {
			this.resultsView = new ResultsView({
				logged: api.userIsLoggedIn(),
				query: query,
			});

			this.resultsView.render(results);
		},

		displayErrors: function(errors) {
			this.$('.form-errors').html(errors.map(function(error) {
				return '<li>' + error + '</li>';
			}));
		},

		submitSearch: function(e) {
			var errors = [];
			e.preventDefault();
			
			var crc = self.$('#inputWings').val()
			self.$('#inputWings').val(crc.split(',')[0]);

			if (new Date($("input[name=endDate]").val()) < new Date($("input[name=startDate]").val()))
				errors.push('DATE IS WRONG MODAFOKA!!!');

			if (+$("select[name=endAge]").val() < +$("select[name=startAge]").val())
				errors.push('AGE IS WRONG MODAFOKA!!!');

			if (errors.length)
				return this.displayErrors(errors);

			var formData = utils.serializeForm(e.target.id);
			formData.page = 1;
			//Trigger false isn't working here due to BacboneJS bug I guess
			router.navigate("#/search/" + api.urlEncode(formData), {trigger: false});
		},

	});

	return new MainHomeView;
});
