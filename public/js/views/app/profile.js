define([
  'jquery',
  'backbone',
  'utils',
  'api',
  'text!templates/app/profile.html',
  'text!templates/app/basic-form.html',
  'text!templates/app/about-form.html',
  'text!templates/app/likes-form.html',
  'text!templates/app/contact-form.html',
  'text!templates/lib/language-field.html',
  'text!templates/lib/education-field.html',
  'text!templates/lib/social-field.html',
  'text!templates/lib/instant-field.html',
  'text!templates/lib/location-field.html',
  'text!templates/lib/alert.html',
  'models/Profile',
  'views/app/list',
  'views/app/avatar',
], function($, Backbone, utils, api, profileTpl, basicInfoTpl, aboutMeTpl, likesTpl, contactTpl, languageTpl, educationTpl, socialTpl, instantTpl, locationTpl, alertTpl, UserProfile, List, avatarView){
  var profileView = Backbone.View.extend({
    el: "#main",
	markers: [],
	autoCompleteOptions: { types: ['(cities)'] },
	events:{
		"click a#add-language-btn": "addLanguage",
		"click button[id^=delete-lang]": "deleteLanguage",
		"click a#add-education-btn": "addEducation",
		"click button[id^=delete-edu]": "deleteEducation",
		"click a#add-social-btn": "addSocial",
		"click button[id^=delete-social]": "deleteSocial",
		"click a#add-im-btn": "addIM",
		"click button[id^=delete-im]": "deleteIM",
		"click a#add-location-btn": "addLocation",
		"click button[id^=delete-location]": "deleteLocation",
		"submit form#basic-info-form": "submitProfile",
		"submit form#about-me-form": "submitProfile",
		"submit form#likes-form": "submitProfile",
		"submit form#contact-form": "submitProfile",
	},
	initialize: function(options){
		this.model = new UserProfile({id:"me"})
		this.model.bindings = {
			//Basic info 
			gender: '[name=gender]',
			civilState: '[name=civilState]',
			showBirthday: '[name=showBirthday]',
			birthDay: '[name=birthDay]',
			birthMonth: '[name=birthMonth]',
			birthYear: '[name=birthYear]',
			Male: '[name=interestedInM]',
			Female: '[name=interestedInF]',
			//CurrentCity, HomeTown, Other locations
			//About me
			allAboutYou: '[name=allAboutYou]',
			mainMission: '[name=mainMission]',
			occupation: '[name=occupation]',
			company: '[name=company]',
			personalPhilosophy: '[name=personalPhilosophy]',
			politicalOpinion: '[name=politicalOpinion]',
			religion: '[name=religion]',
			// Likes
			movies: '[name=movies]',
			sports: '[name=sports]',
			otherPages: '[name=otherPages]',
			enjoyPeople: '[name=enjoyPeople]',
			sharing: '[name=sharing]',
			quotes: '[name=quotes]',
			incredible: '[name=incredible]',
			pwOpinion: '[name=pwOpinion]',
			inspiredBy: '[name=inspiredBy]',
			// Contact
			emails: '[name=emails]',
			phone: '[name=phone]',
		}
      this._modelBinder = new Backbone.ModelBinder();
	  var sc = this
	  this.model.fetch({ 
			success: function(model){
				console.log("Fetch model:", model, model.bindings)
				sc.render()
			},
			error: function() { console.log(arguments) }	 	
	  })
	},
    render: function(){
      $(this.el).html(profileTpl);

	  $('#basic-info').html(basicInfoTpl)
	  $('#about-me').html(aboutMeTpl)
	  $('#likes-info').html(likesTpl)
	  $('#contact-info').html(contactTpl)
	  avatarView.render('http://peoplewings-backend.herokuapp.com' + this.model.get("avatar"))
	  //Clears bindings for languages and educations
	  this.clearBindings()
	  //Takes care of languages, intializes bindings, etc
	  this.initLanguages()
	  //Takes care of educations, intializes bindings, etc
	  this.initEducations()
	  //Takes care of social networks
	  this.initSocials()
	  //Takes care of instant Messages
	  this.initIM()
	  //Map
	  this.initCanvas()
	  
	  $('.foo').typeahead({
                                        ajax: {
                                              url: "http://peoplewings-backend.herokuapp.com/ajax/search/university/",
                                              timeout: 500,
                                              //displayField: "name",
                                              triggerLength: 1,
                                              method: "get",
                                              //loadingClass: "loading-circle",
                                              preDispatch: function (query) {
                                                  //showLoadingMask(true);
                                                  return {
                                                      q: query,
                                                      otherParam: 123
                                                  }
                                              },
										onselect: function(){
											console.log(arguments)
										},
                                              preProcess: function (data) {
                                                  //showLoadingMask(false);
                                                  if (data.code !== 200) {
                                                      return false;
                                                  }
                                                  return data.data;
                                                              
                                              }
                                          }})
	  
    },
	close: function(){ 
		this._modelBinder.unbind()
	},
	submitProfile: function(e){
		e.preventDefault(e);
		console.log('Submit profile ' + e.target.id)
		console.log(this.model.attributes, this.model.bindings)
		this.model.save()
	},
	initLanguages: function(){
	  if (this.languagesCount === 0){
	    var tpl = _.template(languageTpl, {index: 1})
		$('#languages-list').prepend(tpl)
		this.model.bindings["x_language_1"] = '[name=language-1]'
		this.model.bindings["x_level_1"] = '[name=level-1]'
		this.languagesCount = 1
	  }else this.setLanguages(this.model.get("languages"))
		
	  this._modelBinder.bind(this.model, this.el, this.model.bindings)
	  
	},
	setLanguages: function(languages){
		//console.log(languages)
		var size = languages.length
		for (var i = 1; i < size + 1; i++){
			var tpl = _.template(languageTpl, {index: i})
			$('#languages-list').append(tpl)
		}
		var s
		var sc = this
		$.each(languages, function(i, field){
			s = i + 1 + ""
			sc.model.bindings["x_language_" + s] = '[name=language-' + s +']'
			sc.model.bindings["x_level_" + s] = '[name=level-' + s +']'
		})
		this.languagesCount += size
	},
	addLanguage: function(e){
		//console.log(this.languagesCount)
		//if (this.languagesCount == 4) return false
		e.preventDefault(e);
		var langs = $('div[id^=select-lang-]').length + 1
		this.model.set("x_language_" + langs)
		this.model.set("x_level_" + langs)
		var tpl = _.template(languageTpl, {index: langs})
		this.model.bindings["x_language_" + langs] = '[name=language-' + langs +']'
		this.model.bindings["x_level_" + langs] = '[name=level-' + langs +']'
		$('div[id^=select-lang-]:last').after(tpl)
		this.languagesCount++
		this._modelBinder.bind(this.model, this.el, this.model.bindings)
		return false;
	},
	deleteLanguage: function(e){
		if (this.languagesCount == 1) return false
		var id = e.target.id.split("-", 3)
		id = id[id.length-1]
		$("#select-lang-" + id).remove()
		delete this.model.bindings["x_language_" + id]
		delete this.model.bindings["x_level_" + id]
		this.model.unset("x_language_" + id)
		this.model.unset("x_level_" + id)
		this.languagesCount--
	},
	clearBindings: function(){
		for (binding in this.model.bindings){
			if (binding.indexOf('x_') == 0){
				delete this.model.bindings[binding]
			} 
		}
	},
	initEducations: function(){
		this.educationList = new List({
			el: "#education-list", 
			tpl: educationTpl, 
			keys: ["institution", "degree"],
			items: this.model.get("education"),
			itemId: 'select-study',
			extraCls: 'foo'
		})
		this.educationList.render()
		this._modelBinder.bind(this.model, this.el, this.model.bindings)
	},
	addEducation: function(e){
		e.preventDefault(e);
		this.educationList.addItem();
		this._modelBinder.bind(this.model, this.el, this.model.bindings)
		return false
	},
	deleteEducation: function(e){
		console.log("Delete education", e.target.id)
		this.educationList.deleteItem(e.target.id)
		return false
	},
	initSocials: function(){
		this.socialList = new List({
			el: "#socialNetwork-list", 
			tpl: socialTpl, 
			keys: ["socialNetwork", "snUsername"],
			items: this.model.get("socialNetworks"),
			itemId: 'select-social',
			extraCls: ''
		})
		this.socialList.render()
		this._modelBinder.bind(this.model, this.el, this.model.bindings)
	},
	addSocial: function(e){
		e.preventDefault(e);
		this.socialList.addItem();
		this._modelBinder.bind(this.model, this.el, this.model.bindings)
		return false
	},
	deleteSocial: function(e){
		this.socialList.deleteItem(e.target.id)
		return false
	},
	initIM: function(){
		this.imList = new List({
			el: "#instantMessage-list", 
			tpl: instantTpl, 
			keys: ["instantMessage", "imUsername"],
			items: this.model.get("instantMessages"),
			itemId: 'select-im',
			extraCls: ''
		})
		this.imList.render()
		this._modelBinder.bind(this.model, this.el, this.model.bindings)
	},
	addIM: function(e){
		e.preventDefault(e);
		this.im.addItem();
		this._modelBinder.bind(this.model, this.el, this.model.bindings)
		return false
	},
	deleteIM: function(e){
		this.imList.deleteItem(e.target.id)
		return false
	},
	initCanvas: function(){
		var sc = this
		this.bindCities()
		this.initOtherLocations()
		require(['async!https://maps.googleapis.com/maps/api/js?key=AIzaSyABBKjubUcAk69Kijktx-s0jcNL1cIjZ98&sensor=false&libraries=places&language=en'], 
		function(){
			
	        var mapcanvas = $(document.createElement('div'));
	        var latlng = new google.maps.LatLng(0,0);
	        
			mapcanvas.attr({ id: 'mapcanvas', style: 'height:300px;margin-left:160px;'}).addClass('span6');
	        $('#otherLocations-group').append(mapcanvas)
        
	        var myOptions = { zoom: 1, center: latlng, mapTypeControl: false, streetViewControl: false, navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL}, mapTypeId: google.maps.MapTypeId.ROADMAP }
	        sc.map = new google.maps.Map(document.getElementById("mapcanvas"), myOptions);
	 		//console.log("Map created:", sc.map)
			
			var options = { types: ['(cities)'] };
        
	        var autoHome = new google.maps.places.Autocomplete(document.getElementById("hometown"), sc.autoCompleteOptions);
	        var autoCurrent = new google.maps.places.Autocomplete(document.getElementById("currentCity"), sc.autoCompleteOptions);
			
			var id_last = $("[name^=name-]:last").attr("id")
	        var autoOther = new google.maps.places.Autocomplete(document.getElementById(id_last), sc.autoCompleteOptions);
	
			google.maps.event.addListener(autoHome, 'place_changed', sc.setAutocomplete(autoHome, "hometown", sc.map));   
            google.maps.event.addListener(autoCurrent, 'place_changed', sc.setAutocomplete(autoCurrent, "current", sc.map));
			google.maps.event.addListener(autoOther, 'place_changed', sc.setAutocomplete(autoOther, "name_" + id_last.split("-", 2)[1], sc.map));
			$("#hometown").keypress(function(event) { if ( event.which == 13 ) event.preventDefault() })
			$("#currentCity").keypress(function(event) { if ( event.which == 13 ) event.preventDefault() })
			$("#" + id_last).keypress(function(event) { if ( event.which == 13 ) event.preventDefault() })
			
			sc.setInitialMarkers(sc)
  		    
		})
	},
	bindCities: function(){
		//Bind lat lon also
		this.model.bindings['x_current'] = '[name=current]'
		this.model.bindings['x_hometown'] = '[name=hometown]'
		this._modelBinder.bind(this.model, this.el, this.model.bindings)
	},
	initOtherLocations: function(){
		this.locationList = new List({
			el: "#otherLocations-list", 
			tpl: locationTpl, 
			keys: ["name"],
			items: this.model.get("otherLocations"),
			itemId: 'select-location',
			extraCls: ''
		})
		this.locationList.render()
		this._modelBinder.bind(this.model, this.el, this.model.bindings)
	},
	addLocation: function(e){
		e.preventDefault(e);
		this.locationList.addItem();

		var sc = this
 		//console.log("Map on Add:", sc.map)
		var id_last = $("[name^=name-]:last").attr("id")
		var autoOther = new google.maps.places.Autocomplete(document.getElementById(id_last), sc.autoCompleteOptions);
		google.maps.event.addListener(autoOther, 'place_changed', sc.setAutocomplete(autoOther, "name_" + id_last.split("-", 2)[1], this.map));
		$("#" + id_last).keypress(function(event) { if ( event.which == 13 ) event.preventDefault() })

		this._modelBinder.bind(this.model, this.el, this.model.bindings)
		return false
	},
	deleteLocation: function(e){
		var sc = this
		var id = e.target.id.split("-", 3)[2]
		console.log("DeleteLocation:", id, this.model.get("x_name_" + id).split(",", 1)[0])
		var locs = this.model.get("otherLocations")
		locs = _(locs).reject(function(el) { return el.name === sc.model.get("x_name_" + id).split(",", 1)[0] });
		this.model.set("otherLocations", locs)
		this.locationList.deleteItem(e.target.id)
		return false
	},
	setInitialMarkers: function(sc){
		var	marker, city
		var locs = sc.model.get("otherLocations")
		for ( loc in locs) {
			city = locs[loc]
			marker = new google.maps.Marker({
					map: sc.map,
					position: new google.maps.LatLng(city.lat, city.lon),
					title: city.name + ", " + city.country
			})
		}
		city = sc.model.get("current")
		marker = new google.maps.Marker({
					map: sc.map,
					position: new google.maps.LatLng(city.lat, city.lon),
					title: city.name + ", " + city.country,
					icon: 'img/yellow-marker.png'
		})
		city = sc.model.get("hometown")
		marker = new google.maps.Marker({
					map: sc.map,
					position: new google.maps.LatLng(city.lat, city.lon),
					title: city.name + ", " + city.country,
					icon: 'img/blue-marker.png'
		})
	},
	setAutocomplete: function(auto, field){
		var sc = this
		console.log(field)
		return function(){
   			var place = auto.getPlace();
			if (place.geometry){
				var cc = sc.getCityAndCountry(place.address_components)
				sc.map.setCenter(place.geometry.location);
				var	marker = new google.maps.Marker({
						map: sc.map,
						position: place.geometry.location,
				});
				sc.markers.push(marker)
				if (field.indexOf("name_") == 0){
					console.log("Updating otherLocs:", field)
					var locs = sc.model.get("otherLocations")
					locs.push({ country: cc.country, region: cc.region, name: cc.city, lat: place.geometry.location.lat(), lon: place.geometry.location.lng()})
					sc.model.set("otherLocations", locs)
				} else sc.model.set(field, { country: cc.country, region: cc.region, name: cc.city, lat: place.geometry.location.lat(), lon: place.geometry.location.lng()})                     
				sc.model.set("x_" + field, cc.city + ", " + cc.region + ", " + cc.country)	
			}
		}
	},
	clearMapMarkers: function(){
		for (var i = 0; i < this.markers.length; i++ ) {
    		this.markers[i].setMap(null);
  		}
	},
	getCityAndCountry: function(address_components){
		var data = {}
		var component
		for (obj in address_components){
			component = address_components[obj]
			for ( type in component.types){
				switch(component.types[type]){
					case "locality": data.city = component.long_name
									 break;
					case "country": data.country = component.long_name
									 break;
					case "administrative_area_level_1": data.region = component.long_name
									 					break;
				}
			}
		  }
		return data
	}
  });

  return profileView;
});