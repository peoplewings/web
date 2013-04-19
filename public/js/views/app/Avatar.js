//jshint camelcase:false
/*globals Blitline */

define(function(require) {

	require("jquery.Jcrop");
	var $ = require('jquery');
	var Backbone = require('backbone');
	var api = require('api2');
	var utils = require('utils');
	var alerts = require("views/lib/alerts");
	var spinner = require("views/lib/spinner");


	var blitline = new Blitline();


	var AvatarView = Backbone.View.extend({

		el: "#basic-box",

		originalAvatarId: null,
		size: 600,

		events: {
			"click #upload-avatar" : function(e){
				e.preventDefault();
				this.$('#upload').trigger('click');
			},
			"click #submit-avatar" : function(e){
				e.preventDefault();
				this.submitAvatar();
			}
		},

		initialize: function(){
			_.bindAll(this, 'uploadFile', 'uploadComplete', 'resizeComplete');

			if (!window.File || !window.FileReader || !window.FileList || !window.Blob)
				return alert('The File APIs are not fully supported in this browser.');

			$('#upload').on('change', this.uploadFile);
		},

		uploadFile: function(event) {
			var files = event.target.files;
			if (!files.length)
				return;

			spinner.show('avatar');
			utils.uploadAmazon(files[0], 'to-resize').then(this.uploadComplete);
		},

		uploadComplete: function(url) {
			var jobs = [{
				"application_id": "7XqmahVqL8tvhEIjzBm6-jg",
				"src": url,
				"functions": [{
					"name": "resize_to_fit",
					"params" : { "width" : this.size, "height" : this.size },
					"save" : { "image_identifier" : "external_sample_1" }
				}]
			}];

			blitline.submit(jobs, {
				completed : this.resizeComplete
				//submitted : function(jobIds, images) {
				//	console.log("Job has been succesfully submitted to blitline for processing\r\n\r\nPlease wait a few moments for them to complete.");
				//}
			});
		},

		resizeComplete: function(images, error) {
			var self = this;
			this.params = { x: 0, y: 0, w: 0, h: 0 };

			function showCoords(coords) {
				var scale_x = self.size / $("#cropbox").width();
				var scale_y = self.size / $("#cropbox").height();
				self.params = {
					img: images[0].s3_url,
					x: Math.floor(coords.x * scale_x),
					y: Math.floor(coords.y * scale_y),
					w: Math.floor(coords.w * scale_x),
					h: Math.floor(coords.h * scale_y),
				};
			}

			function clearCoords(){
				$('#coords input').val('');
			}

			if (error)
				return console.error('Error processing image ' + error + ' Blitline dashboard can provide more info.');

			spinner.hide('avatar');
			$('#crop-modal .modal-body img').attr('src', images[0].s3_url);
			$('#crop-modal').modal('show');
			$('#cropbox').Jcrop({
				onChange: showCoords,
				onSelect: showCoords,
				onRelease: clearCoords,
				aspectRatio: 1,
				setSelect: [ 50, 50, 296, 296],
				minSize: [246, 246],
			});
		},

		submitAvatar: function() {
			this.$("#submit-avatar").button('loading');

			api.post(api.getApiVersion() + "/cropped/", this.params)
				.then(function(){
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
