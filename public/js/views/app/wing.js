define([
  "jquery",
  "backbone",
  "api",
  "utils",
  'models/Wing',
  'text!templates/app/accomodation-form.html',
  'text!templates/lib/alert.html',
], function($, Backbone, api, utils, WingModel, wingTpl, alertTpl){
	
	
  var View = Backbone.View.extend({
	wings: [],
	events: {
		"submit form#accomodation-form": "submitWing",
		"click #update-wing-btn": "updateWing",
		"click #delete-wing-btn": "deleteWing",
		"click #cancel-wing-btn": "close",
		"click input#inputSharingOnce": function(evt){
			if (evt.target.checked) $("div#sharing-dates").show()
			else {
				$("div#sharing-dates").hide()
				$("[name=dateStart]").val("")
				$("[name=dateEnd]").val("")
			}
		}
	},
	initialize: function(options){
		this.papa = options.papa
	},
	render: function(options){
		if (options.target === undefined || options.update === undefined) alert( "Bad options" + options.toString())
		var tpl, sc
		sc = this
		if (options.id){
			this.model = new WingModel({id: options.id})
			this.model.fetch({success: function(model){
					console.log(model.attributes)
					sc.cityObject = model.get("city")
					tpl = _.template(wingTpl, {update: options.update})
					$(sc.el).html(tpl)
					sc.$el.appendTo(options.target)
					sc.bindModel()
					sc.initWing()
			}})
		}else{
			tpl = _.template(wingTpl, {update: options.update});
      		$(this.el).html(tpl);
	  		this.$el.appendTo(options.target)
			this.initWing()
		}
	  
    },
	close: function(){
		this.remove()
		this.unbind()
	},
	bindModel: function(){
		this._modelBinder = new Backbone.ModelBinder();
		this._modelBinder.bind(this.model, this.el)
		$("[name=city]").val(this.cityObject.name + ", " + this.cityObject.country)
		if (this.model.get("sharingOnce") === true) $("div#sharing-dates").show()
	},
	initWing: function(){
		var sc = this
		$("input[name=dateStart]").datepicker().datepicker("option", "dateFormat", "yy-mm-dd")
		$("input[name=dateEnd]").datepicker().datepicker("option", "dateFormat", "yy-mm-dd")

		require(['async!https://maps.googleapis.com/maps/api/js?key=AIzaSyABBKjubUcAk69Kijktx-s0jcNL1cIjZ98&sensor=false&libraries=places&language=en'],
		function(){
			console.log(document.getElementById("inputCity"))
			var autoCity = new google.maps.places.Autocomplete(document.getElementById("inputCity"), { types: ['(cities)'] });
			google.maps.event.addListener(autoCity, 'place_changed', sc.setAutocomplete(autoCity, "inputCity"));   
			$("#inputCity").keypress(function(event) { if ( event.which == 13 ) event.preventDefault() })
		})
		
		$('#accomodation-form').validate()
	},
	setAutocomplete: function(auto, field){
		var sc = this
		return function(){
			var place = auto.getPlace()
			if (place.geometry){
				var cc = sc.getCityAndCountry(place.address_components)
				cc.lat = place.geometry.location.lat() + ""
				cc.lon = place.geometry.location.lng() + ""
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
	submitWing: function(evt){
		evt.preventDefault()
		var scope = this 
		var data = utils.serializeForm(evt.target.id)
		data.city = this.cityObject
		if ((data.dateStart === "" && data.dateEnd === "") && data.sharingOnce == undefined) {
			delete data.dateStart
			delete data.dateEnd
		} else {
			data.dateStart += " 00:00:00"
			data.dateEnd += " 00:00:00"
		}
		api.post(api.getApiVersion() + "/profiles/me/accomodations/", data, function(response){
			var tpl
			if (response.status === true){
				tpl = _.template(alertTpl, {extraClass: 'alert-success', heading: response.msg})
				console.log(data)
				data.id = 2
				//data.uri = api.getApiVersion() + "/profiles/" + 
				scope.papa.addWingToList(data)
			} else tpl = _.template(alertTpl, {extraClass: 'alert-error', heading: response.msg})
			$(tpl).prependTo('#main').delay(800).slideUp(300)
		})
	},
	updateWing: function(evt){
		var scope = this
		$('#accomodation-form').validate()
		evt.preventDefault()
		var data = utils.serializeForm("accomodation-form")
		data.city = this.cityObject
		if ((data.dateStart === "" && data.dateEnd === "") && data.sharingOnce == undefined) {
			delete data.dateStart
			delete data.dateEnd
		}
		api.put(api.getApiVersion() + "/profiles/me/accomodations/" + this.model.get("id"), data, function(response){
			var tpl
			if (response.status === true){
				tpl = _.template(alertTpl, {extraClass: 'alert-success', heading: response.msg})
				scope.close()
				$("body").scrollTop()
				scope.papa.addWingToList(data)
			} else tpl = _.template(alertTpl, {extraClass: 'alert-error', heading: response.msg})
			$(tpl).prependTo('#main').delay(800).slideUp(300)
		})
	},
	deleteWing: function(evt){
		var scope = this
		if (confirm("Are you sure you want to delete this wing?")){
			api.delete(api.getApiVersion() + "/profiles/me/accomodations/" + this.model.get("id"), {}, function(response){
				var tpl
				if (response.status === true){
					scope.wingId = undefined
					scope.close()
					tpl = _.template(alertTpl, {extraClass: 'alert-success', heading: response.msg})
					$("body").scrollTop()
					setTimeout(function(){ scope.parentView.getUserWings() }, 2000)
				} else{
					tpl = _.template(alertTpl, {extraClass: 'alert-error', heading: response.msg})
				}
				$(tpl).prependTo('#main').delay(800).slideUp(300)
			})
		}else{
			return
		}		
	},
  });

  return View;
});