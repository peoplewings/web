define(function(require) {
	require('jquery.Datepicker');
	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");

	var PreviewModel = require("models/ProfileModel");
	var MapView = require('views/app/map');
	var notifications = require('views/lib/notifications');
	var MyProfile = require('views/app/MyProfile');
	var MyWings = require('views/app/MyWings');
	var CarouselView = require('views/lib/Carousel');
	var profileTpl = require('tmpl!templates/app/profile/profile.html');
	var basicTpl = require('tmpl!templates/app/profile/view.basic.html');
	var aboutTpl = require('tmpl!templates/app/profile/view.about.html');
	var likesTpl = require('tmpl!templates/app/profile/view.likes.html');
	var photosTpl = require('tmpl!templates/app/profile/view.photos.html');
	var contactTpl = require('tmpl!templates/app/profile/view.contact.html');
	var placesTpl = require('tmpl!templates/app/profile/view.places.html');
	var wingTpl = require('tmpl!templates/app/profile/view.wing.html');
	var wingsBarTpl = require('tmpl!templates/app/profile/form.add-wings.html');
	var foundation = require("foundation");
	var foundationClearing = require("foundationClearing");
		

	var ProfileView = Backbone.View.extend({

		el: "#main",

		events: {
			"click button.send-message-btn": "sendMessage",
			"click button.send-request-btn": "sendRequest",
			"click button.send-invitation-btn": "sendInvitation",
			
			"mouseenter #collapse-photos li" : function(e){
				$(e.target).parents('li').find('.control').show();
			},

			"mouseleave #collapse-photos li" : function(e){
				$(e.target).parents('li').find('.control').hide();
			}
		},

		initialize: function(userId) {
			this.map = new MapView({
				el: "#user-map",
				id: "mapcanvas"
			});

			this.model = new PreviewModel({
				id: userId
			});
		},

		render: function(userId, tabId) {
			var myProfile = this.model.get("id") === api.getUserId();
			this.model.clear({silent: true});
			this.model.set("id", userId, {silent: true});

			var tab = '#' + tabId || '#about';
			this.model.fetch({success: this.refresh.bind(this, tab)});

			if (myProfile && !this.myProfile) {
				this.myProfile = new MyProfile(this.model, this);
				this.myWings = new MyWings(this);
			}			
		},

		refresh: function(tab) {
			var myProfile = (this.model.get("id") === api.getUserId());

			this.refreshProfile(myProfile);
			this.refreshWings(myProfile);

			if (tab)
				this.selectTab(tab);

			//initialize foundation for this view to use in photo slide
			this.$("#photo-box").foundation();

			//photos draggable
			this.$("#photo-box ul").sortable();
		},

		refreshProfile: function(myProfile){			
			//set images data
			var hackPhotosArray = [				
				{
					src: 'img/profilePhotosTest/1.jpg'
				},
				{
					src: 'img/profilePhotosTest/2.jpg'
				},
				{
					src: 'img/profilePhotosTest/3.jpg'
				},
				{
					src: 'img/profilePhotosTest/4.jpg'
				},
				{
					src: 'img/profilePhotosTest/5.jpg'
				},
				{
					src: 'img/profilePhotosTest/6.jpg'
				},
				{
					src: 'img/profilePhotosTest/7.jpg'
				},
				{
					src: 'img/profilePhotosTest/8.jpg'
				},
				{
					src: 'img/profilePhotosTest/9.jpg'
				},
				{
					src: 'img/profilePhotosTest/10.jpg'
				},
				{
					src: 'img/profilePhotosTest/11.jpg'
				},
			];

			this.model.attributes.albums[0].photos = hackPhotosArray;
			$(this.el).html(profileTpl(this.model.toJSON(), {myProfile: myProfile}));

			this.$("#basic-box").html(basicTpl(this.model.toJSON(), {myProfile: myProfile}));
			this.$("#about-box").html(aboutTpl(this.model.toJSON(), {myProfile: myProfile}));
			this.$("#likes-box").html(likesTpl(this.model.toJSON(), {myProfile: myProfile}));
			this.$("#photo-box").html(photosTpl(this.model.toJSON(), {myProfile: myProfile}));
			this.$("#contact-box").html(contactTpl(this.model.toJSON(), {myProfile: myProfile}));
			this.$("#places-box").html(placesTpl(this.model.toJSON(), {myProfile: myProfile}));

			this.map.render();
			this.initMarkers();
		},

		refreshWings: function(myProfile){
			var tpl = wingsBarTpl({ avatar: this.model.get("avatar"), generalStatus: this.model.get("pwState")});
			if (!myProfile)
				tpl = basicTpl(this.model.toJSON(), {myProfile: myProfile});

			this.$("#wings .content-left").html(tpl);
			this.$("#wings .content-right").empty();

			var self = this;
			this.model.get("wingsCollection")
			.map(function(wing){
				var box = $(document.createElement('div'))
					.attr('id', 'wing-box-' + wing.id)
					.addClass('box-standard');
				self.$("#wings .content-right").append(box);

				wing.transports = wing.metro || wing.tram || wing.train || wing.bus || wing.plane || wing.others;
				$(box).html(wingTpl(wing));
			});
		},

		onCloseClick: function(e){
			e.stopPropagation();
			e.preventDefault();
			$(e.target).parents('li').slideUp();
		},

		renderBox: function(box){
			this.model.fetch({success: this.refreshBox.bind(this, box)});
		},

		refreshBox: function(box){
			var myProfile = (this.model.get("id") === api.getUserId());
			var tpl = null;

			switch (box){
				case "basic-box":
					tpl = basicTpl(this.model.toJSON(), {myProfile: myProfile});
					break;
				case "about-box":
					tpl = aboutTpl(this.model.toJSON(), {myProfile: myProfile});
					break;
				case "likes-box":
					tpl = likesTpl(this.model.toJSON(), {myProfile: myProfile});
					break;
				case "photos-box":
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
			if (box === "places-box"){
				this.initializeMap();
			}
		},

		initializeMap: function(){
			this.map = new MapView({
				el: "#user-map",
				id: "mapcanvas"
			});
			this.map.render();
			this.initMarkers();
		},

		initMarkers: function() {
			var sc = this;

			var city = this.model.get("current");
			if (!_.isEmpty(city)) {
				this.map.addMarker({
					id: "current",
					location: new google.maps.LatLng(city.lat, city.lon),
					title: city.name + ", " + city.country,
					icon: 'img/places-current-marker.png'
				});
			} else this.map.deleteMarker('current');
			city = this.model.get("hometown");
			if (!_.isEmpty(city)) {
				this.map.addMarker({
					id: "hometown",
					location: new google.maps.LatLng(city.lat, city.lon),
					title: city.name + ", " + city.country,
					icon: 'img/places-hometown-marker.png'
				});
			} else this.map.deleteMarker('hometown');
			var others = this.model.get("otherLocations");
			if (others.length) {
				_.each(others, function(location, index) {
					sc.map.addMarker({
						id: "otherLocation-" + index,
						location: new google.maps.LatLng(location.lat, location.lon),
						title: location.name + ", " + location.country,
						icon: 'img/places-other-marker.png'
					});
				});
			}
		},

		selectTab: function(tabId) {
			this.$('.tab-content .tab-pane').removeClass('active');
			$(tabId).addClass('active');

			$(".tabs ul li").removeClass("active");
			$('.tabs ul li a[href=' + tabId + ']')
			.parent()
			.addClass("active");
		},

		/*
		Waiting to update Backbone lib to avoid trigger false bug
		http://stackoverflow.com/questions/11205623/backbone-router-failing-to-respect-trigger-false-option
		tabHandler: function(evt){

			var tabId = evt.target.href.split(evt.target.baseURI)[1];
			window.router.navigate('#/profiles/' + this.model.get('id') + '/' + tabId.split('#')[1], {trigger: false});

		},
		*/

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
