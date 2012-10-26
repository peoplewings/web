define([
	"jquery",
	"backbone",
	"api",
	//landing page views (AnonymousUser)
	"views/home/header",
    "views/home/main",
    "views/home/activate",
    "views/home/password",
	//app views (LoggedUser)
    "views/app/home",
    "views/app/header",
    "models/User",
], function($, Backbone, api, headerView, homeView, activateView, passwordView, appHomeView, appHeaderView, UserModel){

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
			/*api.post('/forgot/', { email: "foo@foo.com"}, function(response){
				console.log(response)
			})
			api.get('/profiles/', {}, function(response){
				console.log(response)
			})*/
		},
        register: function(){
			require(["views/home/register"], function(registerView){
				registerView.render();
			})
		},
		login: function(){
			require(["views/home/login"], function(loginView){
				loginView.render();
			})
		},
		activate: function(id){
			activateView.render(id)
		},
		forgotPassword: function(id){
		  	passwordView.render(id)
    	},
		//Logged User hashs
		logout: function(){
			require(["views/app/logout"], function(logoutView){
				logoutView.logout()
			})
		},
		settings: function(){
			require(["views/app/settings"], function(settingsView){
				settingsView.render()
			})
		},
		profile: function(){
			var scope = this
			if (!this.profileView){
				require(["views/app/profile"], function(profileView){
					scope.profileView = new profileView()
				})
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
							appHeaderView.render()
						},
						error: function() { console.log(arguments); }
				 	});
				}else {
					appHomeView.render({model:user})
				}
		  	} else{
				headerView.render();
			}
        }
    });

    // Returns the Router class
    return Router;

});