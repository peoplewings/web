define([
  "jquery",
  "backbone",
  "api",
  "utils",
  'text!templates/app/preview.html',
  'models/ProfilePreview',
], function($, Backbone, api, utils, previewTpl, ProfilePreview){
	
	var previewView = Backbone.View.extend({
		el: "#main",
		markers: [],
		initialize: function(){
			this.model = new ProfilePreview({_id: "preview" })
			this._modelBinder = new Backbone.ModelBinder();
			//api.get(api.getApiVersion() + "/profiles/" + api.getProfileId() + "")
		},
		render: function(){
			var scope = this
			if (!this.model.get("avatar")){
				this.model.fetch({success: function(model) {
												scope.model = new ProfilePreview(model.attributes)
												scope.doRender()
											}
				})
			}else this.doRender()
		},
		doRender: function(){
			console.log(this.model.attributes)
			var bDay = (this.model.get("birthday") === "") ? "Not public" : this.model.get("birthday")
			var tpl = _.template(previewTpl, {
				birthday: bDay,
				hometown: this.model.get("hometown"), 
				avatar: this.model.get("avatar"), 
				verified: this.model.get("verified"),
				current: this.model.get("current"),
				otherLocations: this.model.get("otherLocations"),
				languages: this.model.get("languages"),
				lastLoginDate: this.model.get("lastLoginDate"),
				interestedIn: this.model.get("interestedIn")[0].gender,
				education: this.model.get("education"), 
			})
			$(this.el).html(tpl);
			this._modelBinder.bind(this.model, this.el)
			this.initCanvas(this.model.get("otherLocations"))
		},
		initCanvas: function(locations){
			var scope = this
			require(['async!https://maps.googleapis.com/maps/api/js?key=AIzaSyABBKjubUcAk69Kijktx-s0jcNL1cIjZ98&sensor=false&libraries=places&language=en'], 
			function(){
	        $('#mapcanvas').attr({ style: 'height:300px;margin:10px;'}).addClass('span6');
        
	        var myOptions = { zoom: 1, center: new google.maps.LatLng(0,0), mapTypeControl: false, streetViewControl: false, navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL}, mapTypeId: google.maps.MapTypeId.ROADMAP }
	        scope.map = new google.maps.Map(document.getElementById("mapcanvas"), myOptions);
			$.each(locations, function(key, location){
				scope.markers[key] = new google.maps.Marker({
						map: scope.map,
						position: new google.maps.LatLng(location.lat, location.lon),
						title: location.name + ", " + location.country
				});
			})
		})
		}
	});

  return new previewView;
});