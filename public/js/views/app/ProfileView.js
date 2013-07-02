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
			"click .personal-info button.send-message-btn": "sendMessage",
			"click .personal-info button.send-request-btn": "sendRequest",
			"click .personal-info button.send-invitation-btn": "sendInvitation",
		},

		initialize: function(userId) {
			//binding
			this.onCloseClick = this.onCloseClick.bind(this);
			this.onPhotoSort = this.onPhotoSort.bind(this);

			this.map = new MapView({
				el: "#user-map",
				id: "mapcanvas"
			});

			this.model = new PreviewModel({
				id: userId,
			});
		},

		render: function(userId, tabId) {
			var myProfile = this.model.get("id") === api.getUserId();
			this.model.clear({silent: true});
			this.model.set("id", userId, {silent: true});

			var tab = '#' + tabId || '#about';
			this.model.fetch({success: this.refresh.bind(this, tab)});
		},

		refresh: function(tab) {
			var myProfile = (this.model.get("id") === api.getUserId());

			this.refreshProfile(myProfile);
			this.refreshWings(myProfile);

			if (tab)
				this.selectTab(tab);

			//initialize foundation for this view to use in photo slide
			this.$("#photo-box").foundation();

			if (myProfile) {
				this.$("#photo-box ul")
					.addClass('sortable')
					.sortable({ update: this.onPhotoSort });
			}

			//close image propagation
			this.$('#collapse-photos .control').on('click', this.onCloseClick);

			if (myProfile) {
				if (!this.myProfile) {
					this.myProfile = new MyProfile(this.model, this);
					this.myWings = new MyWings(this);
				}
				this.myProfile.refresh();
			}
		},

		refreshProfile: function(myProfile){
			//set images data
			console.log(this.model.get('albums'));
			this.model.get('albums')[0].photos = [{
					id: 'xxxxxxxxxx01',
					big_url: 'img/profilePhotosTest/1.jpg',
					thumb_url: 'img/profilePhotosTest/1.jpg',
				}, {
					id: 'xxxxxxxxxx02',
					big_url: 'img/profilePhotosTest/2.jpg',
					thumb_url: 'img/profilePhotosTest/2.jpg',
				}, {
					id: 'xxxxxxxxxx03',
					big_url: 'img/profilePhotosTest/3.jpg',
					thumb_url: 'img/profilePhotosTest/3.jpg',
				}, {
					id: 'xxxxxxxxxx04',
					big_url: 'img/profilePhotosTest/4.jpg',
					thumb_url: 'img/profilePhotosTest/4.jpg',
				}, {
					id: 'xxxxxxxxxx05',
					big_url: 'img/profilePhotosTest/5.jpg',
					thumb_url: 'img/profilePhotosTest/5.jpg',
				}, {
					id: 'xxxxxxxxxx06',
					big_url: 'img/profilePhotosTest/6.jpg',
					thumb_url: 'img/profilePhotosTest/6.jpg',
				}, {
					id: 'xxxxxxxxxx07',
					big_url: 'img/profilePhotosTest/7.jpg',
					thumb_url: 'img/profilePhotosTest/7.jpg',
				}, {
					id: 'xxxxxxxxxx08',
					big_url: 'img/profilePhotosTest/8.jpg',
					thumb_url: 'img/profilePhotosTest/8.jpg',
				}, {
					id: 'xxxxxxxxxx09',
					big_url: 'img/profilePhotosTest/9.jpg',
					thumb_url: 'img/profilePhotosTest/9.jpg',
				}, {
					id: 'xxxxxxxxxx10',
					big_url: 'img/profilePhotosTest/10.jpg',
					thumb_url: 'img/profilePhotosTest/10.jpg',
				}, {
					id: 'xxxxxxxxxx11',
					big_url: 'img/profilePhotosTest/11.jpg',
					thumb_url: 'img/profilePhotosTest/11.jpg',
			}];

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

		onPhotoSort: function(event, ui) {
			var $li = this.$("#photo-box ul li");
			var ids = $li.map(function() {
				return $(this).data('photo-id');
			});

			api.put(api.getApiVersion() + '/albums/', {
				id: $li.data('album.id'),
				photos: ids,
			});
		},

		onCloseClick: function(e){
			e.stopPropagation();
			e.preventDefault();

			var $li = $(e.target).closest('li');
			var id = $li.data('photo-id');

			$li.slideUp();
			api['delete'](api.getApiVersion() + '/photos/' + id);
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
