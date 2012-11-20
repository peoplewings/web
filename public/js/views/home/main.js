define([
  'jquery',
  'backbone',
  'utils',
  'api',
  'jquery.Datepicker',
  'text!templates/home/main.html',
  'text!templates/home/accomodation.html',
  'text!templates/home/search_result.html',
], function($, Backbone, utils, api, jDate, mainHomeTpl, accomodationTpl, resultTpl){

  var mainHomeView = Backbone.View.extend({
    el: "#main",
	ages: [],
	agesR: [],
	events: {
		"submit form#accomodation-search-form": "submitSearch",
		"click button.fake-btn": "alertLog"
	},
	initialize: function(){
		this.setAges()
	},
    render: function(){
	  var sc = this
	  var tpl
      $(this.el).html(mainHomeTpl);
	  this.setLanguages(function(response){
			tpl = _.template(accomodationTpl, {ages: sc.ages, agesR: sc.agesR, languages: response.data})
			$("#accomodation").html(tpl)
			$("input[name=startDate]").datepicker().datepicker("option", "dateFormat", "yy-mm-dd")
			$("input[name=endDate]").datepicker().datepicker("option", "dateFormat", "yy-mm-dd")
	  })
    },
	submitSearch: function(e){
		e.preventDefault()
		var data = utils.serializeForm(e.target.id)
		for (attr in data) if (data[attr] === "") delete data[attr]
		data.page = 1
		console.log(data)
		api.get(api.getApiVersion() + "/profiles", data, this.renderResults)
		
	},
	renderResults: function(results){
		console.log(results)
		$(".pagination").show()
		var tpl, style
		if (!api.userIsLoggedIn()) style = 'style="color: transparent;text-shadow: 0 0 5px rgba(0,0,0,0.5)"'
		$.each(results.data.profiles, function(index, item){
			tpl = _.template(resultTpl, {extraAttribute: style, result: item, currentCity: item.current.name, currentCountry: item.current.country, languages: item.languages})
			$(".pagination:last").before(tpl)
		})
	},
	setAges: function(){
		for (var i = 18; i < 100; i++){
			this.agesR[i-18] = (99 - i) + 18
			this.ages[i-18] = i
		}
	},
	setLanguages: function(callback){
		api.get(api.getApiVersion() + "/languages", {}, callback)
	},
	alertLog: function(){
		alert("You need to be logged in to use this function")
	}
  });
  return new mainHomeView;
});
