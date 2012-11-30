define([
  'jquery',
  'backbone',
  'utils',
  'api',
  'text!templates/home/search_result.html',
], function($, Backbone, utils, api, resultsTpl){

  var resultsView = Backbone.View.extend({
	//el: "#search-results",
	events: {
		"click button.fake-btn": "alertLog",
		"click a.nextPage": "nextPage",
		"click a.previousPage": "previousPage"
	},
	initialize: function(options){
		this.targetEl = options.target
		this.logged = options.logged
		this.query = options.query
		this.blurrStyle = (this.logged === false) ? 'style="color: transparent;text-shadow: 0 0 5px rgba(0,0,0,0.5)"' : ""
	},
    render: function(results){
		var tpl = _.template(resultsTpl, { blurrStyle: this.blurrStyle, results: results.profiles, startResult: results.startResult, endResult: results.endResult, totalCount: results.count })
		this.$el.html(tpl);
		$(this.targetEl).after(this.$el)
    },
	nextPage: function(evt){
		//console.log("next", this.query.page)
		var scope = this
		this.query.page++
		api.get(api.getApiVersion() + "/profiles", this.query, function(results){
			scope.render(results.data)
		})
		return false
	},
	previousPage: function(){
		//console.log("previous", this.query.page)
		var scope = this
		this.query.page--
		api.get(api.getApiVersion() + "/profiles", this.query, function(results){
			scope.render(results.data)
		})
		return false
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