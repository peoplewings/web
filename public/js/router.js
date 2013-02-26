define(function(require) {

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
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
	var userProfileView = require("views/app/userProfile");
	var wingsView = require("views/app/wings");
	var notificationsView = require("views/app/notifications");
	var threadView = require("views/app/thread");
	var Header = require("views/app/header");


	var Router = Backbone.Router.extend({
		routes: {
			"register": "register",
			"login": "login",
			"activate/:token": "activate",
			"forgot": "forgotPassword",
			"forgot/:token": "forgotPassword",
			"search/?:params": "search",
		//Logged User patterns
		"logout": "logout",
		"settings":"settings",

		"profiles/:id/edit":"profile",
		"profiles/:id/about":"previewProfile",
		"profiles/:id/wings":"previewProfile",

		"wings": "wings",
		"wings/:id": "wings",

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
		search: function(params){
			var unserialized = $.deparam(params);
			homeView.render(unserialized);

			api.get(api.getApiVersion() + "/profiles", unserialized)
			.prop('data')
			.then(function(results){
				homeView.renderResults(unserialized, results);
			})
		},
		//Logged User hashs
		logout: function(){
			logoutView.logout()
		},
		settings: function(){
			if (api.userIsLoggedIn()){
				if (!this.settingsView)
					this.settingsView = new settingsView;
				this.settingsView.render()
			} else this.login()

		},
		profile: function(id){
			if (+id !== api.getUserId())
				this.showUserProfile(id)

			if (!this.profileView){
				this.profileView = new profileView()
			} else this.profileView.render()

		},
		showUserProfile: function(userId){
			var scope = this
			if (!this.userProfileView){
				scope.userProfileView = new userProfileView(userId)
				scope.userProfileView.render()
			} else
			this.userProfileView.render(userId)
		},
		previewProfile: function(id){
			if (+id === api.getUserId()){
				if (!this.previewView){
					this.previewView = new previewView
				} else {
					this.previewView.render()
				}
			} else {
				this.showUserProfile(id)
			}
		},

		wings: function(wingId){
			if (!this.wingsView){
				this.wingsView = new wingsView;
				this.wingsView.render(wingId)
			} else this.wingsView.render(wingId)
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
		_trackPageview: function() {
			var url;
			url = Backbone.history.getFragment();
			return _gaq.push(['_trackPageview', "/" + url]);
		},
		initialize: function(){
			console.log('router.js: initialize()  ', api.getAuthToken(), api.getUserId())
			Backbone.history.start();
			if (api.userIsLoggedIn()){
				if (!this.header){
					this.header = new Header
					this.header.render()
				} else {
					this.header.render()
				}
			}
			return this.bind('all', this._trackPageview);
		}
	});

return Router;

});
