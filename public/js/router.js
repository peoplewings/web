//globals _gaq

define(function(require) {

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var homeView = require("views/home/main");
	var appHomeView = require("views/app/home");

	var registerView = require("views/home/register");
	var loginView = require("views/home/login");
	var activateView = require("views/home/activate");
	var passwordView = require("views/home/password");
	var logoutView = require("views/app/logout");
	var SettingsView = require("views/app/settings");
	var ProfileView = require("views/app/ProfileView");
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

			"profiles/:id/about":"aboutProfile",
			//"profiles/:id/wings":"previewProfile",

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
			this.showHeaderSearch(false);
			if (api.userIsLoggedIn())
				return this.defaultAction();
			registerView.render();
		},
		login: function(){
			this.showHeaderSearch(false);
			if (api.userIsLoggedIn())
				return this.defaultAction();
			loginView.render();
		},
		activate: function(id){
			this.showHeaderSearch(false);
			activateView.render(id);
		},
		forgotPassword: function(id){
			this.showHeaderSearch(false);
			passwordView.render(id);
		},
		landing: function() {
			document.location = 'landing.html';
		},

		search: function(params){
			this.showHeaderSearch(false);
			var unserialized = $.deparam(params);
			homeView.render(unserialized);

			api.get(api.getApiVersion() + "/profiles", unserialized)
				.prop('data')
				.then(function(results){
					homeView.renderResults(unserialized, results);
				});
		},
		//Logged User hashs
		logout: function() {
			this.showHeaderSearch(false);
			logoutView.logout();
		},
		settings: function(){
			this.showHeaderSearch(false);
			if (!api.userIsLoggedIn())
				return this.landing();

			if (!this.settingsView)
				this.settingsView = new SettingsView;
			this.settingsView.render();
		},
		aboutProfile: function(userId){
			this.showHeaderSearch(true);
			if (!api.userIsLoggedIn())
				return this.landing();

			if (!this.previewView)
				this.previewView = new ProfileView(+userId);
			this.previewView.render(+userId);
		},

		wings: function(wingId){
			/*
			this.showHeaderSearch(true);
			if (!this.wingsView) {
				this.wingsView = new WingsView;
				this.wingsView.render(wingId);
			} else this.wingsView.render(wingId);
			*/
			alert('TODO: Handler to open profile in wings tab');
		},

		showNotifications: function(filters){
			this.showHeaderSearch(true);
			if (!api.userIsLoggedIn())
				return this.landing();

			notificationsView.render(JSON.parse(filters || '{}'));
		},
		showThread: function(id) {
			this.showHeaderSearch(true);
			if (!api.userIsLoggedIn())
				return this.landing();

			threadView.render(id);
		},
		defaultAction: function(){
			this.showHeaderSearch(false);
			console.log('router.js: defaultAction()');
			if (!api.userIsLoggedIn())
				return this.landing();

			return appHomeView.render();
		},
		_trackPageview: function() {
			var url = Backbone.history.getFragment();
			return window._gaq.push(['_trackPageview', "/" + url]);
		},
		initialize: function(){
			console.log('router.js: initialize() ', api.getAuthToken(), api.getUserId());

			if (api.userIsLoggedIn()){
				if (!this.header)
					this.header = new Header;
				else
					this.header.render();
			}

			Backbone.history.start();
			return this.bind('all', this._trackPageview);
		},

		showHeaderSearch: function(state) {
			if (this.header)
				this.header.showSearch(state);
		}
	});

	return Router;

});
