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

			//console.log("render home ", new Date())
			
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
				
			if (params.gender == "Male"){
				this.$("input#inlineCheckbox1").attr("checked", true)
			}

			if (params.gender == "Female"){
				this.$("input#inlineCheckbox1").attr("checked", true)
			}

			if (params.gender == "Male,Female"){
				this.$("input#inlineCheckbox1").attr("checked", true)
				this.$("input#inlineCheckbox2").attr("checked", true)
			}

			this.$("select[name=capacity] option[value=" + params.capacity + "]").attr("selected", true)
			this.$("select[name=startAge] option[value=" + params.startAge + "]").attr("selected", true)
			this.$("select[name=endAge] option[value=" + params.endAge + "]").attr("selected", true)
			this.$("select[name=language] option[value=" + params.language + "]").attr("selected", true)
			this.$("input[type=radio][value=" + params['type'] + "]").attr("checked", true)
			
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
			formData.page = 1;
			
			router.navigate("#/search/" + api.urlEncode(formData), {trigger: false});
		},

	});

	return new mainHomeView;
});