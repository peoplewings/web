define([
  "jquery",
  "backbone",
  "api",
  "utils",
  "views/home/main",
  "views/app/header",
], function($, Backbone, api, utils, mainView, appHeader){

  var homeView = Backbone.View.extend({
	initialize: function(){
		this.eventBinds()
	},
	eventBinds: function(){
		$("#feedback-btn-submit").live("click", this.showFeedback(this))
	},
    render: function(){
		mainView.render()
		$("#feedback-btn").show()
    },
	showFeedback: function(scope){
		return function(evt){
			evt.preventDefault()
			if (!scope.feedbackView){
				require(["views/app/feedback"], function(feedView){
						feedView.render()
				})
			} else scope.feedbackView.render()
		}
	}
  });

  return new homeView;
});