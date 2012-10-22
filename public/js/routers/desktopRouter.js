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
    "views/app/header",
    "views/app/profile",
    "models/User",
], function($, Backbone, utils, api, headerView, homeView, registerView, activateView, loginView, passwordView, appHomeView, logoutView, settingsView, appHeaderView, ProfileView, UserModel){

    var Router = Backbone.Router.extend({
        // All of your Backbone Routes (add more)
        routes: {
        // When there is no hash bang on the url, the home method is called
			"register": "register",
			"login": "login",
	  		"activate/:id": "activate",
		  	"forgot": "forgotPassword",
			"forgot/:id": "forgotPassword",
		//Logged User patterns
			 "logout": "logout",
			 "settings":"settings",
			 "profile":"profile",
			 "foo":"foo",
		//Default action
			"*actions": "defaultAction",
        },
		//Anonymous User hashs
		foo: function(){
			console.log("I'm foo function")
		},
        register: function(){
			registerView.render();
		},
		login: function(){
			console.log('loginAction')
			loginView.render();
		},
		activate: function(id){
			activateView.render(id)
		},
		forgotPassword: function(id){
		  	passwordView.render(id)
    	},
		//Logged User hashs
		logout: function(){
			logoutView.logout()
		},
		settings: function(){
			settingsView.render()
		},
		profile: function(){
			if (!this.profileView){
				this.profileView = new ProfileView()
			} else this.profileView.render()
		},
		//Common hashs
		defaultAction: function(actions){
			console.log('desktopRouter: defaultAction')
			if (!api.userIsLoggedIn()) {
				console.log('not logged')
				homeView.render();
			}else {
				console.log('logged')
				appHomeView.render()
			}
			/*if (api.userIsLoggedIn()){
				var user = new UserModel({id:"me"})
				//console.log()
				if (user.firstName === undefined){
				user.fetch({
						headers: { "X-Auth-Token": api.getAuthToken() }, 
						success: function(){ 
							appHeaderView.render()
							appHomeView.render()
						},
						error: function() { console.log(arguments); }
				 	});
				}else {
					appHomeView.render({model:user})
				}
		  	} else{
				headerView.render();
				homeView.render();
			}*/
    	},
		initialize: function(){
			console.log('desktopRouter: initialize')
            // Tells Backbone to start watching for hashchange events
            Backbone.history.start();
			if (api.userIsLoggedIn()){
				var user = new UserModel({id:"me"})
				//console.log()
				if (user.firstName === undefined){
				user.fetch({
						headers: { "X-Auth-Token": api.getAuthToken() }, 
						success: function(){ 
							appHeaderView.render()
							//appHomeView.render()
						},
						error: function() { console.log(arguments); }
				 	});
				}else {
					appHomeView.render({model:user})
				}
		  	} else{
				headerView.render();
				//homeView.render();
			}
			/*if (!api.userIsLoggedIn()) {
				console.log('not logged')
				headerView.render();
			}else {
				console.log('logged')
				appHeaderView.render()
			}*/
        }
    });

    // Returns the Router class
    return Router;

});