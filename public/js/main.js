// Sets the require.js configuration for your application.
requirejs.config({

	urlArgs: 'nocache=' +  Date.now(),

	// 3rd party script alias names (Easier to type 'jquery' than 'libs/jquery-1.7.2.min')
	paths: {
		// Core Libraries
		'modernizr': 'lib/modernizr',
		'jquery': 'lib/jquery',
		'bootstrap': 'lib/plugins/bootstrap',
		'underscore': 'lib/lodash',
		'backbone': 'lib/backbone',
		'handlebars': 'lib/handlebars',

		// jQuery Plugins
		'jquery.Validate': 'lib/plugins/jquery.validate',
		'jquery.Extensions': 'lib/plugins/jq-extensions',
		'jquery.Jcrop': 'lib/plugins/jquery.Jcrop',
		'jquery.Datepicker': 'lib/plugins/jquery-ui-1.10.2.custom.min',

		// Bootstrap plugins
		'typeahead': 'lib/plugins/bootstrap-typeahead-ajax',

		// Require plugins
		'async': 'lib/plugins/async',
		'text': 'lib/plugins/text',
		'tmpl': 'lib/plugins/tmpl',

		// Custom core libs
		'templates': '../templates',
		'api': 'core/api',
		'utils': 'core/utils',
		'promise': 'core/promise',
		'phrases': 'core/phrases',
		'config': 'core/config',

		// Foundation
		'foundation': 'lib/plugins/foundation',
		'foundationClearing': 'lib/plugins/foundation.clearing'
	},

	// Sets the configuration for your third party scripts that are not AMD compatible
	shim: {
		'handlebars': { 'exports': 'Handlebars' },
		'api': { 'exports': 'API' },
		'utils': { 'exports': 'Utils' },

		// Twitter Bootstrap jQuery plugins
		'bootstrap': ['jquery'],
		'typeahead': ['bootstrap'],
		'backbone': {
			'deps': ['underscore', 'jquery'],
			'exports': 'Backbone' //attaches 'Backbone' to the window object
		},

		'jquery.Jcrop': ['jquery'],
		'jquery.Datepicker': ['jquery'],
		'jquery.Validate': ['jquery'],
		'jquery.Extensions': ['jquery.Validate'],

		'foundation':{
			'deps': ['jquery'],
			'exports': 'Foundation'
		},
		'foundationClearing':{
			'deps': ['jquery', 'foundation']
		}

	} // end Shim Configuration
});

// Include Desktop Specific JavaScript files here (or inside of your Desktop router)
requirejs([
	'backbone',
	'api',
	'router',
	'promise',
	'modernizr',
	'jquery',
	'bootstrap',
	'typeahead',
	'jquery.Extensions',
	'async'
], function(
	Backbone,
	api,
	Router,
	Promise
) {

	Promise.debug = true;
	// Instantiates a new Router

	var methodMap = {
		'create': 'post',
		'read': 'get',
		'update': 'put',
		'delete': 'delete',
	};

	function get(object, prop) {
		if (!object || !object[prop]) return null;
		return _.isFunction(object[prop]) ? object[prop]() : object[prop];
	}

	Backbone.sync = function(type, model, options) {
		var method = methodMap[type];
		var request = api[method];
		var sendData = method === 'post' || method === 'put';
		var url = get(model, 'url');
		var future = sendData ? request(url, model.toJSON()) : request(url);
		future.then(options.success, options.error);
		return future.then(function() { return model });
	};

	window.router = new Router();
});
