define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var api = require('api');
	var mainView = require('views/home/main');
	var FeedView = require('views/app/feedback');

	var HomeView = Backbone.View.extend({
		el: document.body,

		events: {
			'click #feedback-btn-submit': 'showFeedback',
		},
		render: function(){
			mainView.render();
			$('#feedback-btn').show();
		},
		showFeedback: function(evt){
			if (!this.feedbackView)
				this.feedbackView = new FeedView(api.getUserId());

			this.feedbackView.render();
		}
	});

	return new HomeView;
});
