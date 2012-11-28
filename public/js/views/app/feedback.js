define([
  "jquery",
  "backbone",
  "api",
  "utils",
  'text!templates/lib/modal.html',
  'text!templates/app/feedback.html',
  'models/Profile',
], function($, Backbone, api, utils, modalTpl, contentTpl, UserProfile){

  var feedbackView = Backbone.View.extend({
	initialize: function(){
		this.model = new UserProfile({id:"me"})
		this.model.fetch()
	},
    render: function(){
		this.el = "#generic-modal"
		var content = _.template(contentTpl, { avatar: "https://secure.gravatar.com/avatar/111da10f3992b434634c0365a71667bc?d=https%3A%2F%2Fdwz7u9t8u8usb.cloudfront.net%2Fm%2F2219cd120e6a%2Fimg%2Fdefault_avatar%2F32%2Fuser_blue.png&s=48"})
		var tpl = _.template(modalTpl, { modalHeader: "New suggestion", acceptBtn: "Send"})
		$("body section:last").append(tpl)
		$(this.el + " div.modal-body").html(content)
		$(this.el).modal('show') 
    },
	close: function(){

	}
  });

  return new feedbackView;
});