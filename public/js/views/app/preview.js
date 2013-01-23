define(function(require){

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var PreviewModel = require("models/ProfilePreview")
	var mapView = require('views/app/map');
	var previewTpl = require('tmpl!templates/app/preview.html');
	
	var previewView = Backbone.View.extend({
		
		el: "#main",

		initialize: function(){
			
			this.getWingList()
			this.model = new PreviewModel({_id: "preview" })
			this.map = new mapView({el: "#user-map", id: "mapcanvas"})
			this.model.on("change", this.render.bind(this));
			this.model.fetch()

		},
		render: function(){
			
			var data = _.extend(this.model.toJSON(), {wings: this.wingsList})
			console.log(data)
			$(this.el).html(previewTpl(data))
			
			this.map.render()
			this.initMarkers()
			
		},
		
		initMarkers: function(){
			var sc = this
			
			var city = this.model.get("current")
			this.map.addMarker("current", new google.maps.LatLng(city.lat, city.lon), city.name + ", " + city.country)			
			
			city = this.model.get("hometown")
			this.map.addMarker("hometown", new google.maps.LatLng(city.lat, city.lon), city.name + ", " + city.country)
			
			var others = this.model.get("otherLocations")
			_.each(others, function(location, index){
				sc.map.addMarker("otherLocation-" + index, new google.maps.LatLng(location.lat, location.lon), location.name + ", " + location.country)
			})
			
			this.map.renderMarkers()
			
		},
		
		getWingList: function(){
			var sc = this
			api.get(api.getApiVersion() + "/profiles/" + api.getProfileId() + "/accomodations/preview", {})
				.prop("data")
			 	.then(function(data){
					console.log(data)
					sc.wingsList = data
				})
				.fin(function(){
					sc.render()
				})
		}
	});

  return new previewView;
});