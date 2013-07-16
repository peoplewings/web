define(function(require) {

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");

	var homeView = require("views/home/main");
	var appHomeView = require("views/app/home");
	var registerView = require("views/home/register");
	var loginView = require("views/home/login");
	var helpCenter = require("views/home/help");
	var activateView = require("views/home/activate");
	var passwordView = require("views/home/password");
	var logoutView = require("views/app/logout");
	var SettingsView = require("views/app/settings");
	var deleteAccount = require("views/app/deleteAccount");
	var ProfileView = require("views/app/ProfileView");
	var notificationsView = require("views/app/notifications");
	var threadView = require("views/app/thread");
	var Header = require("views/app/header");


	var Router = Backbone.Router.extend({
		routes: {
			"register": "register",
			"login": "login",
			"help": "help",
			"help#:tab": "help",
			"activate/:token": "activate",
			"forgot": "forgotPassword",
			"forgot/:token": "forgotPassword",
			"search": "search",
			"search/:type": "search",
			"search/:type/": "search",
			"search/:type/?:params": "search",
			//Logged User patterns
			"logout": "logout",
			"settings":"settings",
			"settings/delete":"deleteAccount",

			"profiles/:id/about":"aboutProfile",
			"profiles/:id/wings":"wingsProfile",

			"messages/:id": "showThread",
			"messages/filter/:filters": "showNotifications",
			"messages": "showNotifications",
			//Default action
			"*actions": "defaultAction",
		},

		//Anonymous User hashs
		register: function(){
			this.showHeaderSearch(false);
			this.showBackgroundImage(true);
			if (api.userIsLoggedIn())
				return this.defaultAction();
			registerView.render();
		},
		login: function(){
			this.showHeaderSearch(false);
			this.showBackgroundImage(true);
			if (api.userIsLoggedIn())
				return this.defaultAction();
			loginView.render();
		},
		help: function(tabId){
			var tab = tabId || null;
			this.showHeaderSearch(false);
			this.showBackgroundImage(false);
			helpCenter.render(tab);
		},
		activate: function(id){
			this.showHeaderSearch(false);
			this.showBackgroundImage(false);
			activateView.render(id);
		},
		forgotPassword: function(id){
			this.showHeaderSearch(false);
			this.showBackgroundImage(false);
			passwordView.render(id);
		},
		landing: function() {
			document.location = 'landing.html';
		},
		search: function(type, params){
			this.showHeaderSearch(false);
			this.showBackgroundImage(false);
			homeView.execute(type || 'people', $.deparam(params));
		},
		//Logged User hashs
		logout: function() {
			this.showHeaderSearch(false);
			this.showBackgroundImage(false);
			logoutView.logout();
		},
		settings: function(){
			this.showHeaderSearch(true);
			this.showBackgroundImage(false);
			if (!api.userIsLoggedIn())
				return this.landing();

			if (!this.settingsView)
				this.settingsView = new SettingsView;
			this.settingsView.render();
		},

		deleteAccount: function(){
			this.showHeaderSearch(true);
			this.showBackgroundImage(false);
			if (!api.userIsLoggedIn())
				return this.landing();

			deleteAccount.render();
		},

		aboutProfile: function(userId){
			this.showHeaderSearch(true);
			this.showBackgroundImage(false);
			if (!api.userIsLoggedIn())
				return this.landing();

			if (!this.previewView)
				this.previewView = new ProfileView(+userId);
			this.previewView.render(+userId, "about");

		},
		wingsProfile: function(userId){
			this.showHeaderSearch(true);
			this.showBackgroundImage(false);
			if (!api.userIsLoggedIn())
				return this.landing();

			if (!this.previewView)
				this.previewView = new ProfileView(+userId);
			this.previewView.render(+userId, "wings");
		},

		showNotifications: function(filters){
			this.showHeaderSearch(true);
			this.showBackgroundImage(false);
			if (!api.userIsLoggedIn())
				return this.landing();

			notificationsView.render(JSON.parse(filters || '{}'));
		},
		showThread: function(id) {
			this.showHeaderSearch(true);
			this.showBackgroundImage(false);
			if (!api.userIsLoggedIn())
				return this.landing();

			threadView.render(id);
		},
		defaultAction: function(){
			this.showHeaderSearch(false);
			this.showBackgroundImage(false);
			console.log('router.js: defaultAction()');
			if (!api.userIsLoggedIn())
				return this.landing();

			this.navigate('/search/people/');
			this.search('people');
		},
		_trackPageview: function() {
			var url = Backbone.history.getFragment();
			return window.ga('_trackPageview', "/" + url);
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
		},

		showBackgroundImage: function(state) {
			if (state)
				$('div.background-roller').addClass('background-10');
			else
				$('div.background-roller').removeClass('background-10');
		}
	});

	return Router;

});
