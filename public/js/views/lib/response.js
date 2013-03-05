define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var template = require('text!templates/lib/response.html');

	var ResponseView = Backbone.View.extend({
		render: function(data){
			var html = _.template(template, data);
			$(this.el).html(html);
		}
	});

	return new ResponseView;
});
