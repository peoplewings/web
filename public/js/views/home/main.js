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

			$("input[name=startDate]").datepicker().datepicker("option", "dateFormat", "yy-mm-dd");
			$("input[name=endDate]").datepicker().datepicker("option", "dateFormat", "yy-mm-dd");

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

			if (new Date($("input[name=endDate]").val()) < new Date($("input[name=startDate]").val()))
				errors.push('DATE IS WRONG MODAFOKA!!!');

			if (+$("select[name=endAge]").val() < +$("select[name=startAge]").val())
				errors.push('AGE IS WRONG MODAFOKA!!!');

			if (errors.length)
				return this.displayErrors(errors);

			var formData = utils.serializeForm(e.target.id);
			formData.page = 1;
			router.navigate("#/search/" + api.urlEncode(formData), {trigger: false});
		},

	});

	return new MainHomeView;
});
