define(function(require){

	var $ = require("jquery");
	var Promise = require("promise");
	var Backbone = require("backbone");
	var api = require("api2");
	var profileTpl = require("tmpl!templates/app/user-profile.html");
	
	
	var userProfile = Backbone.View.extend({
		el: "#main",
		
		initialize: function(userId){
			this.userId = userId
			this.refresh = this.refresh.bind(this)
		},
		
		render: function(userId){
			if (userId) this.userId = userId
			Promise.parallel(
				api.get('/api/v1/profiles/' + this.userId + '/preview'),
				api.get('/api/v1/profiles/' + this.userId + '/accomodations/preview')
			).spread(function(profile, wings) {
				profile.data.wings = wings.data
				return profile.data
			}).then(this.refresh);

		},
		
		refresh: function(data){
			console.log(data)
			$(this.el).html(profileTpl(data))
		},
		
		destroy: function(){
			this.remove()
			this.unbind()
		}
	});
	
	return userProfile;
});
