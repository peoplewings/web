//jshint camelcase:false, sub:true

define(function(require){

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var utils = require("utils");
	var phrases = require('phrases');

	var basicTpl = require('tmpl!templates/app/profile/form.basic.html');
	var aboutTpl = require('tmpl!templates/app/profile/form.about.html');
	var likesTpl = require('tmpl!templates/app/profile/form.likes.html');
	var contactTpl = require('tmpl!templates/app/profile/form.contact.html');
	var placesTpl = require('tmpl!templates/app/profile/form.places.html');

	var alerts = require('views/lib/alerts');
	var List = require('views/app/list');
	var AvatarView = require("views/app/Avatar");

	function extract(source, props) {
		var target = {};
		_.each(props, function(value, key) {
			target[value] = source[key];
		});
		return target;
	}


	var ProfileView = Backbone.View.extend({
		el: "#main",
		events:{
			"click a#add-language-btn": function(e){
				e.preventDefault();
				this.languagesList.addItem();
			},
			"click button[id^=delete-lang]": function(e){
				e.preventDefault();
				this.languagesList.deleteItem(e);
			},
			"click a#add-edu-btn": function(e){
				e.preventDefault();
				this.educationsList.addItem();
				this.initStudyTypeahead();
			},
			"click button[id^=delete-edu]": function(e){
				e.preventDefault();
				this.educationsList.deleteItem(e);
			},
			"click a#add-otherLocation-btn": function(e){
				e.preventDefault();

				var added = this.otherLocationsList.addItem();
				var newInput = this.$("#" + added).children("[name=otherLocations]")[0];
				var auto = new google.maps.places.Autocomplete(newInput, { types: ['(cities)'] });

				google.maps.event.addListener(auto, 'place_changed', this.updateMap(auto, "other", added));
				$(newInput).keypress(function(event) { if ( event.which === 13 ) event.preventDefault(); });
			},
			"click button[id^=delete-otherLocation]": function(e){
				e.preventDefault();
				var id = e.target.id.split("delete-")[1];
				this.otherLocationsList.deleteItem(e);
				this.parentCtrl.map.deleteMarker(id);
			},
			"click a#add-social-btn": function(e){
				e.preventDefault();
				this.socialsList.addItem();
			},
			"click button[id^=delete-social]": function(e){
				e.preventDefault();
				this.socialsList.deleteItem(e);
			},
			"click a#add-im-btn": function(e){
				e.preventDefault();
				this.imList.addItem();
			},
			"click button[id^=delete-im]": function(e){
				e.preventDefault();
				this.imList.deleteItem(e);
			},
			"keypress #hometown": function(e) {
				if (e.which === 13) e.preventDefault();
			},
			"keypress #currentCity": function(e) {
				if (e.which === 13) e.preventDefault();
			},
			"keypress [name=otherLocations]": function(e) {
				if (e.which === 13) e.preventDefault();
			},

			"submit form#basic-info-form": "submitProfile",
			"submit form#about-me-form": "submitProfile",
			"submit form#likes-form": "submitProfile",
			"submit form#contact-form": "submitProfile",
			"submit form#places-form": "submitProfile",
			"click .edit-box-btn" : "openForm",
			"click button.cancel-edition-btn": "closeBox",

			"mouseenter #collapse-photos li" : function(e){
				$(e.target).parents('li').find('.control').show();
			},

			"mouseleave #collapse-photos li" : function(e){
				$(e.target).parents('li').find('.control').hide();
			}
		},

		initialize: function(model, parent) {
			this.model = model;
			this.parentCtrl = parent;
		},

		closeBox: function(evt){
			evt.preventDefault();
			var boxId = $(evt.target).parent().attr("data-rel") || $(evt.target).attr("data-rel");
			this.parentCtrl.refreshBox(boxId);
		},

		reloadBox: function(evt){
			evt.preventDefault();
			var boxId = $(evt.target).parent().attr("data-rel") || $(evt.target).attr("data-rel");
			this.parentCtrl.renderBox(boxId);
		},

		openForm: function(evt){

			var boxId = $(evt.target).parent().attr("data-rel") || $(evt.target).attr("data-rel");
			var box = document.getElementById(boxId);
			var tpl = null;
			var initMethod = null;

			$(box).children().remove();

			switch (boxId){
				case "basic-box":
					tpl = basicTpl(this.model.toJSON(), {months: phrases.months});
					initMethod = this.editBasicBox.bind(this);
					break;
				case "about-box":
					tpl = aboutTpl(this.model.toJSON());
					initMethod = this.editAboutBox.bind(this);
					break;
				case "likes-box":
					tpl = likesTpl(this.model.toJSON());
					break;
				case "contact-box":
					tpl = contactTpl(this.model.toJSON());
					initMethod = this.editContactBox.bind(this);
					break;
				case "places-box":
					tpl = placesTpl(this.model.toJSON());
					initMethod = this.editPlacesBox.bind(this);
					break;
			}

			$(box).html(tpl);
			if (initMethod)
				initMethod();

		},

		refresh: function() {
			this.avatar = new AvatarView();
			this.refresh = function() { };
		},

		editBasicBox: function(){
			this.languagesList = new List({
				el: "#languages-list",
				store: this.model.get("languages"),
				key: "language",
				tpl: "#language-tpl",
			});
		},

		editAboutBox: function(){
			this.educationsList = new List({
				el: "#education-list",
				store: this.model.get("education"),
				key: "edu",
				tpl: "#education-tpl",
			});

			this.initStudyTypeahead();
		},

		editContactBox: function(){
			this.socialsList = new List({
				el: "#socialNetwork-list",
				store: this.model.get("socialNetworks"),
				key: "social",
				tpl: "#socialNetwork-tpl",
			});

			this.imList = new List({
				el: "#instantMessage-list",
				store: this.model.get("instantMessages"),
				key: "im",
				tpl: "#im-tpl",
			});
		},

		editPlacesBox: function(){
			this.otherLocationsList = new List({
				el: "#otherLocations-list",
				store: this.model.get("otherLocations"),
				key: "otherLocation",
				tpl: "#otherLocation-tpl",
			});

			this.parentCtrl.map.render();

			this.initLocationTypeahead();
		},

		initStudyTypeahead: function(){

			$.ajaxSetup({
				beforeSend: function(xhr){
					xhr.setRequestHeader("X-Auth-Token", api.getAuthToken());
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
						};
					},
					/*onselect: function(){
						console.log(arguments);
					},*/
					preProcess: function (data) {
						if (!data.status)
							return false;
						return data.data.map(function(uni){ return uni.name; });
					}
				}
			});
		},

		initLocationTypeahead: function(){

			var hometown = new google.maps.places.Autocomplete(document.getElementById("hometownCity"), { types: ['(cities)'] });
			google.maps.event.addListener(hometown, 'place_changed', this.updateMap(hometown, "hometown", "hometown"));

			var current = new google.maps.places.Autocomplete(document.getElementById("currentCity"), { types: ['(cities)'] });
			google.maps.event.addListener(current, 'place_changed', this.updateMap(current, "current", "current"));

			var lastId = this.$("#otherLocations-list").children().last().prop("id");
			var last = new google.maps.places.Autocomplete($("#" + lastId).children("[name=otherLocations]")[0], { types: ['(cities)'] });
			google.maps.event.addListener(last, 'place_changed', this.updateMap(last, "other", lastId));

		},

		updateMap: function(auto, field, id) {
			var sc = this.parentCtrl;
			return function() {
				var place = auto.getPlace();
				if (place.geometry){
					var cc = utils.getCityAndCountry(place.address_components);

					sc.map.setCenter(place.geometry.location);
					sc.map.addMarker({
						id: id,
						location: place.geometry.location,
						title: cc.city + ", " + cc.country,
						icon: 'img/places-' + field + '-marker.png'
					});

					sc.$("#" + id + " input[name^=" + field + "-city]").val(cc.city);
					sc.$("#" + id + " input[name^=" + field + "-country]").val(cc.country);
					sc.$("#" + id + " input[name^=" + field + "-region]").val(cc.region);
					sc.$("#" + id + " input[name^=" + field + "-lat]").val(place.geometry.location.lat());
					sc.$("#" + id + " input[name^=" + field + "-lon]").val(place.geometry.location.lng());
				}
			};
		},

		submitProfile: function(e){
			e.preventDefault(e);
			var data = this.collectData(e.target.id);

			$(e.target)
				.parent()
				.parent()
				.find("#save-profile-btn")
				.button('loading');

			var self = this;
			this.model.save(data)
				.then(function(){
					alerts.success('Profile saved');
				})
				.fin(function(){
					self.$("#save-profile-btn").button('reset');
					self.reloadBox(e);
				});
		},

		collectData: function(formId) {
			var data = utils.serializeForm(formId);
			_.extend(data, utils.serializeForm('contact-form'));
			_.extend(data, utils.serializeForm('about-me-form'));
			_.extend(data, utils.serializeForm('likes-form'));

			if (data["languages"]){
				if (!(data["languages"] instanceof Array)) {
					data["languages"] = [data["languages"]];
					data["levels"] = [data["levels"]];
				}
				data["languages"] = data["languages"].map(function(item, index){
					return { name: item, level: data["levels"][index] };
				});
				delete data["levels"];
			}
			if (data["instantMessages"]){
				if (!(data["instantMessages"] instanceof Array)) {
					data["instantMessages"] = [data["instantMessages"]];
					data["imUsername"] = [data["imUsername"]];
				}
				data["instantMessages"] = data["instantMessages"].map(function(item, index){
					return { instantMessage: item, imUsername: data["imUsername"][index] };
				});
				delete data["imUsername"];
			}

			if (data["socialNetworks"]){
				if (!(data["socialNetworks"] instanceof Array)) {
					data["socialNetworks"] = [data["socialNetworks"]];
					data["snUsername"] = [data["snUsername"]];
				}
				data["socialNetworks"] = data["socialNetworks"].map(function(item, index){
					return { socialNetwork: item, snUsername: data["snUsername"][index] };
				});
				delete data["snUsername"];
			}

			if (data["education"] && !(data["education"] instanceof Array)) {
				data["education"] = [data["education"]];
			}

			if (data["other-city"]){
				if (!(data["other-city"] instanceof Array)) {
					data["other-city"] = [data["other-city"]];
					data["other-region"] = [data["other-region"]];
					data["other-country"] = [data["other-country"]];
					data["other-lat"] = [data["other-lat"]];
					data["other-lon"] = [data["other-lon"]];
				}

				data["otherLocations"] = data["other-city"].map(function(item, index){
					return {
						name: item,
						country: data["other-country"][index],
						region:  data["other-region"][index],
						lat:  data["other-lat"][index],
						lon:  data["other-lon"][index]
					};
				});

				delete data["other-city"];
				delete data["other-country"];
				delete data["other-region"];
				delete data["other-lat"];
				delete data["other-lon"];
			} else data["otherLocations"] = [];

			if (data.current) {
				var currentProps = {
					'current-city': 'name',
					'current-country': 'country',
					'current-region': 'region',
					'current-lat': 'lat',
					'current-lon': 'lon'
				};
				data.current = data.current ? extract(data, currentProps) : {};
				data = _.omit.apply(_, [data].concat(_.keys(currentProps)));
			}

			if (data.hometown) {
				var hometownProps = {
					'hometown-city': 'name',
					'hometown-country': 'country',
					'hometown-region': 'region',
					'hometown-lat': 'lat',
					'hometown-lon': 'lon'
				};
				data.hometown = data.hometown ? extract(data, hometownProps) : {};
				data = _.omit.apply(_, [data].concat(_.keys(hometownProps)));
			}

			return data;
		},
	  });

	  return ProfileView;
	});
