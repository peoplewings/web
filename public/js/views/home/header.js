define([
  "jquery",
  "backbone",
  'text!templates/home/header.html'
], function($, Backbone, headerTpl){
	
  var landingHeader = Backbone.View.extend({
    render: function(){
      $('header').html(headerTpl);
    },
	destroy: function(){
  		this.remove();
  		this.unbind();
	}
  });

  return new landingHeader;
});