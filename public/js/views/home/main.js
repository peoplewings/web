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
	events: {
		"submit form#accomodation-search-form": "submitSearch",
	},
	initialize: function(){
		this.setAges()
	},
    render: function(){
	  var sc = this
      $(this.el).html(mainHomeTpl);
	  var tpl
	  this.setLanguages(function(response){
			tpl = _.template(accomodationTpl, {ages: sc.ages, languages: response.data})
			$("#accomodation").html(tpl)
			  $("input[name=endDate]").datepicker({
				beforeShow: function (textbox, instance) {
		            instance.dpDiv.css({
		                    marginTop: (textbox.offsetHeight*2) + 'px',
		                    marginLeft: textbox.offsetWidth + 'px'
		            });
		        }});
			  $("input[name=startDate]").datepicker({
				beforeShow: function (textbox, instance) {
		            instance.dpDiv.css({
		                    marginTop: (textbox.offsetHeight*2) + 'px',
		                    marginLeft: textbox.offsetWidth + 'px'
		            });
		        }});
	  })
    },
	submitSearch: function(e){
		e.preventDefault()
		//console.log('Submit Search: #' + e.target.id)
		var data = utils.serializeForm(e.target.id)
		//console.log(data)
		for (attr in data) if (data[attr] === "") delete data[attr]
		alert("You are not sending fields!")
		api.get(api.getApiVersion() + "/profiles", {}, this.renderResults)
		
	},
	renderResults: function(results){
		console.log(results)
		var tpl
		$.each(results.data, function(index, item){
			tpl = _.template(resultTpl, {result: item})
			$("div.tab-content").append(tpl)
		})
	},
	setAges: function(){
		for (var i = 18; i < 100; i++) this.ages[i-18] = (99 - i) + 18
	},
	setLanguages: function(callback){
		api.get(api.getApiVersion() + "/languages", {}, callback)
	}
  });
  return new mainHomeView;
});
