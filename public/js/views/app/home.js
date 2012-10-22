define([
  "jquery",
  "backbone",
  "api",
  "utils",
  "views/app/header",
  "views/home/main",
], function($, Backbone, api, utils, appHeader, mainView){
	
  var homeView = Backbone.View.extend({
	initialize: function(){
	},
    render: function(){
		mainView.render()
    }
  });

  

  return new homeView;
});