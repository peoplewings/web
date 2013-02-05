// Sets the require.js configuration for your application.
requirejs.config({

	// 3rd party script alias names (Easier to type "jquery" than "libs/jquery-1.7.2.min")
	paths: {
		// Core Libraries
		"modernizr": "../lib/modernizr",
		"jquery": "../lib/jquery",
		"bootstrap": "../lib/plugins/bootstrap",
		"underscore": "../lib/lodash",
		"backbone": "../lib/backbone",
		//"backbone.validateAll": "../lib/plugins/Backbone.validateAll",
		"backbone.ModelBinder": "../lib/Backbone.ModelBinder",
		"jquery.Validate": "../lib/plugins/jquery.validate",
		"templates": "../../templates",
		"api": "../core/api",
		"utils": "../core/utils",
		"promise": "../core/promise",
		"typeahead": "../lib/plugins/bootstrap-typeahead-ajax",
		//"spinner": "../lib/spin",
		//"jquery.spinner": "../lib/plugins/spin.plugin",
		"async": "../lib/plugins/async",
		"jquery.Jcrop": "../lib/plugins/jquery.Jcrop",
		"jquery.Datepicker": "../lib/plugins/jquery-ui-1.9.1.custom.min",
		"text": "../lib/plugins/text",

		"promise-tests": "core/promise.test",
	},

	// Sets the configuration for your third party scripts that are not AMD compatible
	shim: {
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
		// jQuery Validation plugin
		"jquery.Validate": ["jquery"],
		"jquery.Jcrop": ["jquery"],
		"jquery.Datepicker": ["jquery"],

		"promise-test": [ "promise" ],

		/*
		"jquery.spinner": {
			deps: ['jquery', 'spinner'],
		},
		*/

	} // end Shim Configuration
});

requirejs([
	'modernizr',
	'promise',

	'core/api.test.js',
	'core/promise.test.js',
], function(modernizr, promise) {
	window.Promise = promise;
	mocha.run();
})
