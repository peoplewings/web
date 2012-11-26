define([
  'jquery',
  'backbone',
  'utils',
  'api',
  'jquery.Datepicker',
  'text!templates/home/main.html',
  'text!templates/home/accomodation.html',
], function($, Backbone, utils, api, jDate, mainHomeTpl, accomodationTpl){

  var mainHomeView = Backbone.View.extend({
    el: "#main",
	ages: [],
	agesR: [],
	events: {
		"submit form#accomodation-search-form": "submitSearch",
	},
	initialize: function(){
		this.setAges()
	},
    render: function(){
	  var sc = this
	  var tpl = _.template(accomodationTpl, {ages: sc.ages, agesR: sc.agesR })
      $(this.el).html(mainHomeTpl);
	  $("#accomodation").html(tpl)
	  $("input[name=startDate]").datepicker().datepicker("option", "dateFormat", "yy-mm-dd")
	  $("input[name=endDate]").datepicker().datepicker("option", "dateFormat", "yy-mm-dd")
	  
    },
	submitSearch: function(e){
		e.preventDefault()
		var data = utils.serializeForm(e.target.id)
		for (attr in data) if (data[attr] === "") delete data[attr]
		if (data['gender'] && data['gender2']){
			delete data['gender']
			delete data['gender2']	
		}
		if (data['gender2'] !== undefined ){
			data.gender = data['gender2']
			delete data['gender2']
		}
		data.page = 1
		api.get(api.getApiVersion() + "/profiles", data, this.renderResults)
		
	},
	renderResults: function(results){
		var scope = this
		if (!this.resultView){
			require(["views/home/results"], function(resultView){
					scope.resultView = new resultView(api.userIsLoggedIn())
					scope.resultView.render(results.data)
			})
		}
	},
	setAges: function(){
		for (var i = 18; i < 100; i++){
			this.agesR[i-18] = (99 - i) + 18
			this.ages[i-18] = i
		}
	}
  });
  return new mainHomeView;
});
