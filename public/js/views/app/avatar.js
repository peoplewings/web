define([
  "jquery",
  "backbone",
  'text!templates/app/avatar.html',
], function($, Backbone, avatarTpl){
	
  var appHeader = Backbone.View.extend({
	
	initialize: function(){
	},
	render: function(url){
	  var tpl = _.template( avatarTpl, { avatarUrl: url });
      $('#main > .row').append(tpl);

    }
  });

  return new appHeader;
});