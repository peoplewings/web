define([
  'jquery',
  'backbone',
  'utils',
  'api',
  'text!templates/home/search_result.html',
], function($, Backbone, utils, api, resultsTpl){

  var resultsView = Backbone.View.extend({
	events: {
		"click button.fake-btn": "alertLog",
		"click a.nextPage": "nextPage",
		"click a.previousPage": "previousPage"
	},
	initialize: function(options){
		console.log("logged", options.logged)
		this.targetEl = options.target
		this.blurrStyle = (options.logged === false) ? 'style="color: transparent;text-shadow: 0 0 5px rgba(0,0,0,0.5)"' : ""
	},
    render: function(results){
		var tpl = _.template(resultsTpl, { blurrStyle: this.blurrStyle, results: results.profiles, startResult: "1", endResult: results.profiles.length, totalCount: results.count })
		$(this.el).html(tpl);
		$(this.targetEl).after(this.$el)
    },
	nextPage: function(){
		console.log("next")
	},
	previousPage: function(){
		console.log("previous")
	},
	close: function(){
		this.remove()
		this.unbind()
	},
	alertLog: function(){
		alert("You need to be logged in to use this function")
	}
  });
  return resultsView;
});