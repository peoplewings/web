define(function(require) {
	require('jquery.Datepicker');

	var $ = require('jquery');
	var Promise = require('promise');
	var Backbone = require('backbone');
	var utils = require('utils');

	var ProfileModel = require('models/ProfileModel');
	var MapView = require('views/app/map');
	var notifications = require('views/lib/notifications');
	var references = require('views/lib/reference');
	var MyProfile = require('views/app/MyProfile');
	var MyWings = require('views/app/MyWings');
	var PhotosView = require('views/app/photos');

	var profileTpl = require('tmpl!templates/app/profile/profile.html');
	var wingsBarTpl = require('tmpl!templates/app/profile/form.add-wings.html');

	var wingViewTpl = require('tmpl!templates/app/profile/view.wing.html');
	var wingViewTypeTpl = {
		accommodation: require('tmpl!templates/app/profile/view.wing.accommodation.html'),
	};

	var boxesTpl = {
		'basic': require('tmpl!templates/app/profile/view.basic.html'),
		'about': require('tmpl!templates/app/profile/view.about.html'),
		'likes': require('tmpl!templates/app/profile/view.likes.html'),
		'places': require('tmpl!templates/app/profile/view.places.html'),
		'contact': require('tmpl!templates/app/profile/view.contact.html'),
		'references': require('tmpl!templates/app/profile/view.references.html'),
	};

	var ProfileView = Backbone.View.extend({

		el: '#main',

		events: {
			'click .personal-info button.send-message-btn': 'sendMessage',
			'click .personal-info button.send-request-btn': 'sendRequest',
			'click .personal-info button.send-invitation-btn': 'sendInvitation',
			'click #add-reference-btn': 'sendReference',
			'click .leave-reference': 'returnReference',
			'click .see-more': 'gradientBoxVisiblity',
			'click .see-less': 'gradientBoxVisiblity',
		},

		initialize: function(userId) {
			_.bindAll(this, 'refreshWings');
			this.map = new MapView({
				el: '#user-map',
				id: 'mapcanvas'
			});

			this.model = new ProfileModel({ id: userId });
			this.photos = new PhotosView(this.model);

		},

		render: function(userId, tabId) {
			this.model.clear({silent: true});
			this.model.set('id', userId, {silent: true});

			var tab = '#' + tabId || '#about';
			this.model.fetch().then(this.refresh.bind(this, tab));
		},

		refresh: function(tab) {
			this.model.wings.on('all', this.refreshWings);
			this.refreshProfile();
			this.refreshWings();
			this.refreshPhotos();

			utils.resetMain(150);

			if (tab)
				this.selectTab(tab);

			if (this.model.isMyProfile()) {
				if (!this.myProfile) {
					this.myProfile = new MyProfile(this.model, this);
					this.myWings = new MyWings(this.model.wings);
				}
				this.myProfile.refresh();
			}
		},

		refreshPhotos: function() {
			this.photos.render(this.model.isMyProfile());
		},

		refreshProfile: function() {
			var data = _.extend(this.model.toJSON(), {
				myProfile: this.model.isMyProfile()
			});

			// We cant display {{text}} at the template because its a Handlebar's helper
			data.references.forEach(function(reference) {
				reference.message = reference.text;
			});

			$(this.el).html(profileTpl(data));

			// For each template on boxesTpl we render it on it's box
			Object.keys(boxesTpl).forEach(function(box) {
				this.$('#' + box + '-box').html(boxesTpl[box](data));
			});

			this.fixBoxes();
			this.refreshMap();
		},

		refreshMap: function() {
			this.map.render();
			this.initMarkers();

			var center = this.model.get('current') ||
				this.model.get('hometown') ||
				this.model.get('otherLocations')[0] ||
				{};

			_.defaults(center, { lat: 48.6908333333, lon: 9.14055555556 });
			this.map.setCenter(center.lat, center.lon);
		},

		initMarkers: function() {
			this.map.clearMarkers();
			this._handleMarker('current', this.model.get('current'));
			this._handleMarker('hometown', this.model.get('hometown'));

			var others = this.model.get('otherLocations');
			others.forEach(this._handleMarker.bind(this, 'other'));
		},

		_handleMarker: function(type, city) {
			this.map.addMarker({
				id: type + '-' + Math.random(),
				location: new google.maps.LatLng(city.lat, city.lon),
				title: city.name + ', ' + city.country,
				icon: 'img/places-' + type + '-marker.png'
			});
		},

		fixBoxes: function() {
			$('.accordion-group').each(function() {
				var accordion = $(this);

				function execute() {
					var maxHeight = accordion.find('.accordion-body').attr('mincollapse');
					var height = accordion.find('.accordion-inner').outerHeight();

					if (height < maxHeight) {
						accordion.find('.accordion-heading').hide();
						accordion.find('.accordion-body').css('height', 401);
					}
				}

				if (accordion.closest('.box-standard').attr('id') !== 'profile-photos')
					return execute();

				var proms = accordion.find('img').toArray().map(function(img) {
					if (img.complete) return Promise.resolved();
					var prom = new Promise();
					img.onload = prom.resolve.bind(prom);
					img.onerror = prom.reject.bind(prom);
					return prom.future;
				});

				Promise.all(proms).then(execute);
			});
		},

		refreshWings: function() {
			var isMyProfile = this.model.isMyProfile();
			var html = isMyProfile ?
				wingsBarTpl(this.model.pick('avatar', 'pwState')) :
				boxesTpl.basic(this.model.toJSON(), { myProfile: isMyProfile });

			var boxes = this.model.wings.map(function(wing) {
				var box = $('<div>')
					.attr('id', 'wing-box-' + wing.id)
					.addClass('box-standard');

				box.html(wingViewTpl(wing.toJSON(), {
					myProfile: isMyProfile,
					wingTypeView: wingViewTypeTpl,
				}));
				return box;
			});

			this.$('#wings .content-left').html(html);
			this.$('#wings .content-right')
				.empty()
				.append(boxes);
		},

		renderBox: function(box) {
			this.model.fetch().then(this.refreshBox.bind(this, box));
		},

		refreshBox: function(box) {
			var html = boxesTpl[box](this.model.toJSON(), {
				myProfile: this.model.isMyProfile(),
			});

			this.$('#' + box + '-box').html(html);

			if (box === 'places')
				this.initializeMap();
		},

		initializeMap: function() {
			this.map = new MapView({
				el: '#user-map',
				id: 'mapcanvas'
			});
			this.refreshMap();
		},

		selectTab: function(tabId) {
			this.$('.tab-content .tab-pane').removeClass('active');
			$(tabId).addClass('active');

			$('.tabs ul li').removeClass('active');
			$('.tabs ul li a[href=' + tabId + ']')
				.parent()
				.addClass('active');
		},

		gradientBoxVisiblity: function(event) {
			event.preventDefault();
			var group = $(event.target).closest('.accordion-group');
			var isCollapsed = !!group.children('.collapsed').length;
			group.children('.gradient-box')[ isCollapsed ? 'hide' : 'show' ]();
		},

		sendMessage: function() {
			var id = this.model.get('id');
			var fullname = this.model.get('firstName') + ' ' + this.model.get('lastName');
			notifications.message(id, fullname);
		},

		sendRequest: function() {
			var id = this.model.get('id');
			var fullname = this.model.get('firstName') + ' ' + this.model.get('lastName');
			notifications.request(id, fullname);
		},

		sendInvitation: function() {
			var id = this.model.get('id');
			var fullname = this.model.get('firstName') + ' ' + this.model.get('lastName');
			notifications.invitation(id, fullname);
		},

		sendReference: function() {
			var id = this.model.get('id');
			var fullname = this.model.get('firstName') + ' ' + this.model.get('lastName');
			references.openModal(id, fullname)
				.then(this.model.fetch.bind(this.model))
				.then(this.refreshProfile.bind(this));
		},

		returnReference: function(event) {
			var button = $(event.target);
			var id = button.attr('data-id');
			var name = button.attr('data-name');
			references.openModal(id, name);
		},
	});

	return ProfileView;
});
