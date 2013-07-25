//jshint camelcase:false

define(function(require) {

	require('foundation');
	require('foundationClearing');

	var Backbone = require('backbone');
	var api = require('api');
	var utils = require('utils');
	var blitline = require('tools/blitline');
	var alerts = require('views/lib/alerts');
	var tpl = require('tmpl!templates/app/profile/view.photos.html');
	var photosListTpl = require('tmpl!templates/app/profile/view.photos_list.html');

	var Photos = Backbone.View.extend({

		el: '#main',

		events: {
			//photos events
			'click #add_photo' : function(e) {
				var input = $(e.target).find('#input-photo-upload');
				input.clone()
					.removeAttr('id')
					.appendTo(input.parent())
					.trigger('click');
			},
			'change #add_photo input[type="file"]':function(e) {
				var photoData = e.target.files[0];
				this.checkPhotoData(photoData, $(e.target).data('album'));
				$(e.target).closest('form').get(0).reset();
			},

			'mouseenter #collapse-photos li' : function(e) {
				$(e.target).parents('li').find('.control').show();
			},
			'mouseleave #collapse-photos li' : function(e) {
				$(e.target).parents('li').find('.control').hide();
			}
		},

		initialize: function(model) {
			this.removePhoto = this.removePhoto.bind(this);
			this.onCloseClick = this.onCloseClick.bind(this);
			this.onPhotoSort = this.onPhotoSort.bind(this);

			this.model = model;
			this.showingMyProfile = false;
			this._uploading = [];

			//album update listener
			var self = this;

			api.listenUpdate('photos', function(photos) {
				if (!self.showingMyProfile) return;

				photos.forEach(function(photo) {
					var el = $(photosListTpl(photo));
					$('[data-tmp-photo-id="' + photo.hash + '"]').replaceWith(el);
					el.find('.control').on('click', parent.onCloseClick);
					self.uploadEnd(photo.hash);
				});
			});
		},

		render: function(isMyProfile) {
			this.showingMyProfile = isMyProfile;

			//initialize foundation for this view to use in photo slide
			var html = tpl({
				albums: this.model.get('albums'),
				myProfile: this.showingMyProfile,
			});

			this.$('#photo-box')
				.empty()
				.html(html)
				.foundation()
				.find('#collapse-photos .control')
					.on('click', this.onCloseClick);

			if (this.showingMyProfile) {
				this.$('#photo-box ul')
					.addClass('sortable')
					.sortable({ update: this.onPhotoSort });
			}
		},

		onPhotoSort: function() {
			var $li = this.$('#photo-box ul li');
			var ids = $li.toArray().map(function(li) {
				return $(li).data('photo-id');
			});

			api.put(api.getApiVersion() + '/albums/' + $li.data('album-id'), { photos: ids });
		},

		onCloseClick: function(event) {
			event.stopPropagation();
			event.preventDefault();

			var $li = $(event.target).closest('li');
			var id = $li.data('photo-id');

			$li.slideUp();
			api['delete'](api.getApiVersion() + '/photos/' + id);
		},

		removePhoto: function(event) {
			event.stopPropagation();
			event.preventDefault();

			var id = $(event.target)
				.parents('li')
				.slideUp()
				.data('photo-id');

			api['delete'](api.getApiVersion() + '/photos/' + id);
		},

		checkPhotoData: function(photo, albumId) {
			if(photo.size > 6291456)
				return alerts.error('The photo cannot be bigger than 6 Mb, please try with a smaller image');

			//create image
			var img = new Image();
			var URL = window.URL || window.webkitURL;

			if (!URL)
				return alerts.error('Your browser does not support image loading. To get the best experience, please download Chrome');

			var self = this;
			img.onload = function() {
				self._onImageLoaded(this, photo, albumId);
			};
			img.src = URL.createObjectURL(photo);
		},

		renderPhotoUpload: function(photo, id) {
			this.$el.find('#photo-box .clearing-thumbs').prepend(photosListTpl({
				uploading: true,
				id: id,
				src: photo.src
			}));

			//initialize foundation for this view to use in photo slide
			this.$('#photo-box').foundation();
			this.$('#photo-box ul').sortable();
			this.$('#collapse-photos .control')
				.off()
				.on('click', this.removePhoto);

			this.uploadStart(id);
		},

		uploadStart: function(id) {
			this._uploading.push(id);
			console.log('Uploading', id);
			if (!this._interval) {
				this._interval = setInterval(api.control, 5000);
				console.log('Starting interval');
			}
		},

		uploadEnd: function(id) {
			this._uploading = this._uploading.filter(function(a) { return a !== id });
			console.log('Upload end', id);
			if (!this._uploading.length) {
				clearInterval(this._interval);
				this._interval = null;
				console.log('Clearing interval');
			}
		},

		_onImageLoaded: function(image, photo, albumId) {
			if(image.width < 380)
				return alerts.error('The photo width must be bigger than 380px, please try with a widest image');
			if(image.height < 150)
				return alerts.error('The photo width must be bigger than 150px, please try with a taller image');

			var id = Date.now() + '-' + Math.random();
			this.renderPhotoUpload(image, id);

			utils.uploadAmazon(photo, 'to-resize').then(function(url) {
				var jobs = [{
					'application_id': '7XqmahVqL8tvhEIjzBm6-jg',
					'src': url,
					'content_type_json': true,

					'functions': [{
						'name': 'resize_to_fit',
						'params': {
							'width': 600,
							'height': 600
						},
						'save': {
							'image_identifier': 'big',
							'quality': 100,
							's3_destination':{
								'bucket':{
									'name':'peoplewings-test-media',
									'location':'eu-west-1'
								},
								'key':'/photoalbums/big_' + id
							}
						}
					}, {
						'name': 'resize_to_fit',
						'params': {
							'width': 380
						},
						'save': {
							'image_identifier': 'thumb',
							'quality': 100,
							's3_destination':{
								'bucket':{
									'name':'peoplewings-test-media',
									'location':'eu-west-1'
								},
								'key':'/photoalbums/thumb_' + id
							}
						}
					}],

					postback_url: api.getServerUrl() + api.getApiVersion() + '/photocompleted' + api.urlEncode({
						album: albumId,
						authToken: api.getAuthToken(),
						hash: id,
					})
				}];

				blitline.submit(jobs);
			});
		},

	});

	return Photos;

});
