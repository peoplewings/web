define(function(require){

	var $ = require("jquery");
	var Backbone = require("backbone");
	var gMaps = require("async!https://maps.googleapis.com/maps/api/js?key=AIzaSyABBKjubUcAk69Kijktx-s0jcNL1cIjZ98&sensor=false&libraries=places&language=en")	
	
	var mapView = Backbone.View.extend({
		
		markers: {
			
		},
		
		initialize: function(options) {
			this.el = options.el
			this.id = options.id
			this.styles = options.styles || { height: "300px", marginLeft: "160px"} 
			this.mapOptions = options.mapOptions || { zoom: 1, center: new google.maps.LatLng(0,0), mapTypeControl: false, streetViewControl: false, navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL}, mapTypeId: google.maps.MapTypeId.ROADMAP }
			
			
			this.mapcanvas = $(document.createElement('div'))
			this.mapcanvas.attr({ id: this.id}) 
			this.mapcanvas.css(this.styles)
			
		},
		
		render: function(markers){
			
			$(this.el).html(this.mapcanvas)
		    
			this.map = new google.maps.Map(document.getElementById(this.id), this.mapOptions);
			
			
		},
		
		
		setCenter: function (location) {
			
			this.map.setCenter(location);
			
		},
		
		addMarker: function(id, location, title) {
			if (!this.markers[id]) {
				
				var marker = new google.maps.Marker({
					map: this.map,
					position: location,
					title: title
				});
			
				this.markers[id] = marker
				
			} else {
				
				this.markers[id].setPosition(location)
				this.markers[id].setTitle(title)
				
			}
		},
		
		renderMarkers: function() {
			var map = this.map
			_.each(this.markers, function(marker){
				marker.setMap(map)
			})
			
		},
		
		clearMarkers: function(){
			
			_.each(this.markers, function(marker){
				marker.setMap(null)
			})
		}
	});
	
	return mapView;
});