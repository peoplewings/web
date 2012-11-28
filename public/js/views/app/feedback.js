define([
  "jquery",
  "backbone",
  "api",
  "utils",
], function($, Backbone, api, utils){
	
  var feedbackView = Backbone.View.extend({
	initialize: function(){

	},
    render: function(){
		$("#feedback-btn").show()
    },
	close: function(){
		$("#feedback-btn").hide()
	}
  });

  return new feedbackView;
});