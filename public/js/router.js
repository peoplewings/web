define(function(require) {

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api");
	var api2 = require("api2");
	var homeView = require("views/home/main");
	var appHomeView = require("views/app/home");
	var UserModel = require("models/Account");

	var registerView = require("views/home/register");
	var loginView = require("views/home/login");
	var activateView = require("views/home/activate");
	var passwordView = require("views/home/password");
	var logoutView = require("views/app/logout");
	var settingsView = require("views/app/settings");
	var profileView = require("views/app/profile");
	var previewView = require("views/app/preview");
	var View = require("views/app/userProfile");
	var wingsView = require("views/app/wings");
	var notificationsView = require("views/app/notifications");
	var threadView = require("views/app/thread");
	var header = require("views/app/header");


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
				registerView.render();
			}
		},
		login: function(){
			if (api.userIsLoggedIn()){
				this.defaultAction()
			} else {
				loginView.render();
			}
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
			if (api.userIsLoggedIn()){
				settingsView.render()
			} else this.login()

		},
		profile: function(){
			var scope = this
			if (!this.profileView){
				scope.profileView = new profileView()
			} else this.profileView.render()
		},
		previewProfile: function(){
			var scope = this
			if (!this.previewView){
				scope.previewView = previewView
			} else this.previewView.render()

		},
		showUserProfile: function(userId){
			var scope = this
			if (!this.userProfileView){
				scope.userProfileView = new View(userId)
				scope.userProfileView.render()
			} else
				this.userProfileView.render(userId)
		},
		wings: function(){
			var scope = this
			if (!this.wingsView){
				wingsView.render()
			} else this.wingsView.render()
		},
		showNotifications: function(filters){
			var scope = this
			if (!this.notificationsView){
				notificationsView.render(JSON.parse(filters || '{}'));
			} else this.notificationsView.render()
		},
		showThread: function(id) {
			var scope = this
			if (!this.threadView){
				scope.threadView = threadView;
				threadView.render(id)
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
				header.render()
			else
				homeView.render();
		}
	});

	// Returns the Router class
	return Router;

});
