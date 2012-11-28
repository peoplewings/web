define([
  "jquery",
  "backbone",
  "api",
  "utils",
  "views/home/main",
  "views/app/header",
  "views/app/feedback",
], function($, Backbone, api, utils, mainView, appHeader, feedView){
	
  var homeView = Backbone.View.extend({
	initialize: function(){
		console.log("Im here")
	},
    render: function(){
		mainView.render()
		feedView.render()
    }
  });

  return new homeView;
});