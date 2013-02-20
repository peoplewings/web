define(function(require) {

	require("jquery.Jcrop");
	var $ = require('jquery');
	var Backbone = require('backbone');
	var api = require('api');
	var utils = require('utils');
	var avatarTpl = require('text!templates/app/avatar.html');
	var ProfileModel = require('models/Profile');


	var avatarView = Backbone.View.extend({
		originalAvatarId: "",
		events: {},
		initialize: function(){
		},
		render: function(url){
			var tpl = _.template( avatarTpl, { avatarUrl: url });
			$('#main > .row').append(tpl);
			this.initAvatarForm();
		},
		initAvatarForm: function(){
			$('a.thumbnail').click(function(e){
				e.preventDefault();
				$('#upload').trigger('click');
			});
			var sc = this
			if (window.File && window.FileReader && window.FileList && window.Blob) {
				function handleFileSelect(evt) {
					var files = evt.target.files; // FileList object
					console.dir(files)
					if (files.length > 0) sc.uploadFile(files[0])
				}
				document.getElementById('upload').addEventListener('change', handleFileSelect, false);
			} else alert('The File APIs are not fully supported in this browser.');

			$('#submit-avatar').click(function(evt){
				sc.submitAvatar()
			})
		},
		uploadFile: function(file){
			var fd = new FormData();
			var profile = new ProfileModel({id: api.getUserId()})
			fd.append("image", file);
			fd.append("owner", profile.get("id"));
			$(".progress").show()
			var sc = this
			$.ajax({
				url: api.getServerUrl() + "/cropper/",
				data: fd,
				cache: false,
				contentType: false,
				processData: false,
				crossDomain: true,
				type: 'POST',
				xhr: function(){
					var xhr = new window.XMLHttpRequest();
					xhr.upload.addEventListener("progress", function(evt){
						if (evt.lengthComputable) {
							var percentComplete = Math.round(evt.loaded * 100 / evt.total);
							$('.progress > .bar').attr( { "style": "width:" + percentComplete.toString() + "%" });
						}
					}, false);
					/*Download progress
					xhr.addEventListener("progress", function(evt){
						if (evt.lengthComputable) {
							var percentComplete = Math.round(evt.loaded * 100 / evt.total);
							var inv = 100 - percentComplete
							$('.progress > .bar').attr( { "style": "width:" + inv.toString() + "%" });
						}
					}, false);*/
					return xhr;
				},
				success: this.uploadComplete(this)
			});
		},
		uploadComplete: function(scope){
			return function(response){
				//console.log("Complete!!!", response)
				function showCoords(c){
					var scale_x = scope.originalW / $("#cropbox").width()
					var scale_y = scope.originalH / $("#cropbox").height()
					$('#id_x').val(Math.floor(c.x*scale_x))
					$('#id_y').val(Math.floor(c.y*scale_y))
					$('#id_w').val(Math.floor(c.w*scale_x))
					$('#id_h').val(Math.floor(c.h*scale_y))
				}
				function clearCoords(){ $('#coords input').val('') }

				$(".progress").hide()

				if (response.success){
					var data = response.data
					scope.originalAvatarId = data.id
					scope.originalH = data.height
					scope.originalW = data.width

					$('#crop-modal .modal-body img').attr({ src: data.image })

					$('#crop-modal').modal('show')
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
			}
		},
		submitAvatar: function(){
			//50% of times it breaks : Acces-Control-Origin....
			var vs = utils.serializeForm("crop-avatar-form")
			api.post(api.getApiVersion() + "/cropped/" + this.originalAvatarId, vs, this.avatarUploaded)
		},
		avatarUploaded: function(response){
			if (response.status === true){
				$('#avatar').attr("src", response.data.url)
				$('#crop-modal').modal('hide')
			} else alert("Error", response.msg)
		}
	});

	return new avatarView;
});
