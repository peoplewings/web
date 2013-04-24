define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var api = require('api2');
	var mainView = require('views/home/main');
	var FeedView = require('views/app/feedback');

	var HomeView = Backbone.View.extend({
		initialize: function(){
			if (api.userIsLoggedIn())
				this.eventBinds();
		},
		eventBinds: function(){
			$("#feedback-btn-submit").live("click", this.showFeedback.bind(this));
		},
		render: function(){
			mainView.render();
			$("#feedback-btn").show();
		},
		showFeedback: function(evt){
			evt.preventDefault();
			if (!this.feedbackView)
				this.feedbackView = new FeedView(api.getUserId());

			this.feedbackView.render();
		}
	});

	return new HomeView;
});
