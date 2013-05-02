define(function(require){

	var $ = require("jquery");
	var Backbone = require("backbone");

	var mapView = Backbone.View.extend({

		markers: {

		},

		initialize: function(options) {
			this.el = options.el;
			this.id = options.id;
			this.css = options.css;
			this.styles = _.extend(options.styles || {}, {height: "300px"});
			this.mapOptions = options.mapOptions ||
			{
			 	zoom: 1,
				scrollwheel: false,
				center: new google.maps.LatLng(0, 0),
				mapTypeControl: false,
				streetViewControl: false,
				navigationControlOptions: {
					style: google.maps.NavigationControlStyle.SMALL
				},
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};

			this.mapcanvas = $(document.createElement('div'));
			this.mapcanvas.attr({ id: this.id});
			this.mapcanvas.css(this.styles);

			if (this.css)
				this.mapcanvas.addClass(this.css);

		},

		render: function(){
			$(this.el).html(this.mapcanvas);
			this.map = new google.maps.Map(document.getElementById(this.id), this.mapOptions);
			this.renderMarkers();
		},

		setCenter: function (location) {
			this.map.setCenter(location);
		},

		addMarker: function(options) {
			if (!this.markers[options.id]) {

				var marker = new google.maps.Marker({
					map: this.map,
					position: options.location,
					title: options.title,
					icon: options.icon || null
				});

				this.markers[options.id] = marker;

			} else {

				this.markers[options.id].setPosition(options.location);
				this.markers[options.id].setTitle(options.title);

			}

			return true;
		},

		deleteMarker: function(id) {
			if (!this.markers[id])
				return false;

			this.markers[id].setMap(null);
			delete this.markers[id];
			return true;
		},

		renderMarkers: function() {
			var map = this.map;
			_.each(this.markers, function(marker){
				marker.setMap(map);
			});

		},

		clearMarkers: function(){
			_.each(this.markers, function(marker){
				marker.setMap(null);
			});
		}
	});

	return mapView;
});
