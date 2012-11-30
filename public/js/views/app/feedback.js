define([
  "jquery",
  "backbone",
  "api",
  "utils",
  'text!templates/lib/modal.html',
  'text!templates/lib/alert.html',
  'text!templates/app/feedback.html',
  'models/User',
], function($, Backbone, api, utils, modalTpl, alertTpl, contentTpl, UserModel){

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
		$(this.el + " *").show()
		$(this.el).modal('show')
		this.bindings()
    },
	bindings: function(){
		var scope = this
		$("#generic-modal-btn").bind("click", this.saveFeedback(this))
		$("#feedback-form").validate()
		$(this.el).on('hidden', function () {
			scope.close()
		})
	},
	saveFeedback: function(scope){
		return function(evt){
			var data = utils.serializeForm("feedback-form")
			if ($("#feedback-form").valid()) {
				console.log(data)
				api.post(api.getApiVersion() + "/feedback", data, function(response){
					var tpl
					if (response.status === true){
						tpl = _.template(alertTpl, {extraClass: 'alert-success', heading: response.msg})
					} else{
						tpl = _.template(alertTpl, {extraClass: 'alert-error', heading: response.msg})
					}
					$(scope.el + " div.modal-footer").hide()
					$(scope.el + " div.modal-body").html(tpl).delay(800).fadeOut(300)
					$(scope.el).modal('hide').delay(900)
				})
			}
		}
	},
	close: function(){
		this.remove()
		$(this.el).remove()
		this.unbind()
	},
  });

  return new feedbackView;
});