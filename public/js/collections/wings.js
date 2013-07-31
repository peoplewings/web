define(function(require) {
	'use strict';

	var Backbone = require('backbone');
	var api = require('api');
	var Wing = require('models/wing');

	return Backbone.Collection.extend({
		model: Wing,
		urlRoot: api.getApiVersion() + '/wings/',

		initialize: function(models, options) {
			this.author = options.author;
		},

		url: function() {
			var author = this.author;
			return this.urlRoot + (author ? '?author=' + author : '');
		},

		parse: function(response) {
			return response.data;
		}
	});
});
