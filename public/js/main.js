// Sets the require.js configuration for your application.
requirejs.config({

	urlArgs: "nocache=" +  Date.now(),

	// 3rd party script alias names (Easier to type "jquery" than "libs/jquery-1.7.2.min")
	paths: {
		// Core Libraries
		"modernizr": "lib/modernizr",
		"jquery": "lib/jquery",
		"bootstrap": "lib/plugins/bootstrap",
		"underscore": "lib/lodash",
		"backbone": "lib/backbone",
		"handlebars": "lib/handlebars",
		// jQuery Plugins
		"jquery.Validate": "lib/plugins/jquery.validate",
		"jquery.Extensions": "lib/plugins/jq-extensions",
		// Bootstrap plugins
		"typeahead": "lib/plugins/bootstrap-typeahead-ajax",
		// Require plugins
		"async": "lib/plugins/async",
		"text": "lib/plugins/text",
		"tmpl": "lib/plugins/tmpl",
		// Custom core libs
		"templates": "../templates",
		"api": "core/api",
		"api2": "core/api2",
		"utils": "core/utils",
		"promise": "core/promise",
		"phrases": "core/phrases",
		"config": "core/config",
		"typeahead": "lib/plugins/bootstrap-typeahead-ajax",
		//"spinner": "lib/spin",
		//"jquery.spinner": "lib/plugins/spin.plugin",
		"async": "lib/plugins/async",
		"jquery.Jcrop": "lib/plugins/jquery.Jcrop",
		"jquery.Datepicker": "lib/plugins/jquery-ui-1.10.2.custom.min",
		//"jquery.Datepicker": "lib/plugins/jquery-ui-1.9.1.custom.min",
		"text": "lib/plugins/text",
		"tmpl": "lib/plugins/tmpl",
		"handlebars": "lib/handlebars",
		"foundation": 'lib/plugins/foundation',
		"foundationClearing": 'lib/plugins/foundation.clearing'
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
		"jquery.Jcrop": ["jquery"],
		"jquery.Datepicker": ["jquery"],
		"jquery.Validate": ["jquery"],
		"jquery.Extensions": ["jquery.Validate"],
		"foundation":{
			"deps": ["jquery"],
			"exports": "Foundation"
		},
		"foundationClearing":{
			"deps": ["jquery", "foundation"]
		}

	} // end Shim Configuration
});

// Include Desktop Specific JavaScript files here (or inside of your Desktop router)
requirejs(['modernizr', 'jquery', 'backbone', 'router', 'promise', 'bootstrap', 'typeahead', 'jquery.Extensions', 'async'], function(Modernizr, $, Backbone, Router, Promise) {
	Promise.debug = true;
	// Instantiates a new Router
	window.router = new Router();
});
