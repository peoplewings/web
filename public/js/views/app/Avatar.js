//jshint camelcase:false

define(function(require) {

	require("jquery.Jcrop");
	var $ = require('jquery');
	var Backbone = require('backbone');
	var api = require('api2');
	var utils = require('utils');
	var alerts = require("views/lib/alerts");


	var AvatarView = Backbone.View.extend({

		el: "#basic-box",

		originalAvatarId: null,

		spinOptions: {
			lines: 11,
			length: 15,
			width: 6,
			radius: 11,
			corners: 1,
			rotate: 12,
			color: '#000',
			speed: 0.8,
			trail: 66,
			shadow: false,
			hwaccel: false,
			className: 'spinner',
			zIndex: 2e9,
			top: 'auto',
			left: 'auto'
		},

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
			this.spinner = new Spinner(this.spinOptions);

			if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
				return alert('The File APIs are not fully supported in this browser.');

			$('#upload').on('change', this.uploadFile.bind(this));
		},

		uploadFile: function(event) {
			var files = event.target.files;
			if (!files.length)
				return;

			this.spinner.spin(document.getElementById('upload-avatar'));
			utils.uploadAmazon(files[0], 'to-resize').then(this.uploadComplete.bind(this));
		},
		uploadComplete: function(response){
			return;

			this.spinner.stop();
			var data = response.data;
			var original = {
				avatarId: data.id,
				width: data.width,
				height: data.height,
			};

			function showCoords(coords){
				var scale_x = original.width / $("#cropbox").width();
				var scale_y = original.height / $("#cropbox").height();
				$('#id_x').val(Math.floor(coords.x * scale_x));
				$('#id_y').val(Math.floor(coords.y * scale_y));
				$('#id_w').val(Math.floor(coords.w * scale_x));
				$('#id_h').val(Math.floor(coords.h * scale_y));
			}

			function clearCoords(){
				$('#coords input').val('');
			}

			if (false) {
				$('#crop-modal .modal-body img').attr({ src: data.image });

				$('#crop-modal').modal('show');
				$('#cropbox').Jcrop({
					onChange:   showCoords,
					onSelect:   showCoords,
					onRelease:  clearCoords,
					aspectRatio: 1,
					setSelect:   [ 50, 50, 296, 296],
					minSize: [246, 246],
					//maxSize: [246, 284],
				});
			} else
				alerts.error(response.errors);
		},
		submitAvatar: function(){
			var data = utils.serializeForm("crop-avatar-form");

			this.$("#submit-avatar").button('loading');

			api.post(api.getApiVersion() + "/cropped/" + this.originalAvatarId, data)
			.then(function(resp){
				alerts.success("Avatar uploaded");
				$('#avatar').attr("src", resp.data.url);
				$('#crop-modal').modal('hide');
				window.router.header.refresh();

			}, function(error) {
				debugger;
				alerts.defaultError(error);
			})
			.fin(function(){
				$("#submit-avatar").button('reset');
			});
		},
	});

return AvatarView;
});
