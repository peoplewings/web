define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var api = require('api2');
	var utils = require('utils');
	var alerts = require('views/lib/alerts');
	var contentTpl = require('tmpl!templates/app/feedback.html');
	var UserModel = require('models/Account');

	var FeedbackView = Backbone.View.extend({

		initialize: function(){
			if (api.userIsLoggedIn())
				this.model = new UserModel({id: api.getUserId()});
		},

		render: function(){
			var content = contentTpl({ avatar: this.model.get("avatar")});
			this.modal = utils.showModal({
				header: "New suggestion",
				accept: "Send",
				content: content,
				callback: this.saveFeedback.bind(this)
			});
			this.modal.on('hidden', this.close.bind(this));
			$("#feedback-form").validate();
		},

		saveFeedback: function(){
			var self = this;
			var data = utils.serializeForm("feedback-form");
			this.modal.find(".generic-modal-btn").button('loading');

			if (this.modal.find("#feedback-form").valid()) {
				api.post(api.getApiVersion() + "/feedback", data, function(response){
					self.modal.find(".generic-modal-btn").button('reset');

					if (response.status === true)
						alerts.success('Feedback received, thanks for your help.');
					else
						alerts.error(response.msg);

					self.modal.modal('hide');
				});
			}
		},

		close: function() {
			this.remove();
			this.unbind();
		},
	});

	return new FeedbackView;
});
