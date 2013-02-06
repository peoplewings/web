define(function(require) {

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var utils = require("utils");
	var mainTpl = require("tmpl!templates/home/main.html")
	var accomodationTpl = require("tmpl!templates/home/search.accomodation.html")
	var jDate = require("jquery.Datepicker")

	var ResultsView = require("views/home/results")
	
	var mainHomeView = Backbone.View.extend({
		
		el: "#main",
		
		events: {
			"submit form#accomodation-search-form": "submitSearch",
		},

		initialize: function() {

		},
		
		render: function(params) {
			$(this.el).html(mainTpl);
			
			this.$("#accomodation").html(accomodationTpl);

			$("input[name=startDate]").datepicker().datepicker("option", "dateFormat", "yy-mm-dd")
			$("input[name=endDate]").datepicker().datepicker("option", "dateFormat", "yy-mm-dd")

			if (params)
				this.unserializeParams(params)

		},

		unserializeParams: function(params){

			if (params.wings)
				this.$("input[name=wings]").val(params.wings)

			if (params.startDate){
				this.$("input[name=startDate]").val(params.startDate)
				this.$("input[name=endDate]").val(params.endDate)
			}
				
			if (params.gender.length == 1){
				this.$("select[name=capacity] option[value=" + params.gender[0] + "]").attr("selected", true)
			}

			if (params.gender.length > 1){
				this.$("select[name=capacity] option[value=Both]").attr("selected", true)
			}

			this.$("select[name=capacity] option[value=" + params.capacity + "]").attr("selected", true)
			this.$("select[name=startAge] option[value=" + params.startAge + "]").attr("selected", true)
			this.$("select[name=endAge] option[value=" + params.endAge + "]").attr("selected", true)
			this.$("select[name=language] option[value=" + params.language + "]").attr("selected", true)
			this.$("select[name=type] option[value=" + params.type + "]").attr("selected", true)
			
		},

		renderResults: function(query, results) {

			this.resultsView = new ResultsView({
				logged: api.userIsLoggedIn(),
				query: query,
			})	

			this.resultsView.render(results);
		},

		submitSearch: function(e) {
			e.preventDefault();

			var self = this;
			var formData = utils.serializeForm(e.target.id);

			if (formData.gender.indexOf("Both") == 0)
				formData.gender = ["Male", "Female"];
			
			formData.page = 1;
			
			router.navigate("#/search/" + api.urlEncode(formData), {trigger: false});
		},

	});

	return new mainHomeView;
});