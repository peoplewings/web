define(function(require) {

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var PreviewModel = require("models/ProfileModel")
	var mapView = require('views/app/map');
	var profileTpl = require('tmpl!templates/app/profile.html');
	var phrases = require('phrases');

	var previewView = Backbone.View.extend({

		el: "#main",

		initialize: function(userId) {
			this.map = new mapView({
				el: "#user-map",
				id: "mapcanvas"
			})

			this.model = new PreviewModel({
				id: userId,
			});

			this.model.on("change", this.refresh.bind(this));

		},
		render: function(userId) {
			this.model.set("id", userId, {silent: true});
			this.model.fetch();
			this.getWingList(userId);
		},

		refresh: function(){
			
			var myProfile = (this.model.get("id") === api.getUserId());

			$(this.el).html(profileTpl(this.model.toJSON(), { wings: this.wingsList, myProfile: myProfile }));

			this.map.render()
			this.initMarkers()

		},

		initMarkers: function(){
			var sc = this

			var city = this.model.get("current")
			if (city){
				this.map.addMarker({
					id: "current",
					location: new google.maps.LatLng(city.lat, city.lon),
					title: city.name + ", " + city.country,
					icon: 'img/blue-marker.png'
				})

				city = this.model.get("hometown")
				this.map.addMarker({
					id: "hometown",
					location: new google.maps.LatLng(city.lat, city.lon),
					title: city.name + ", " + city.country,
					icon: 'img/green-marker.png'
				})

				var others = this.model.get("otherLocations")
				_.each(others, function(location, index){
					sc.map.addMarker({
						id: "otherLocation-" + index,
						location: new google.maps.LatLng(location.lat, location.lon),
						title: location.name + ", " + location.country
					})
				})
			}
		},

		getWingList: function(userId) {
			//Molaria hacer refactor i meterlo como Collection del Model

			var self = this
			api.get(api.getApiVersion() + "/profiles/" + userId + "/accomodations/preview")
			.prop("data")
			.then(function(data) {
				self.wingsList = data.map(function(wing) {
					wing.bestDays = phrases.choices["wingDaysChoices"][wing.bestDays];
					wing.smoking = phrases.choices["smoking"][wing.smoking];
					wing.whereSleepingType = phrases.choices["whereSleepingType"][wing.whereSleepingType];
					wing.status = phrases.choices["wingStatus"][wing.status];
					return wing
				})
			})
			.fin(function() {
				self.refresh();
			})
		},

	});

	return previewView;
});
