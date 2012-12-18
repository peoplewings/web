define(function(require){

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	//var notificationsTpl = require("tmpl!templates/app/notifications.html");
	//var itemTpl = require("tmpl!templates/app/notification.html");
	var userProfile = Backbone.View.extend({
		el: "#main",
		initialize: function(){
			
		},
		render: function(userId){
			alert('Here it is the profile of User: ' + userId)
		},
		destroy: function(){
			this.remove()
			this.unbind()
		}
	});
	
	return new userProfile;
});
