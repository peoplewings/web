//jshint camelcase:false, sub:true

define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var api = require('api');
	var utils = require('utils');
	var texts = require('tools/texts');
	var blitline = require('tools/blitline');

	var spinner = require('views/lib/spinner');
	var alerts = require('views/lib/alerts');
	var List = require('views/app/list');
	var AvatarView = require('views/app/Avatar');
	var LandscapeView = require('views/app/Landscape');

	var formsTpl = {
		'basic': require('tmpl!templates/app/profile/form.basic.html'),
		'about': require('tmpl!templates/app/profile/form.about.html'),
		'likes': require('tmpl!templates/app/profile/form.likes.html'),
		'contact': require('tmpl!templates/app/profile/form.contact.html'),
		'places': require('tmpl!templates/app/profile/form.places.html'),
	};


	var ProfileView = Backbone.View.extend({
		el: '#main',

		events:{
			'click a#add-language-btn': function(e) {
				e.preventDefault();
				this.languagesList.addItem();
			},
			'click button[id^=delete-lang]': function(e) {
				e.preventDefault();
				this.languagesList.deleteItem(e);
			},
			'click a#add-edu-btn': function(e) {
				e.preventDefault();
				this.educationsList.addItem();
				this.initStudyTypeahead();
			},
			'click button[id^=delete-edu]': function(e) {
				e.preventDefault();
				this.educationsList.deleteItem(e);
			},
			'click a#add-otherLocation-btn': function(e) {
				e.preventDefault();

				var added = this.otherLocationsList.addItem();
				var newInput = this.$('#' + added).children('[name=otherLocations]')[0];
				var auto = new google.maps.places.Autocomplete(newInput, { types: ['(cities)'] });

				google.maps.event.addListener(auto, 'place_changed', this.updateMap(auto, 'other', added));
				$(newInput).keypress(function(event) { if ( event.which === 13 ) event.preventDefault(); });
			},
			'click button[id^=delete-otherLocation]': function(e) {
				e.preventDefault();
				var id = e.target.id.split('delete-')[1];
				this.otherLocationsList.deleteItem(e);
				this.parentCtrl.map.deleteMarker(id);
			},
			'click a#add-social-btn': function(e) {
				e.preventDefault();
				this.socialsList.addItem();
			},
			'click button[id^=delete-social]': function(e) {
				e.preventDefault();
				this.socialsList.deleteItem(e);
			},
			'click a#add-im-btn': function(e) {
				e.preventDefault();
				this.imList.addItem();
			},
			'click button[id^=delete-im]': function(e) {
				e.preventDefault();
				this.imList.deleteItem(e);
			},
			'keypress #hometown': function(e) {
				if (e.which === 13) e.preventDefault();
			},
			'keypress #currentCity': function(e) {
				if (e.which === 13) e.preventDefault();
			},
			'keypress [name=otherLocations]': function(e) {
				if (e.which === 13) e.preventDefault();
			},
			'submit form#basic-info-form': 'submitProfile',
			'submit form#about-me-form': 'submitProfile',
			'submit form#likes-form': 'submitProfile',
			'submit form#contact-form': 'submitProfile',
			'submit form#places-form': 'submitProfile',
			'click .edit-box-btn' : 'openForm',
			'click button.cancel-edition-btn': 'closeBox',
			'click .see-more': 'gradientBoxVisiblity',
			'click .see-less': 'gradientBoxVisiblity',
		},


		initialize: function(model, parent) {
			this.model = model;
			this.parentCtrl = parent;
		},

		closeBox: function(event) {
			event.preventDefault();
			var boxName = this._getBoxName(event.target);
			this.parentCtrl.refreshBox(boxName);
		},

		reloadBox: function(event) {
			event.preventDefault();
			var boxName = this._getBoxName(event.target);
			this.parentCtrl.renderBox(boxName);
		},

		_getBoxName: function(target) {
			target = $(target);
			var id = target.parent().attr('data-rel') || target.attr('data-rel');
			return id.split('-')[0];
		},

		openForm: function(event) {
			var boxName = this._getBoxName(event.target);
			var html = formsTpl[boxName](this.model.toJSON(), {
				myProfile: this.model.isMyProfile(),
				months: texts.months,
			});

			this.$('#' + boxName + '-box').html(html);
			this.initBox[boxName].call(this);
		},

		refresh: function() {
			this.avatar = new AvatarView();
			this.landscape = new LandscapeView();
			this.refresh = function() { };
		},

		initBox: {
			'basic': function() {
				this.languagesList = new List({
					el: '#languages-list',
					store: this.model.get('languages'),
					key: 'language',
					tpl: '#language-tpl',
				});
			},

			'about': function() {
				this.educationsList = new List({
					el: '#education-list',
					store: this.model.get('education'),
					key: 'edu',
					tpl: '#education-tpl',
				});

				this.initStudyTypeahead();
			},

			'likes': function() {

			},

			'contact': function() {
				this.socialsList = new List({
					el: '#socialNetwork-list',
					store: this.model.get('socialNetworks'),
					key: 'social',
					tpl: '#socialNetwork-tpl',
				});

				this.imList = new List({
					el: '#instantMessage-list',
					store: this.model.get('instantMessages'),
					key: 'im',
					tpl: '#im-tpl',
				});
			},

			'places': function() {
				this.otherLocationsList = new List({
					el: '#otherLocations-list',
					store: this.model.get('otherLocations'),
					key: 'otherLocation',
					tpl: '#otherLocation-tpl',
				});

				this.parentCtrl.map.render();
				this.initLocationTypeahead();
			},
		},

		initStudyTypeahead: function() {
			$.ajaxSetup({
				beforeSend: function(xhr) {
					xhr.setRequestHeader('X-Auth-Token', api.getAuthToken());
				},
			});

			$('.autocompleteStudy').typeahead({
				ajax: {
					url: api.getServerUrl() + '/api/v1/universities',
					triggerLength: 1,
					method: 'get',
					preDispatch: function (query) {
						return { name: query };
					},
					preProcess: function (data) {
						if (!data.status) return false;
						return data.data.map(function(uni) { return uni.name; });
					}
				}
			});
		},

		initLocationTypeahead: function() {
			var hometown = new google.maps.places.Autocomplete(document.getElementById('hometownCity'), { types: ['(cities)'] });
			google.maps.event.addListener(hometown, 'place_changed', this.updateMap(hometown, 'hometown', 'hometown'));

			var current = new google.maps.places.Autocomplete(document.getElementById('currentCity'), { types: ['(cities)'] });
			google.maps.event.addListener(current, 'place_changed', this.updateMap(current, 'current', 'current'));

			var lastId = this.$('#otherLocations-list').children().last().prop('id');
			var last = new google.maps.places.Autocomplete($('#' + lastId).children('[name=otherLocations]')[0], { types: ['(cities)'] });
			google.maps.event.addListener(last, 'place_changed', this.updateMap(last, 'other', lastId));
		},

		updateMap: function(auto, field, id) {
			var self = this.parentCtrl;
			return function() {
				var place = auto.getPlace();
				if (place.geometry) {
					var cc = utils.getCityAndCountry(place.address_components);

					self.map.setCenter(place.geometry.location);
					self.map.addMarker({
						id: id,
						location: place.geometry.location,
						title: cc.city + ', ' + cc.country,
						icon: 'img/places-' + field + '-marker.png'
					});

					self.$('#' + id + ' input[name^=' + field + '-city]').val(cc.city);
					self.$('#' + id + ' input[name^=' + field + '-country]').val(cc.country);
					self.$('#' + id + ' input[name^=' + field + '-region]').val(cc.region);
					self.$('#' + id + ' input[name^=' + field + '-lat]').val(place.geometry.location.lat());
					self.$('#' + id + ' input[name^=' + field + '-lon]').val(place.geometry.location.lng());
				}
			};
		},

		uploadFile: function(event) {
			var files = event.target.files;
			//Maximum file size: 6Mb
			if (files[0].size > 6291456) {
				alerts.error('Maximum file size allowed is 6 MB');
				return;
			}

			if (!files.length)
				return;

			spinner.show('avatar');
			utils.uploadAmazon(files[0], 'to-resize').then(this.uploadComplete);
		},

		uploadComplete: function(url) {
			var jobs = [{
				'application_id': '7XqmahVqL8tvhEIjzBm6-jg',
				'src': url,

				'functions': [{
					'name': 'resize_to_fit',
					'params': {
						'width': this.defaultMaxWidth,
						'height': this.defaultMaxWidth
					},
					'save': {
						'image_identifier': 'external_sample_1'
					}
				}]
			}];

			blitline.submit(jobs, this.resizeComplete);
		},

		submitProfile: function(e) {
			e.preventDefault(e);
			var data = this.collectData(e.target.id);

			$(e.target)
				.parent()
				.parent()
				.find('#save-profile-btn')
				.button('loading');

			var self = this;
			this.model.save(data).then(function() {
				alerts.success('Profile saved');
			}).fin(function() {
				self.$('#save-profile-btn').button('reset');
				self.reloadBox(e);
			});
		},

		collectData: function(formId) {
			var data = _.extend(
				utils.serializeForm(formId),
				utils.serializeForm('contact-form'),
				utils.serializeForm('about-me-form'),
				utils.serializeForm('likes-form')
			);

			function helper(a, b, c, d) {
				if (!d) d = b;
				if (!data[a]) return;
				if (!_.isArray(data[a])) {
					data[a] = [data[a]];
					data[b] = [data[b]];
				}

				data[a] = data[a].map(function(item, index) {
					return _.object([[ c, item ], [ d, data[b][index] ]]);
				});
				delete data[b];
			}

			helper('languages', 'levels', 'name', 'level');
			helper('instantMessages', 'imUsername', 'instantMessage');
			helper('socialNetworks', 'snUsername', 'socialNetwork');

			if (data['education'] && !_.isArray(data['education']))
				data['education'] = [data['education']];

			function extract(props, source) {
				var target = {};
				_.each(props, function(value, key) {
					target[key] = source[value];
				});
				return target;
			}

			function getProps(type) {
				return {
					name: type + '-city',
					country: type + '-country',
					region: type + '-region',
					lat: type + '-lat',
					lon: type + '-lon',
				};
			}

			function switchIndexes(map) {
				var keys = _.keys(map);
				var arrays = _.values(map).map(function(a) {
					return _.isArray(a) ? a : [a];
				});
				return arrays[0].map(function(a, index) {
					return _.object(keys, _.pluck(arrays, index));
				});
			}

			//debugger;
			var currentProps = getProps('current');
			var hometownProps = getProps('hometown');
			var otherProps = getProps('other');

			data.current = data.current ? extract(currentProps, data) : {};
			data.hometown = data.hometown ? extract(hometownProps, data) : {};

			if (data['other-city']) {
				var others = _.pick(data, 'other-city', _.values(otherProps));
				data.otherLocations = switchIndexes(others)
					.map(extract.bind(null, otherProps));
			} else {
				data.otherLocations = [];
			}

			return _.omit(data,
				_.values(currentProps),
				_.values(hometownProps),
				_.values(otherProps));
		},

		gradientBoxVisiblity: function(event) {
			event.preventDefault();
			var group = $(event.target).closest('.accordion-group');
			var isCollapsed = !!group.children('.collapsed').length;
			group.children('.gradient-box')[ isCollapsed ? 'hide' : 'show' ]();
		},
	});

	return ProfileView;
});
