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
	languages: [],
	events: {
		"submit form#accomodation-search-form": "submitSearch",
	},
	initialize: function(){
		this.setAges()
		this.setLanguages()
	},
    render: function(){
      $(this.el).html(mainHomeTpl);
	  var tpl = _.template(accomodationTpl, {ages: this.ages, languages: this.languages})
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
    },
	submitSearch: function(e){
		e.preventDefault()
		//console.log('Submit Search: #' + e.target.id)
		var data = utils.serializeForm(e.target.id)
		//console.log(data)
		for (attr in data) if (data[attr] === "") delete data[attr]
		alert("You are not sending fields!")
		api.get("/profiles", {}, this.renderResults)
		
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
		for (var i = 18; i < 100; i++) this.ages[i-18] = i
	},
	setLanguages: function(){
		var sc = this
		this.languages = ["spanish", "english", "french", "german"]
		/*api.get("/languages", {}, function(response){
			sc.languages = response.data
		})*/
	}
  });
  return new mainHomeView;
});
