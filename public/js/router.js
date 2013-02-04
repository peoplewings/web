define([
	"jquery",
	"backbone",
	"api2",
	"views/home/main",
	"views/app/home",
	"models/Account",
], function($, Backbone, api, homeView, appHomeView, UserModel){


	var Router = Backbone.Router.extend({
		routes: {
			"register": "register",
			"login": "login",
			"activate/:id": "activate",
			"forgot": "forgotPassword",
			"forgot/:id": "forgotPassword",
			"search/?:params": "search",
		//Logged User patterns
			 "logout": "logout",
			 "settings":"settings",
			 "profiles/:id":"profile",
			 "profiles/:id/preview":"previewProfile",
			 "wings": "wings",
			 "messages/:id": "showThread",
			 "messages/filter/:filters": "showNotifications",
			 "messages": "showNotifications",
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
		search: function(params){
			console.log("PARAMS:", params, $.deparam(params))

			var unserialized = $.deparam(params);
			homeView.render(unserialized);

			api.get(api.getApiVersion() + "/profiles?" + params, {})
			.prop('data')
			.then(function(results){
				homeView.renderResults(unserialized, results);
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
		profile: function(id){
			var scope = this
			if (+id === api.getUserId()){
				if (!this.profileView){
				require(["views/app/profile"], function(profileView){
					scope.profileView = new profileView()
				})
				} else this.profileView.render()	;
			} else {
				this.showUserProfile(id);
			}
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
		previewProfile: function(id){
			var scope = this
			if (!this.previewView){
				require(["views/app/preview"], function(previewView){
					scope.previewView = previewView
				})
			} else {
				this.previewView.render()	
			}

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
		}
	});

	return Router;

});
