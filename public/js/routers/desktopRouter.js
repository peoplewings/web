define([
	"jquery",
	"backbone",
	"api",
	//landing page views (AnonymousUser)
	"views/home/header",
    "views/home/main",
	//app views (LoggedUser)
    "views/app/home",
    "models/User",
], function($, Backbone, api, headerView, homeView, appHomeView, UserModel){

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
			 "wings": "wings",
		//Default action
			"*actions": "defaultAction",
        },
		//Anonymous User hashs
        register: function(){
			if (api.userIsLoggedIn()){
				this.defaultAction()
			} else {
				require(["views/home/register"], function(registerView){
					registerView.render();
				})
			}
		},
		login: function(){
			if (api.userIsLoggedIn()){
				this.defaultAction()
			} else {
				require(["views/home/login"], function(loginView){
					loginView.render();
				})
			}
		},
		activate: function(id){
			require(["views/home/activate"], function(activateView){
				activateView.render(id)
			})
		},
		forgotPassword: function(id){
			require(["views/home/password"], function(passwordView){
				passwordView.render(id)
			})
    	},
		//Logged User hashs
		logout: function(){
			require(["views/app/logout"], function(logoutView){
				logoutView.logout()
			})
		},
		settings: function(){
			if (api.userIsLoggedIn()){
				require(["views/app/settings"], function(settingsView){
					settingsView.render()
				})
			} else this.login()
			
		},
		profile: function(){
			var scope = this
			if (!this.profileView){
				require(["views/app/profile"], function(profileView){
					scope.profileView = new profileView()
				})
			} else this.profileView.render()
		},
		wings: function(){
			var scope = this
			if (!this.wingsView){
				require(["views/app/wings"], function(wingsView){
						wingsView.render()
					})
			} else this.wingsView.render() 
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
    	},
		initialize: function(){
			console.log('desktopRouter: initialize')
            // Tells Backbone to start watching for hashchange events
            Backbone.history.start();
			if (api.userIsLoggedIn()){
				var user = new UserModel({id:"me"})
				if (user.firstName === undefined){
					user.fetch({
						headers: { "X-Auth-Token": api.getAuthToken() }, 
						success: function(){
							require(["views/app/header"], function(header){ header.render() })
						},
						error: function() { console.log(arguments); }
				 	});
				}else {
					appHomeView.render({model:user})
				}
		  	}else{
				headerView.render();
			}
        }
    });

    // Returns the Router class
    return Router;

});