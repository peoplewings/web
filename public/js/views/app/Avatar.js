//jshint camelcase:false

define(function(require) {

	require("jquery.Jcrop");
	var $ = require('jquery');
	var Backbone = require('backbone');
	var api = require('api2');
	var utils = require('utils');
	var blitline = require('tools/blitline');
	var alerts = require("views/lib/alerts");
	var spinner = require("views/lib/spinner");


	var AvatarView = Backbone.View.extend({

		el: "#main",

		originalAvatarId: null,

		defaultMaxWidth: 600,

		events: {
			"click .my-profile #upload-avatar": function(e) {
				e.preventDefault();
				$('#upload').trigger('click');
			},
			"click #submit-avatar": function(e) {
				e.preventDefault();
				this.submitAvatar();
			}
		},

		initialize: function() {
			_.bindAll(this, 'uploadFile', 'uploadComplete', 'resizeComplete');

			if (!window.File || !window.FileReader || !window.FileList || !window.Blob) return alert('The File APIs are not fully supported in this browser.');

			$('#upload').on('change', this.uploadFile);
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

			spinner.show('avatar');
			utils.uploadAmazon(files[0], 'to-resize').then(this.uploadComplete);

			// We reset the form so the 'change' event is always fired
			// when a file is selected
			var form = $(event.target).closest('form').get(0)
			form.reset();
		},

		uploadComplete: function(url) {
			var jobs = [{
				"application_id": "7XqmahVqL8tvhEIjzBm6-jg",
				"src": url,

				"functions": [{
					"name": "resize_to_fit",
					"params": {
						"width": this.defaultMaxWidth,
						"height": this.defaultMaxWidth
					},
					"save": {
						"image_identifier": "external_sample_1"
					}
				}]
			}];

			blitline.submit(jobs, this.resizeComplete);
		},

		resizeComplete: function(images, error) {
			spinner.hide('avatar');
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
				if (this.width < 174){
					alerts.error('Could not process your request. Image width is too narrow');
					return;
				}

				if (this.height < 174){
					alerts.error('Could not process your request. Image height is too short');
					return;
				}

				self.size = {
					width: this.width,
					height: this.height
				};

				$('#crop-modal .modal-body img').attr('src', images[0].s3_url);
				$('#crop-modal .modal-body img').css({width: self.size.width, height: self.size.height});
				$('#crop-modal').width(650);

				$('#crop-modal').modal('show');
				$('#cropbox').Jcrop({
					onChange: showCoords,
					onSelect: showCoords,
					onRelease: clearCoords,
					aspectRatio: 1,
					setSelect: [50, 50, 224, 224],
					minSize: [174, 174],
				});

			};
			img.src = images[0].s3_url;
		},

		submitAvatar: function() {
			this.$("#submit-avatar").button('loading');

			api.post(api.getApiVersion() + "/cropped/", this.params)
				.then(function() {
				alerts.success('Keep calm, your profile picture will be updated soon');
				$('#crop-modal').modal('hide');
				$("#submit-avatar").button('reset');
			}, function(error) {
				debugger;
				alerts.defaultError(error);
			});
		},
	});

	return AvatarView;
});
