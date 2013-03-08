//jshint camelcase:false

define(function(require) {

	require("jquery.Jcrop");
	var $ = require('jquery');
	var Backbone = require('backbone');
	var api = require('api2');
	var utils = require('utils');
	var ProfileModel = require('models/Profile');
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
			var self = this;
			function handleFileSelect(evt) {
				var files = evt.target.files;
				if (files.length > 0)
					self.uploadFile(files[0]);
			}

			if (window.File && window.FileReader && window.FileList && window.Blob) {
				document.getElementById('upload').addEventListener('change', handleFileSelect, false);
			} else alert('The File APIs are not fully supported in this browser.');
		},

		uploadFile: function(file){
			var self = this;
			var fd = new FormData();
			var profile = new ProfileModel({id: api.getUserId()});
			fd.append("image", file);
			fd.append("owner", profile.get("id"));
			$(".progress").show();
			$.ajax({
				url: api.getServerUrl() + "/cropper/",
				data: fd,
				cache: false,
				contentType: false,
				processData: false,
				crossDomain: true,
				type: 'POST',
				beforeSend: function(){
					self.spinner.spin(document.getElementById('upload-avatar'));
				},
				/*xhr: function(){
					var xhr = new window.XMLHttpRequest();
					xhr.upload.addEventListener("progress", function(evt){
						if (evt.lengthComputable) {
							var percentComplete = Math.round(evt.loaded * 100 / evt.total);
							$('.progress > .bar').attr( { "style": "width:" + percentComplete.toString() + "%" });
						}
					}, false);
					return xhr;
				},*/
				success: this.uploadComplete(this)
			});
		},
		uploadComplete: function(scope){
			return function(response){
				scope.spinner.stop();
				function showCoords(c){
					var scale_x = scope.originalW / $("#cropbox").width();
					var scale_y = scope.originalH / $("#cropbox").height();
					$('#id_x').val(Math.floor(c.x*scale_x));
					$('#id_y').val(Math.floor(c.y*scale_y));
					$('#id_w').val(Math.floor(c.w*scale_x));
					$('#id_h').val(Math.floor(c.h*scale_y));
				}
				function clearCoords(){ $('#coords input').val(''); }

				$(".progress").hide();

				if (response.success){
					var data = response.data;
					scope.originalAvatarId = data.id;
					scope.originalH = data.height;
					scope.originalW = data.width;

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
				}
			};
		},
		submitAvatar: function(){
			var data = utils.serializeForm("crop-avatar-form");

			this.$("#submit-avatar").button('loading');

			api.post(api.getApiVersion() + "/cropped/" + this.originalAvatarId, data)
			.then(function(resp){
				alerts.success("Avatar uploaded");
				$('#avatar').attr("src", resp.data.url);
				$('#crop-modal').modal('hide');
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
