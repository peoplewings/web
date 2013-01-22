define(function(require){

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var utils = require("utils");
	var profileTpl = require('tmpl!templates/app/profile.html');
	var basicTpl = require('tmpl!templates/app/basic-form.html');
	var aboutTpl = require('tmpl!templates/app/about-form.html');
	var likesTpl = require('tmpl!templates/app/likes-form.html');
	var contactTpl = require('tmpl!templates/app/contact-form.html');
	
	var alertTpl = require('tmpl!templates/lib/alert.html');
	var List = require('views/app/list');
	var avatarView = require("views/app/avatar");
	var ProfileModel = require("models/Profile");
	
	var gMaps = require("async!https://maps.googleapis.com/maps/api/js?key=AIzaSyABBKjubUcAk69Kijktx-s0jcNL1cIjZ98&sensor=false&libraries=places&language=en")	
	var mapView = require("views/app/map")
	
	var profileView = Backbone.View.extend({
    	el: "#main",

		months: [
			{ name: 'January'},
			{ name: 'Feburary'},
			{ name: 'March'},
			{ name: 'April'},
			{ name: 'May'},
			{ name: 'June'},
			{ name: 'July'},
			{ name: 'August'},
			{ name: 'September'},
			{ name: 'October'},
			{ name: 'November'},
			{ name: 'December'},
		],
		
		events:{
			"click a#add-language-btn": function(e){
				e.preventDefault();
				this.languagesList.addItem()
			},
			"click button[id^=delete-lang]": function(e){
				e.preventDefault();
				this.languagesList.deleteItem(e)
			},
			"click a#add-edu-btn": function(e){
				e.preventDefault();
				this.educationsList.addItem();
				this.initStudyTypeahead();
			},
			"click button[id^=delete-education]": function(e){
				e.preventDefault();
				this.educationsList.deleteItem(e)
			},
			"click a#add-otherLocation-btn": function(e){
				e.preventDefault();
				
				var added = this.otherLocationsList.addItem()
				var newInput = this.$("#" + added).children("[name=otherLocations]")[0]
				var auto = new google.maps.places.Autocomplete(newInput, { types: ['(cities)'] });
				
				google.maps.event.addListener(auto, 'place_changed', this.updateMap(auto, "other", added));   
				
				$(newInput).keypress(function(event) { if ( event.which == 13 ) event.preventDefault() })
				
			},
			"click button[id^=delete-otherLocation]": function(e){
				e.preventDefault();
				this.otherLocationsList.deleteItem(e)
			},
			"click a#add-social-btn": function(e){
				e.preventDefault();
				this.socialsList.addItem()
			},
			"click button[id^=delete-social]": function(e){
				e.preventDefault();
				this.socialsList.deleteItem(e)
			},
			"click a#add-im-btn": function(e){
				e.preventDefault();
				this.imList.addItem()
			},
			"click button[id^=delete-im]": function(e){
				e.preventDefault();
				this.imList.deleteItem(e)
			},
			"keypress #hometown": function(e) {
				if (e.which == 13) e.preventDefault()
			},
			"keypress #currentCity": function(e) {
				if (e.which == 13) e.preventDefault()
			},
			"keypress #currentCity": function(e) {
				if (e.which == 13) e.preventDefault()
			},
			"keypress [name=otherLocations]": function(e) {
				if (e.which == 13) e.preventDefault()
			},

			"submit form#basic-info-form": "submitProfile",
			"submit form#about-me-form": "submitProfile",
			"submit form#likes-form": "submitProfile",
			"submit form#contact-form": "submitProfile",
		},
		
		initialize: function(options) {
			this.model = new ProfileModel({id: api.getProfileId()})
			this.model.on("change", this.render.bind(this));
		  	this.model.fetch({success: this.render.bind(this) })
			this.map = new mapView({el: "#user-map", id: "mapcanvas"})
		},
		
	    render: function(){		
			$(this.el).html(profileTpl(this.model.toJSON()));

			this.$('#basic-info').html(basicTpl(_.extend(this.model.toJSON(), { month: this.months})));
			this.$('#about-me').html(aboutTpl(this.model.toJSON()));
			this.$('#likes-info').html(likesTpl(this.model.toJSON()));
			this.$('#contact-info').html(contactTpl(this.model.toJSON()));
			
			avatarView.render(this.model.get("avatar"));
			
			this.initLists();
		  	this.initLocationTypeahead();
			this.initStudyTypeahead();
		
		  	this.map.render();		
		  	this.initMarkers();
			
	    },
		
		initLists: function(){
			this.languagesList = new List({
				el: "#languages-list",
				store: this.model.get("languages"),
				key: "language",
				tpl: "#language-tpl",
				values: ["languages", "levels"]
			});
		
			this.educationsList = new List({
				el: "#education-list",
				store: this.model.get("education"),
				key: "edu",
				tpl: "#education-tpl",
				values: ["education", "degree"]
			});
		
			this.socialsList = new List({
				el: "#socialNetwork-list",
				store: this.model.get("socialNetworks"),
				key: "social",
				tpl: "#socialNetwork-tpl",
				values: ["socialNetworks", "snUsername"]
			});
		
			this.imList = new List({
				el: "#instantMessage-list",
				store: this.model.get("instantMessages"),
				key: "im",
				tpl: "#im-tpl",
				values: ["instantMessages", "imUsername"]
			});
		
			this.otherLocationsList = new List({
				el: "#otherLocations-list",
				store: this.model.get("otherLocations"),
				key: "otherLocation",
				tpl: "#otherLocation-tpl",
				values: ["otherLocations", "other-city", "other-region", "other-country", "other-lat", "other-lon"]
			});
		},
		
		initStudyTypeahead: function(){
			
			$.ajaxSetup({
                  beforeSend: function(xhr){
                        xhr.setRequestHeader("X-Auth-Token", api.getAuthToken())
                  },
            });

			$('.autocompleteStudy').typeahead({
	      	ajax: {
	              url: api.getServerUrl() + "/api/v1/universities",
	              triggerLength: 1,
	              method: "get",
	              preDispatch: function (query) {
	                  return {
	                      name: query,
	                  }
	              },
				  onselect: function(){
				  	console.log(arguments)
				  },
	              preProcess: function (data) {
	                  if (data.code !== 200) {
	                      return false;
	                  }
	                  return data.data.map(function(uni){ return uni.name });
	              }
	          }
			})
		},
		
		initLocationTypeahead: function(){
		
			var hometown = new google.maps.places.Autocomplete(document.getElementById("hometownCity"), { types: ['(cities)'] });
			google.maps.event.addListener(hometown, 'place_changed', this.updateMap(hometown, "hometown", "hometown"));   
			
			var current = new google.maps.places.Autocomplete(document.getElementById("currentCity"), { types: ['(cities)'] });
			google.maps.event.addListener(current, 'place_changed', this.updateMap(current, "current", "current"));
			
			var lastId = this.$("#otherLocations-list").children().last().prop("id")
			var last = new google.maps.places.Autocomplete($("#" + lastId).children("[name=otherLocations]")[0], { types: ['(cities)'] });
			google.maps.event.addListener(last, 'place_changed', this.updateMap(last, "other", lastId));
		
		},
		
		updateMap: function(auto, field, id) {
			var sc = this
			return function() {
				var place = auto.getPlace();
				if (place.geometry){
					var cc = utils.getCityAndCountry(place.address_components)
					
					sc.map.setCenter(place.geometry.location);
					sc.map.addMarker(field + Math.random().toString(36).substr(2, 5), place.geometry.location, cc.city + ", " + cc.country)

					sc.$("#" + id + " input[name^=" + field + "-city]").val(cc.city)
					sc.$("#" + id + " input[name^=" + field + "-country]").val(cc.country)
					sc.$("#" + id + " input[name^=" + field + "-region]").val(cc.region)
					sc.$("#" + id + " input[name^=" + field + "-lat]").val(place.geometry.location.lat())
					sc.$("#" + id + " input[name^=" + field + "-lon]").val(place.geometry.location.lng())
				}  
			}
		},
		
		initMarkers: function(sc){
			var sc = this
			
			var city = this.model.get("current")
			this.map.addMarker("current", new google.maps.LatLng(city.lat, city.lon), city.name + ", " + city.country)			
			
			city = this.model.get("hometown")
			this.map.addMarker("hometown", new google.maps.LatLng(city.lat, city.lon), city.name + ", " + city.country)
			
			var others = this.model.get("otherLocations")
			_.each(others, function(location, index){
				sc.map.addMarker(index, new google.maps.LatLng(location.lat, location.lon), location.name + ", " + location.country)
			})
			
			this.map.renderMarkers();
		},
		
		submitProfile: function(e){
			e.preventDefault(e);
			var tpl = null
			var sc = this
			var data = this.collectData()
			
			this.model.save(data)
				.then(function(status){
					$('.alert').remove()
					if (status === true)
						tpl = alertTpl({extraClass: 'alert-success', heading: "Profile updated"})
					else
						tpl = alertTpl({extraClass: 'alert-error', heading: "Profile couldn't be updated" + ": ", message: 'Please try again later'})
				})
				.fin(function(){
					$(sc.el).prepend(tpl)
				})
		},
		
		collectData: function() {
		
			var data = utils.serializeForm('basic-info-form')
			_.extend(data, utils.serializeForm('contact-form'))
			_.extend(data, utils.serializeForm('about-me-form'))
			_.extend(data, utils.serializeForm('likes-form'))
		
			if (data["languages"]){
				if (!(data["languages"] instanceof Array)) {
					data["languages"] = [data["languages"]]
					data["levels"] = [data["levels"]]
				}
				data["languages"] = data["languages"].map(function(item, index){
						return { name: item, level: data["levels"][index] }
				})
				delete data["levels"]
			}
		
			if (data["instantMessages"]){
				if (!(data["instantMessages"] instanceof Array)) {
					data["instantMessages"] = [data["instantMessages"]]
					data["imUsername"] = [data["imUsername"]]
				}
				data["instantMessages"] = data["instantMessages"].map(function(item, index){
						return { instantMessage: item, imUsername: data["imUsername"][index] }
				})
				delete data["imUsername"]
			}
		
			if (data["socialNetworks"]){
				if (!(data["socialNetworks"] instanceof Array)) {
					data["socialNetworks"] = [data["socialNetworks"]]
					data["snUsername"] = [data["snUsername"]]
				}
				data["socialNetworks"] = data["socialNetworks"].map(function(item, index){
						return { socialNetwork: item, snUsername: data["snUsername"][index] }
				})
				delete data["snUsername"]
			}
		
			if (data["education"]){
				if (!(data["education"] instanceof Array)) {
					data["education"] = [data["education"]]
					data["degree"] = [data["degree"]]
				}
				data["education"] = data["education"].map(function(item, index){
						return { institution: item, degree: data["degree"][index] }
				})
				delete data["degree"]
			}
		
			if (data["other-city"]){
				if (!(data["other-city"] instanceof Array)) {
					data["other-city"] = [data["other-city"]]
					data["other-region"] = [data["other-region"]]
					data["other-country"] = [data["other-country"]]
					data["other-lat"] = [data["other-lat"]]
					data["other-lon"] = [data["other-lon"]]
																
				}
				data["otherLocations"] = data["other-city"].map(function(item, index){
						return { 
							name: item, 
							country: data["other-country"][index],
							region:  data["other-region"][index],
							lat:  data["other-lat"][index],
							lon:  data["other-lon"][index]}
				})
				delete data["other-city"]
				delete data["other-country"]
				delete data["other-region"]
				delete data["other-lat"]
				delete data["other-lon"]
			}
			
			if (data["current"]){
				data["current"] =  { 
					name: data["current-city"], 
					country: data["current-country"],
					region:  data["current-region"],
					lat:  data["current-lat"],
					lon:  data["current-lon"]
				}
				delete data["current-city"]
				delete data["current-country"]
				delete data["current-region"]
				delete data["current-lat"]
				delete data["current-lon"]
			}
			
			if (data["hometown"]){
				data["hometown"] =  { 
					name: data["hometown-city"], 
					country: data["hometown-country"],
					region:  data["hometown-region"],
					lat:  data["hometown-lat"],
					lon:  data["hometown-lon"]
				}
				delete data["hometown-city"]
				delete data["hometown-country"]
				delete data["hometown-region"]
				delete data["hometown-lat"]
				delete data["hometown-lon"]
			}
		
			return data;
		},
		
	  });

	  return profileView;
	});