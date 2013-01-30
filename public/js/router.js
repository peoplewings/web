define([
	"jquery",
	"backbone",
	"api",
	"api2",
	//landing page views (AnonymousUser)
	//"views/home/header",
	"views/home/main",
	//app views (LoggedUser)
	"views/app/home",
	"models/Account",
], function($, Backbone, api, api2, homeView, appHomeView, UserModel){

	var Router = Backbone.Router.extend({
		routes: {
			"register": "register",
			"login": "login",
			"activate/:id": "activate",
			"forgot": "forgotPassword",
			"forgot/:id": "forgotPassword",
		//Logged User patterns
			 "logout": "logout",
			 "settings":"settings",
			 "profile":"profile",
			 "profile/preview":"previewProfile",
			 "wings": "wings",
			 "messages/:id": "showThread",
			 "messages/filter/:filters": "showNotifications",
			 "messages": "showNotifications",
			 "users/:id": "showUserProfile",
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
		previewProfile: function(){
			var scope = this
			if (!this.previewView){
				require(["views/app/preview"], function(previewView){
					scope.previewView = previewView
				})
			} else this.previewView.render()

		},
		showUserProfile: function(userId){
			var scope = this
			if (!this.userProfileView){
				require(["views/app/userProfile"], function(View){
					scope.userProfileView = new View(userId)
					scope.userProfileView.render()
				})
			} else
				this.userProfileView.render(userId)
		},
		wings: function(){
			var scope = this
			if (!this.wingsView){
				require(["views/app/wings"], function(wingsView){
						wingsView.render()
					})
			} else this.wingsView.render()
		},
		showNotifications: function(filters){
			var scope = this
			if (!this.notificationsView){
				require(["views/app/notifications"], function(notificationsView){
						notificationsView.render(JSON.parse(filters || '{}'));
					})
			} else this.notificationsView.render()
		},
		showThread: function(id) {
			var scope = this
			if (!this.threadView){
				require(["views/app/thread"], function(threadView){
					scope.threadView = threadView;
					threadView.render(id)
				});
			} else this.threadView.render(id)
		},
		defaultAction: function(actions){
			console.log('router.js: defaultAction()')
			if (api.userIsLoggedIn())
				appHomeView.render();
			else
				homeView.render();
		},
		initialize: function(){
			console.log('router.js: initialize()  ', api.getAuthToken(), api.getUserId())
			Backbone.history.start();
			if (api.userIsLoggedIn())
				require(["views/app/header"], function(header){ header.render() });
			else
				homeView.render();
		}
	});

	// Returns the Router class
	return Router;

});
