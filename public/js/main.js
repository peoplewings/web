// Sets the require.js configuration for your application.
require.config({

	// 3rd party script alias names (Easier to type "jquery" than "libs/jquery-1.7.2.min")
	paths: {
		// Core Libraries
		"modernizr": "lib/modernizr",
		"jquery": "lib/jquery",
		"bootstrap": "lib/plugins/bootstrap",
		"underscore": "lib/lodash",
		"backbone": "lib/backbone",
		//"backbone.validateAll": "lib/plugins/Backbone.validateAll",
		"backbone.ModelBinder": "lib/Backbone.ModelBinder",
		"jquery.Validate": "lib/plugins/jquery.validate",
		"jquery.Extensions": "lib/plugins/jq-extensions",
		"templates": "../templates",
		"api": "core/api",
		"api2": "core/api2",
		"utils": "core/utils",
		"promise": "core/promise",
		"typeahead": "lib/plugins/bootstrap-typeahead-ajax",
		//"spinner": "lib/spin",
		//"jquery.spinner": "lib/plugins/spin.plugin",
		"async": "lib/plugins/async",
		"jquery.Jcrop": "lib/plugins/jquery.Jcrop",
		"jquery.Datepicker": "lib/plugins/jquery-ui-1.9.1.custom.min",
		"text": "lib/plugins/text",
		"tmpl": "lib/plugins/tmpl",
		"handlebars": "lib/handlebars"
	},

	// Sets the configuration for your third party scripts that are not AMD compatible
	shim: {
		"handlebars": {
			"exports": "Handlebars"
		},
		"api": {
			"exports": "API"
		},
		"utils": {
			"exports": "Utils"
		},
		// Twitter Bootstrap jQuery plugins
		"bootstrap": ["jquery"],
		"typeahead": ["bootstrap"],
		"backbone": {
			"deps": ["underscore", "jquery"],
			"exports": "Backbone" //attaches "Backbone" to the window object
		},
		// Backbone.validateAll depends on Backbone.
		"backbone.validateAll": ["backbone"],
		// Backbone.ModelBinder depends on Backbone.
		"backbone.ModelBinder": ["backbone"],
		
		"jquery.Validate": ["jquery"],
		"jquery.Jcrop": ["jquery"],
		"jquery.Datepicker": ["jquery"],
		"jquery.Extensions": ["jquery.Validate"],
		/*
		"jquery.spinner": {
						deps: ['jquery', 'spinner'],
				},
		 */

	} // end Shim Configuration
});

// Include Desktop Specific JavaScript files here (or inside of your Desktop router)
require(['modernizr', 'jquery', 'backbone', 'router', 'bootstrap', 'typeahead', 'jquery.Extensions', 'async'], function(Modernizr, $, Backbone, Router) {
	// Instantiates a new Router
	this.router = new Router();
});
