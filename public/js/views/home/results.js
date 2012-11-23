define([
  'jquery',
  'backbone',
  'utils',
  'api',
  'text!templates/home/accomodation.html',
  'text!templates/home/search_result.html',
], function($, Backbone, utils, api, accomodationTpl, resultTpl){

  var resultsView = Backbone.View.extend({
    el: "#main",
	events: {
		"click button.fake-btn": "alertLog"
	},
	initialize: function(logged){
		console.log("logged", logged)
		this.blurrStyle = (logged === false) ? 'style="color: transparent;text-shadow: 0 0 5px rgba(0,0,0,0.5)"' : ""
		console.log(this.blurrStyle)
	},
    render: function(results){
		console.log(results)
		//$(".pagination").show()
		this.renderItems(results.profiles)
    },
	renderItems: function(items){
		var tpl
		var scope = this
		$.each(items, function(index, item){
			tpl = _.template(resultTpl, {
					blurrStyle: scope.blurrStyle, 
					result: item, 
					currentCity: item.current.name, 
					currentCountry: item.current.country, 
					languages: item.languages
				})
			$(".pagination:last").before(tpl)
			})

	},
	alertLog: function(){
		alert("You need to be logged in to use this function")
	}
  });
  return resultsView;
});