define([
  "jquery",
  "backbone",
  'text!templates/app/header.html',
  "models/User",
], function($, Backbone, headerTpl, UserModel){
	
  var appHeader = Backbone.View.extend({
	
	initialize: function(){
		this.model = new UserModel({id:"me"})
	},
	render: function(){
	  var tpl = _.template( headerTpl, { firstName: this.model.get('firstName'), lastName: this.model.get('lastName') });
      $('header').html(tpl);

    },
	destroy: function(){
  		this.remove();
  		this.unbind();
	}
  });

  return new appHeader;
});