define([
  "jquery",
  "backbone",
  'text!templates/app/header.html',
  "api",
  "models/User",
], function($, Backbone, headerTpl, api, UserModel){
	
  var appHeader = Backbone.View.extend({
	
	initialize: function(){
		this.model = new UserModel({id: api.getUserId()})
	},
	render: function(){
	  var tpl = _.template( headerTpl, { firstName: this.model.get('firstName'), lastName: this.model.get('lastName'), avatar: this.model.get('avatar') });
      $('header').html(tpl);
    },
	destroy: function(){
  		this.remove();
  		this.unbind();
	}
  });

  return new appHeader;
});