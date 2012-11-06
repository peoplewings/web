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
	},
    render: function(){
		mainView.render()
    }
  });

  

  return new homeView;
});