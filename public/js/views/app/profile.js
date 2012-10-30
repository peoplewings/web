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
], function($, Backbone, utils, api, profileTpl, basicInfoTpl, aboutMeTpl, likesTpl, contactTpl, languageTpl, educationTpl, socialTpl, instantTpl, locationTpl, alertTpl, UserProfile, List){
  var profileView = Backbone.View.extend({
    el: "#main",
	events:{
		"click a#add-language-btn": "addLanguage",
		"click button[id^=delete-lang]": "deleteLanguage",
		"click a#add-education-btn": "addEducation",
		"click button[id^=delete-edu]": "deleteEducation",
		"click a#add-social-btn": "addSocial",
		"click button[id^=delete-social]": "deleteSocial",
		"click a#add-im-btn": "addIM",
		"click button[id^=delete-im]": "deleteIM",
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
				console.log("Fetch model:", model)
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
		this.bindCities()
		this.initOtherLocations()
		console.log('init Canvas')
		require(['async!https://maps.googleapis.com/maps/api/js?key=AIzaSyABBKjubUcAk69Kijktx-s0jcNL1cIjZ98&sensor=false&libraries=places'], 
		function(){
			
	        var options = {
	        	types: ['(cities)'], 
	        };
        
	        var home = document.getElementById("hometown");
	        var auto_home = new google.maps.places.Autocomplete(home, options);
	        var current = document.getElementById("currentCity");
	        var auto_current = new google.maps.places.Autocomplete(current, options);
			var id_last = $("[name^=name-]:last").attr("id")
	        var other = document.getElementById(id_last);
	        var auto_other = new google.maps.places.Autocomplete(other, options);


	        var mapcanvas = $( document.createElement('div') );
	        var latlng = new google.maps.LatLng(0,0);
        
	        $.markers = []   
        
	        mapcanvas.attr({ id: 'mapcanvas', style: 'height:300px;margin-left:160px;'}).addClass('span6');
        
	        $('#otherLocations-group').append(mapcanvas)
        
	        var myOptions = { zoom: 1, center: latlng, mapTypeControl: false, streetViewControl: false, navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL}, mapTypeId: google.maps.MapTypeId.ROADMAP }
        
	        var map = new google.maps.Map(document.getElementById("mapcanvas"), myOptions);
	 		$("#hometown").keypress(function(event) {
                        if ( event.which == 13 ) {
                                event.preventDefault();
                                }
                })
             $("#currentCity").keypress(function(event) {
                             if ( event.which == 13 ) {
                             event.preventDefault();
                             }
             })
             $("#" + id_last).keypress(function(event) {
                             if ( event.which == 13 ) {
                             event.preventDefault();
                             }
             })
			google.maps.event.addListener(auto_home, 'place_changed',       function() {
   				var place = auto_home.getPlace();
				var cc = getCityAndCountry(place.address_components)
				map.setCenter(place.geometry.location);
				if (!$.homeMarker){
					$.homeMarker = new google.maps.Marker({
						map: map,
						position: place.geometry.location,
					});
				} else $.homeMarker.setPosition(place.geometry.location)                        
             });
                        
             google.maps.event.addListener(auto_current, 'place_changed',    function() {
             	var place = auto_current.getPlace();
	            var cc = getCityAndCountry(place.address_components)
				map.setCenter(place.geometry.location);
	            if (!$.currentMarker){
	                    $.currentMarker = new google.maps.Marker({
	            			map: map,
	            			position: place.geometry.location,
	            		});
	            } else $.currentMarker.setPosition(place.geometry.location)                     
              });
				
			  function getCityAndCountry(address_components){
                        console.dir(address_components)
                        var data = { id: address_components.id }
                        var l = address_components.length
                        for (var i = 0; i < l; i++){
                                if (address_components[i].types[0] === 'locality') {
                                        //console.log("City: " + address_components[i].long_name + ", " + address_components[i].short_name )
                                        data.city = address_components[i].long_name
                                }
                                else if (address_components[i].types[0] === 'country') {
                                        //console.log("Country: " + address_components[i].long_name + ", " + address_components[i].short_name )
                                        data.country = address_components[i].long_name
                                }
                        }
                        return data
                }
		})      
	},
	bindCities: function(){
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
		console.log(this.model.attributes, this.model.bindings)
		this._modelBinder.bind(this.model, this.el, this.model.bindings)
	}
  });

  return profileView;
});