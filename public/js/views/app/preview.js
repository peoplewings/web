define(function(require) {

    var $ = require("jquery");
    var Backbone = require("backbone");
    var api = require("api2");
    var PreviewModel = require("models/ProfilePreview")
    var mapView = require('views/app/map');
    var previewTpl = require('tmpl!templates/app/preview.html');
    var phrases = require('phrases');

    var previewView = Backbone.View.extend({

        el: "#main",

        initialize: function() {

            this.getWingList()
            this.model = new PreviewModel({
                _id: "preview"
            })
            this.map = new mapView({
                el: "#user-map",
                id: "mapcanvas"
            })
            this.model.on("change", this.render.bind(this));
            this.model.fetch()

        },
        render: function() {
            var cs = {civilState: phrases.choices["civilState"][this.model.get("civilState")]}
			var wings = {wings: this.wingsList}

            $(this.el).html(previewTpl(this.model.toJSON(), cs, wings))

            this.map.render()
            this.initMarkers()
        },

        initMarkers: function(){
			var sc = this
			
			var city = this.model.get("current")
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
			
		},

        getWingList: function() {
            var sc = this
            api.get(api.getApiVersion() + "/profiles/" + api.getUserId() + "/accomodations/preview", {})
            .prop("data")
            .then(function(data) {
                sc.wingsList = data.map(function(wing) {
					wing.smoking = phrases.choices["smoking"][wing.smoking]
					wing.whereSleepingType = phrases.choices["whereSleepingType"][wing.whereSleepingType]
					wing.status = phrases.choices["wingStatus"][wing.status]
					return wing
                })
            })
            .fin(function() {
                sc.render()
            })
        }

    });

    return new previewView;
});