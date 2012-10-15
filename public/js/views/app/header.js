define([
  "jquery",
  "backbone",
  'text!templates/app/header.html'
], function($, Backbone, headerTpl){
	
  var appHeader = Backbone.View.extend({
    render: function(firstName, lastName){
	var tpl = _.template( headerTpl, { firstName: firstName, lastName: lastName });
      $(this.el).html(tpl);
    }
  });

  return new appHeader;
});