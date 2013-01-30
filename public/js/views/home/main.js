define(function(require) {

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var mainTpl = require("tmpl!templates/home/main.html")
	var accomodationTpl = require("tmpl!templates/home/search.accomodation.html")
	var jDate = require("jquery.Datepicker")


	var mainHomeView = Backbone.View.extend({
		
		el: "#main",
		
		ages: [],
		
		agesR: [],
		
		events: {
			"submit form#accomodation-search-form": "submitSearch",
		},
		
		initialize: function() {
			this.setAges()
		},
		
		render: function() {
			
			$(this.el).html(mainTpl);
			
			this.$form = this.$("#accomodation");
			this.$form.html(accomodationTpl);

			$("input[name=startDate]").datepicker().datepicker("option", "dateFormat", "yy-mm-dd")
			$("input[name=endDate]").datepicker().datepicker("option", "dateFormat", "yy-mm-dd")

		},
		submitSearch: function(e) {
			e.preventDefault()
			var data = utils.serializeForm(e.target.id)
			for(attr in data) if(data[attr] === "") delete data[attr]
			if(data['gender'] && data['gender2']) {
				delete data['gender']
				delete data['gender2']
			}
			if(data['gender2'] !== undefined) {
				data.gender = data['gender2']
				delete data['gender2']
			}
			data.page = 1
			this.renderResults(data)

		},
		renderResults: function(data) {
			var scope = this
			if(!this.resultView) {
				require(["views/home/results"], function(resultView) {
					scope.resultView = new resultView({
						logged: api.userIsLoggedIn(),
						target: "#main > div.row:last",
						query: data
					})
					api.get(api.getApiVersion() + "/profiles", data, function(results) {
						scope.resultView.render(results.data)
					})
				})
			} else {
				this.resultView.close()
				require(["views/home/results"], function(resultView) {
					scope.resultView = new resultView({
						logged: api.userIsLoggedIn(),
						target: "#main > div.row:last",
						query: data
					})
					api.get(api.getApiVersion() + "/profiles", data, function(results) {
						scope.resultView.render(results.data)
					})
				})
			}
		},
		setAges: function() {
			for(var i = 18; i < 100; i++) {
				this.agesR[i - 18] = (99 - i) + 18
				this.ages[i - 18] = i
			}
		}
	});
	return new mainHomeView;
});