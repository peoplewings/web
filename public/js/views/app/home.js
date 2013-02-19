define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var utils = require('utils');
	var mainView = require('views/home/main');
	var feedView = require('views/app/feedback');

	var homeView = Backbone.View.extend({
		initialize: function(){
			this.eventBinds()
		},
		eventBinds: function(){
			$("#feedback-btn-submit").live("click", this.showFeedback(this))
		},
		render: function(){
			mainView.render()
			$("#feedback-btn").show()
		},
		showFeedback: function(scope){
			return function(evt){
				evt.preventDefault()
				if (!scope.feedbackView)
					feedView.render()
				else
					scope.feedbackView.render()
			}
		}
	});

	return new homeView;
});
