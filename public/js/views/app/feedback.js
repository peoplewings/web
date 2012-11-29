define([
  "jquery",
  "backbone",
  "api",
  "utils",
  'text!templates/lib/modal.html',
  'text!templates/app/feedback.html',
  'models/User',
], function($, Backbone, api, utils, modalTpl, contentTpl, UserModel){

  var feedbackView = Backbone.View.extend({
	events: {
		"click button#generic-modal-btn": "saveFeedback"
	},
	initialize: function(){
		this.model = new UserModel({id: api.getUserId()})
		this.model.fetch()
		console.log(this.model.attributes)
	},
    render: function(){
		this.el = "#generic-modal"
		var content = _.template(contentTpl, { avatar: this.model.get("avatar")})
		var tpl = _.template(modalTpl, { modalHeader: "New suggestion", acceptBtn: "Send"})
		$("body section:last").append(tpl)
		$(this.el + " div.modal-body").html(content)
		$(this.el).modal('show')
		//$("#generic-modal-btn").live("click", this.saveFeedback())
    },
	saveFeedback: function(evt){
		console.log("SAVE")
	}
  });

  return new feedbackView;
});