define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var api = require('api2');
	var utils = require('utils');
	var alerts = require('views/lib/alerts');
	var contentTpl = require('tmpl!templates/app/feedback.html');
	var UserModel = require('models/Account');

	$(window).scroll(function() {
		if($(window).scrollTop() + $(window).height() > $(document).height() - 1) {
			$('#feedback-btn-submit').css('bottom', 54);
		} else
			$('#feedback-btn-submit').css('bottom', 0);
	});

	var FeedbackView = Backbone.View.extend({

		validation: {
			rules: {
				text: {
					required: true,
					maxlength: 1000,
				},
			}
		},

		initialize: function(userId){
			this.model = new UserModel({id: userId});
		},

		render: function(){
			var content = contentTpl({ avatar: this.model.get("avatar")});
			this.modal = utils.showModal({
				header: "New suggestion",
				accept: "Send",
				loadingText: 'Sending...',
				content: content,
				form: 'feedback-form'
			});
			this.modal.on('hidden', this.close.bind(this));
			$("#feedback-form").on('submit', this.submitFeedback.bind(this));
			$("#feedback-form").validate(this.validation);
		},

		submitFeedback: function(evt){
			evt.preventDefault();
			var self = this;
			var data = utils.serializeForm("feedback-form");

			if (this.modal.find("#feedback-form").valid()) {
				this.modal.find(".accept-modal-btn").button('loading');

				api.post(api.getApiVersion() + "/feedback", data)
				.then(function(response){
					self.modal.find(".accept-modal-btn").button('reset');
					self.modal.modal('hide');

					if (response.status === true)
						alerts.success('Feedback received, thanks for your help.');
				});
			}
		},

		close: function() {
			this.remove();
			this.unbind();
		},
	});

return FeedbackView;
});
