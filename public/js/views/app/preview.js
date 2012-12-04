define([
  "jquery",
  "backbone",
  "api",
  "utils",
  'text!templates/app/preview.html',
  'models/Profile',
], function($, Backbone, api, utils, previewTpl, UserProfile){
	
	var previewView = Backbone.View.extend({
		el: "#main",
		initialize: function(){
			this.model = new UserProfile({id: api.getProfileId()})
			this._modelBinder = new Backbone.ModelBinder();
		},
		render: function(){
			var scope = this
			if (!this.model.get("avatar")){
				this.model.fetch({success: function(model) { 
												scope.model = new UserProfile(model)
												scope.doRender()
											}
				})
			}else this.doRender()
		},
		doRender: function(){
			console.log(this.model.attributes)
			var tpl = _.template(previewTpl, {
				avatar: this.model.get("avatar"), 
				verified: this.model.get("verified"),
				current: this.model.get("current"),
				lastLoginDate: this.model.get("lastLoginDate"),
				interestedIn: this.model.get("interestedIn")[0].gender + " " + this.model.get("interestedIn")[1].gender
			})
			$(this.el).html(tpl);
			this._modelBinder.bind(this.model, this.el)
			this.initCanvas()
		},
		initCanvas: function(){
			var scope = this
			require(['async!https://maps.googleapis.com/maps/api/js?key=AIzaSyABBKjubUcAk69Kijktx-s0jcNL1cIjZ98&sensor=false&libraries=places&language=en'], 
			function(){
	        $('#mapcanvas').attr({ style: 'height:300px;margin:10px;'}).addClass('span6');
        
	        var myOptions = { zoom: 1, center: new google.maps.LatLng(0,0), mapTypeControl: false, streetViewControl: false, navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL}, mapTypeId: google.maps.MapTypeId.ROADMAP }
	        scope.map = new google.maps.Map(document.getElementById("mapcanvas"), myOptions);
		})
		}
	});

  return new previewView;
});