define([
  "jquery",
  "backbone",
  'text!templates/home/header.html'
], function($, Backbone, headerTpl){
	
  var landingHeader = Backbone.View.extend({
    //el: "header",
    render: function(){
      $(this.el).html(headerTpl);
    },
	destroy: function(){
  		this.remove();
  		this.unbind();
	}
  });

  return new landingHeader;
});