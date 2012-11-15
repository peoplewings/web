define([
  "jquery",
  "backbone",
  "api",
  "utils",
  'text!templates/app/accomodation-form.html',
  'text!templates/lib/alert.html',
], function($, Backbone, api, utils, wingTpl, alertTpl){
	
	
  var wingView = Backbone.View.extend({
	el: "#main",
	events: {
		"submit form#accomodation-form": "submitWing",
		"click input#inputSharingOnce": function(evt){
			if (evt.target.checked) $("div#sharing-dates").show()
			else $("div#sharing-dates").hide()
		}
	},
	initialize: function(){
	},
	render: function(){
		var tpl = _.template(wingTpl);
		$("#my-wings").append(tpl)
		//Set date pickers
		$("input[name=startDate]").datepicker().datepicker("option", "dateFormat", "yy-mm-dd")
		$("input[name=endDate]").datepicker().datepicker("option", "dateFormat", "yy-mm-dd")
		//Set autocomplete on city field
		this.cityAutocomplete()
		//Set validations
		$('#accomodation-form').validate()
		
    },
	submitWing: function(evt){
		evt.preventDefault()
		var data = utils.serializeForm(evt.target.id)
		data.city = this.cityObject
		console.log(data)
		api.post(api.getApiVersion() + "/profiles/me/accomodations/", data, function(response){
			var tpl
			if (response.status === true){
				tpl = _.template(alertTpl, {extraClass: 'alert-success', heading: response.msg})
			} else tpl = _.template(alertTpl, {extraClass: 'alert-error', heading: response.msg})
			$('#main').prepend(tpl)
		})
	},
	cityAutocomplete: function(){
		var sc = this
		require(['async!https://maps.googleapis.com/maps/api/js?key=AIzaSyABBKjubUcAk69Kijktx-s0jcNL1cIjZ98&sensor=false&libraries=places&language=en'],
		function(){
			var autoCity = new google.maps.places.Autocomplete(document.getElementById("inputCity"), { types: ['(cities)'] });
			google.maps.event.addListener(autoCity, 'place_changed', sc.setAutocomplete(autoCity, "inputCity"));   
			$("#inputCity").keypress(function(event) { if ( event.which == 13 ) event.preventDefault() })
		})
	},
	setAutocomplete: function(auto, field){
		var sc = this
		return function(){
			var place = auto.getPlace()
			if (place.geometry){
				var cc = sc.getCityAndCountry(place.address_components)
				cc.lat = place.geometry.location.lat()
				cc.lon = place.geometry.location.lng()
				sc.cityObject = cc
			}
		}
	},
	getCityAndCountry: function(address_components){
		//Replicated function from profileView --> Refactor please!
		var data = {}
		var component
		for (obj in address_components){
			component = address_components[obj]
			for ( type in component.types){
				switch(component.types[type]){
					case "locality": data.name = component.long_name
									 break;
					case "country": data.country = component.long_name
									 break;
					case "administrative_area_level_1": data.region = component.long_name
									 					break;
				}
			}
		  }
		return data
	},
  });

  return new wingView;
});