// Sets the require.js configuration for your application.
require.config({	
  
  // 3rd party script alias names (Easier to type "jquery" than "libs/jquery-1.7.2.min")
  paths: {

      // Core Libraries
      "modernizr": "lib/libs/modernizr",
      "jquery": "lib/libs/jquery",
      "bootstrap": "lib/plugins/bootstrap",
      "underscore": "lib/libs/lodash",
      "backbone": "lib/libs/backbone",
      "backbone.validateAll": "lib/plugins/Backbone.validateAll",
      "backbone.ModelBinder": "lib/libs/Backbone.ModelBinder",
      "backbone.Singleton": "lib/libs/Backbone.Singleton",
      "jquery.Validate": "lib/plugins/jquery.validate",
	  "templates": "../templates",
	  "api": "lib/custom/api-lib",
	  "utils": "lib/custom/utils-lib",
	  //"spinner": "lib/libs/spin",
	  //"jquery.spinner": "lib/plugins/spin.plugin",
	  

  },

  // Sets the configuration for your third party scripts that are not AMD compatible
  shim: {

      // Twitter Bootstrap jQuery plugins
      "bootstrap": ["jquery"],

      "backbone": {
          "deps": ["underscore", "jquery"],
          "exports": "Backbone"  //attaches "Backbone" to the window object
      },

      // Backbone.validateAll depends on Backbone.
      "backbone.validateAll": ["backbone"],
	
	 // Backbone.ModelBinder depends on Backbone.
      "backbone.ModelBinder": ["backbone"],
	// Backbone.Singleton depends on Backbone
 	  "backbone.Singleton": ["backbone"],
	// jQuery Validation plugin
 	  "jquery.Validate": ["jquery"],
	/*
	  "jquery.spinner": {
            deps: ['jquery', 'spinner'],
        },
	*/
	
  } // end Shim Configuration
  
});

// Include Desktop Specific JavaScript files here (or inside of your Desktop router)
require(['modernizr','jquery','backbone','routers/desktopRouter','bootstrap','backbone.validateAll', 'backbone.ModelBinder', 'api', 'utils', "backbone.Singleton", 'jquery.Validate',], function(Modernizr, $, Backbone, Desktop) {

    // Instantiates a new Router
    this.router = new Desktop();
});