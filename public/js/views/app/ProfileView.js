define(function(require) {

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var phrases = require('phrases');
	var PreviewModel = require("models/ProfileModel");
	var MapView = require('views/app/map');
	var notifications = require('views/lib/notifications');
	var MyProfile = require('views/app/MyProfile');
	var profileTpl = require('tmpl!templates/app/profile.html');
	var basicTpl = require('tmpl!templates/app/profile.view.basic.html');
	var aboutTpl = require('tmpl!templates/app/profile.view.about.html');
	var likesTpl = require('tmpl!templates/app/profile.view.likes.html');
	var contactTpl = require('tmpl!templates/app/profile.view.contact.html');
	var placesTpl = require('tmpl!templates/app/profile.view.places.html');


	var ProfileView = Backbone.View.extend({

		el: "#main",

		events: {
			"click button.send-message-btn": "sendMessage",
			"click button.send-request-btn": "sendRequest",
			"click button.send-invitation-btn": "sendInvitation",
		},

		initialize: function(userId) {
			this.map = new MapView({
				el: "#user-map",
				id: "mapcanvas"
			});

			this.model = new PreviewModel({
				id: userId,
			});
		},

		render: function(userId) {
			this.model.clear({silent: true});
			this.model.set("id", userId, {silent: true});

			this.model.fetch({success: this.refresh.bind(this)});
			this.getWingList(userId);

			if (this.model.get("id") === api.getUserId())
				this.myProfile = new MyProfile(this.model, this);
		},

		refresh: function() {
			var myProfile = (this.model.get("id") === api.getUserId());

			$(this.el).html(profileTpl(this.model.toJSON(), {wings: this.wingsList, myProfile: myProfile}));

			this.$("#basic-box").html(basicTpl(this.model.toJSON(), { 
				myProfile: myProfile, 
				civilState: phrases.choices.civilState[this.model.get("civilState")],
				replyTime: moment.duration(+this.model.get("replyTime")).humanize(),
			}));
			this.$("#about-box").html(aboutTpl(this.model.toJSON(), {myProfile: myProfile}));
			this.$("#likes-box").html(likesTpl(this.model.toJSON(), {myProfile: myProfile}));
			this.$("#contact-box").html(contactTpl(this.model.toJSON(), {myProfile: myProfile}));
			this.$("#places-box").html(placesTpl(this.model.toJSON(), {myProfile: myProfile}));

			this.map.render();
			this.initMarkers();
		},

		refreshBox: function(box){
			var myProfile = (this.model.get("id") === api.getUserId());
			var tpl = null;

			switch (box){
				case "basic-box":
					tpl = basicTpl(this.model.toJSON(), { 
						myProfile: myProfile, 
						civilState: phrases.choices.civilState[this.model.get("civilState")],
						replyTime: moment.duration(+this.model.get("replyTime")).humanize(),
					});
					break;
				case "about-box":
					tpl = aboutTpl(this.model.toJSON(), {myProfile: myProfile});
					break;
				case "likes-box":
					tpl = likesTpl(this.model.toJSON(), {myProfile: myProfile});
					break;
				case "contact-box":
					tpl = contactTpl(this.model.toJSON(), {myProfile: myProfile});
					break;
				case "places-box":
					tpl = placesTpl(this.model.toJSON(), {myProfile: myProfile});
					break;
			}
			this.$("#" + box).html(tpl);
		},

		initMarkers: function(){
			var sc = this;

			var city = this.model.get("current");
			if (city){
				this.map.addMarker({
					id: "current",
					location: new google.maps.LatLng(city.lat, city.lon),
					title: city.name + ", " + city.country,
					icon: 'img/blue-marker.png'
				});

				city = this.model.get("hometown");
				this.map.addMarker({
					id: "hometown",
					location: new google.maps.LatLng(city.lat, city.lon),
					title: city.name + ", " + city.country,
					icon: 'img/green-marker.png'
				});

				var others = this.model.get("otherLocations");
				_.each(others, function(location, index){
					sc.map.addMarker({
						id: "otherLocation-" + index,
						location: new google.maps.LatLng(location.lat, location.lon),
						title: location.name + ", " + location.country
					});
				});
			}
		},

		getWingList: function(userId) {
			//Molaria hacer refactor i meterlo como Collection del Model

			var self = this;
			api.get(api.getApiVersion() + "/profiles/" + userId + "/accomodations/preview")
				.prop("data")
				.then(function(data) {
					self.wingsList = data.map(function(wing) {
						wing.bestDays = phrases.choices.wingDaysChoices[wing.bestDays];
						wing.smoking = phrases.choices.smoking[wing.smoking];
						wing.whereSleepingType = phrases.choices.whereSleepingType[wing.whereSleepingType];
						wing.status = phrases.choices.wingStatus[wing.status];
						return wing;
					});
				})
				.fin(function() {
					self.refresh();
				});
		},

		sendMessage: function() {
			notifications.message(this.model.get("id"), this.model.get("firstName") + " " + this.model.get("lastName"));
		},

		sendRequest: function() {
			notifications.request(this.model.get("id"), this.model.get("firstName") + " " + this.model.get("lastName"));
		},

		sendInvitation: function() {
			notifications.invitation(this.model.get("id"), this.model.get("firstName") + " " + this.model.get("lastName"));
		}
	});

	return ProfileView;
});
