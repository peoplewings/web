define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var balloonTpl = require('tmpl!templates/lib/balloon.html');

	var BalloonView = Backbone.View.extend({

		el: '#main',

		render: function(options){
			$(this.el).html(balloonTpl({options: options}));
		}
	});

	return new BalloonView;
});
