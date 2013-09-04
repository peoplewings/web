//jshint camelcase:false

define(function(require) {

	require("jquery.Jcrop");
	var $ = require('jquery');
	var Backbone = require('backbone');
	var api = require('api');
	var utils = require('utils');
	var blitline = require('tools/blitline');
	var alerts = require("views/lib/alerts");
	var spinner = require("views/lib/spinner");


	var LandscapeView = Backbone.View.extend({

		el: "#main",

		originalLandscapeId: null,

		defaultMaxWidth: 960,

		events: {
			"click #change-landscape": function(e) {
				e.preventDefault();
				$('#upload-landscape').trigger('click');
			},
			"click .landscape-modal #submit-avatar": function(e) {
				e.preventDefault();
				this.submitLandscapeToCrop();
			}
		},

		initialize: function() {
			_.bindAll(this, 'uploadFile', 'uploadComplete', 'resizeComplete');

			if (!window.File || !window.FileReader || !window.FileList || !window.Blob) return alert('The File APIs are not fully supported in this browser.');

			$('#upload-landscape').on('change', this.uploadFile);
		},

		uploadFile: function(event) {
			var files = event.target.files;
			//Maximum file size: 6Mb
			if (files[0].size > 6291456){
				alerts.error('Maximum file size allowed is 6 MB');
				return;
			}

			if (!files.length)
				return;

			spinner.show('landscape');
			utils.uploadAmazon(files[0], 'to-resize').then(this.uploadComplete);

			// We reset the form so the 'change' event is always fired
			// when a file is selected
			$(event.target)
				.closest('form')
				.get(0)
				.reset();
		},

		uploadComplete: function(url) {
			var jobs = [{
				"application_id": "7XqmahVqL8tvhEIjzBm6-jg",
				"src": url,

				"functions": [{
					"name": "resize_to_fit",
					"params": {
						"width": this.defaultMaxWidth,
					},
					"save": {
						"image_identifier": "external_sample_1"
					}
				}]
			}];

			blitline.submit(jobs, this.resizeComplete);
		},

		resizeComplete: function(images, error) {
			spinner.hide('landscape');
			var self = this;
			this.params = {x: 0, y: 0, w: 0, h: 0};

			images.forEach(function(image) {
				image.s3_url = image.s3_url.replace(/^http:/, 'https:');
			});

			function showCoords(coords) {
				var scale_x = self.size.width / $("#cropbox").width();
				var scale_y = self.size.height / $("#cropbox").height();
				self.params = {
					img: images[0].s3_url,
					x: Math.floor(coords.x * scale_x),
					y: Math.floor(coords.y * scale_y),
					w: Math.floor(coords.w * scale_x),
					h: Math.floor(coords.h * scale_y),
				};
			}

			function clearCoords() {
				$('#coords input').val('');
			}

			if (error)
				return console.error('Error processing image ' + error + ' Blitline dashboard can provide more info.');

			var img = new Image();
			img.onload = function() {
				if (this.width < 960){
					alerts.error('Could not process your request. Image width is too narrow');
					return;
				}

				if (this.height < 324){
					alerts.error('Could not process your request. Image height is too short');
					return;
				}

				self.size = {
					width: this.width,
					height: this.height
				};

				$('#crop-modal')
					.addClass('landscape-modal')
					.find('.modal-body img')
						.attr('src', images[0].s3_url)
						.css({width: self.size.width, height: self.size.height});

				$('#crop-modal.landscape-modal').modal('show');

				// HACK: Jcrop does not set the size at second execution
				$('#cropbox')
					.data('Jcrop', null)
					.parent()
						.find('.jcrop-holder')
						.remove();
				// END HACK

				$('#cropbox').Jcrop({
					onChange: showCoords,
					onSelect: showCoords,
					onRelease: clearCoords,
					setSelect: [50, 50, 960, 324],
					minSize: [960, 324],
					maxSize: [960, 324],
					trueSize: [self.size.width, self.size.height],
				});

			};
			img.src = images[0].s3_url;
		},

		submitLandscapeToCrop: function() {
			var id = Date.now() + '-' + Math.random();
			this.$("#submit-avatar").button('loading');

			var jobs = [{
				"application_id": "7XqmahVqL8tvhEIjzBm6-jg",
				"src": this.params.img,

				"functions": [{
					"name": "crop",
					"params": {
						"x": this.params.x,
						"y": this.params.y,
						"w": this.params.w,
						"h": this.params.h,
					},
					'save': {
						'image_identifier': 'landscape',
						'quality': 100,
						's3_destination':{
							'bucket':{
								'name':'peoplewings-test-media',
								'location':'eu-west-1'
							},
							'key':'/photoalbums/landscape_' + id
						}
					}
				}],

				postback_url: api.getServerUrl() + api.getApiVersion() + '/landscape' + api.urlEncode({
						authToken: api.getAuthToken(),
				}),
			}];

			blitline.submit(jobs, this.submitLandscape);
		},

		submitLandscape: function() {
			alerts.success('Keep calm, your profile picture will be updated soon');
				$('#crop-modal').modal('hide');
				$("#submit-avatar").button('reset');
		},
	});

	return LandscapeView;
});
