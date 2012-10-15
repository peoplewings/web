define([
	"jquery",
	"backbone",
	"utils",
	"api",
	//landing page views (AnonymousUser)
	"views/home/header",
    "views/home/main",
    "views/home/register",
    "views/home/activate",
    "views/home/login",
    "views/home/password",
	//app views (LoggedUser)
    "views/app/home",
    "views/app/logout",
    "views/app/settings",
], function($, Backbone, utils, api, headerView, homeView, registerView, activateView, loginView, passwordView, appHomeView, logoutView, settingsView){

    var Router = Backbone.Router.extend({
        // All of your Backbone Routes (add more)
        routes: {
        // When there is no hash bang on the url, the home method is called
			"login": "login",
	  		"register": "register",
	  		"activate/:id": "activate",
		  	"forgot": "forgotPassword",
			"forgot/:id": "forgotPassword",
		//Logged User patterns
			 "logout": "logout",
			 "settings":"settings",
		//Default action
			"*actions": "defaultAction",
        },

        register: function(){
			registerView.render();
		},
		login: function(){
			loginView.render();
		},
		logout: function(){
			logoutView.logout()
		},
		settings: function(){
			settingsView.render()
		},
		activate: function(id){
			activateView.render(id)
		},
		forgotPassword: function(id){
		  	passwordView.render(id)
    	},
		defaultAction: function(actions){
			console.log('desktopRouter: defaultAction')
			if (api.userIsLoggedIn()){
				appHomeView.render()
		  	} else{
				headerView.render();
				$('header').html(headerView.el)
				homeView.render();
			}
    	},
		initialize: function(){
			console.log('desktopRouter: initialize')
            // Tells Backbone to start watching for hashchange events
            Backbone.history.start();
        }
    });

    // Returns the Router class
    return Router;

});