define([
  'jquery',
  'backbone',
  'utils',
  'api',
  'text!templates/home/search_result.html',
  'text!templates/home/pagination.html',
], function($, Backbone, utils, api, resultsTpl, pageTpl){

  var resultsView = Backbone.View.extend({
	events: {
		"click button.fake-btn": "alertLog"
	},
	initialize: function(options){
		console.log("logged", options.logged)
		this.targetEl = options.target
		this.blurrStyle = (options.logged === false) ? 'style="color: transparent;text-shadow: 0 0 5px rgba(0,0,0,0.5)"' : ""
	},
    render: function(results){
		console.log(results)
		$(".pagination").show()
		this.renderPagination(results.profiles.length, results.count)
		this.renderResults(results.profiles)
    },
	renderPagination: function(pageCount, totalCount){
		var tpl = _.template(pageTpl, {startResult: "1", endResult: pageCount, totalCount: totalCount })
		$('div.tab-content').after(tpl)
		$('div.tab-content').after(tpl)
	},
	renderResults: function(items){
		var scope = this
		var tpl = _.template(resultsTpl, { blurrStyle: this.blurrStyle, results: items })
		$(this.el).html(tpl);
		$(".pager:last").before(this.$el)
	},
	alertLog: function(){
		alert("You need to be logged in to use this function")
	}
  });
  return resultsView;
});