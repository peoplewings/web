define([
  "jquery",
  "backbone",
  "api",
  "tmpl!templates/app/notifications.html"
], function($, Backbone, api, notificationsTpl){
	
  var notificationsView = Backbone.View.extend({
	el: "#main",
	initialize: function(){
	},
	render: function(){
	  $(this.el).html(notificationsTpl)
    },
	destroy: function(){
  		this.remove();
  		this.unbind();
	}
  });

  return new notificationsView;
});