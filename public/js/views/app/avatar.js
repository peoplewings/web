define([
  "jquery",
  "backbone",
  "api",
  "utils",
  'text!templates/app/avatar.html',
  'models/Profile'
], function($, Backbone, api, utils, avatarTpl, ProfileModel){
	
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
		var profile = new ProfileModel({id:"me"})
	    fd.append("image", file);
		fd.append("owner", profile.get("pid"));
		$(".progress").show()
		var sc = this
		$.ajax({
		    url: "http://peoplewings-backend.herokuapp.com/cropper/",
			//url: "http://192.168.1.36:5000/cropper/",
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
				//Download progress
			    xhr.addEventListener("progress", function(evt){
			      if (evt.lengthComputable) {
					var percentComplete = Math.round(evt.loaded * 100 / evt.total);
					console.log(percentComputable)
					var inv = 100 - percentComplete
	   				$('.progress > .bar').attr( { "style": "width:" + inv.toString() + "%" });
			      }
			    }, false);
			    return xhr;
			},
		    success: this.uploadComplete(this)
		});
	},
	uploadComplete: function(scope){
		return function(response){
			console.log("Complete!!!", response)
		
			function showCoords(c){
	             $('#id_x').val(Math.floor(c.x))
		         $('#id_y').val(Math.floor(c.y))
		         $('#id_w').val(Math.floor(c.w))
		         $('#id_h').val(Math.floor(c.h))
	        }
	        function clearCoords(){
	          $('#coords input').val('')
	        }

			$(".progress").hide()
		
	        if (response.success){
				var data = response.data
				scope.originalAvatarId = data.id
	         	$('#crop-modal .modal-body img').attr("src", data.image)
	         	//console.log("WxH: " + data.width + "x" + data.height)
				require(["jquery.Jcrop"], function(){
					$('#crop-modal').modal('show')
			   		$('#cropbox').Jcrop({
		                onChange:   showCoords,
		                onSelect:   showCoords,
		                onRelease:  clearCoords,
		                aspectRatio: 8 / 10,
		                setSelect:   [ 50, 50, 296, 334],
		                minSize: [123, 142],
	             	});
			 })
			}
		}
	},
	submitAvatar: function(){
        var scale = 1;
		/*var vs = $('#coords').serialize()
		var values = {
			x: $('#id_x').val()*scale,
			y: $('#id_y').val()*scale,
			w: $('#id_w').val()*scale,
			h: $('#id_h').val()*scale,
			original: this.originalAvatarId
		}
		vs = vs+"&original="+this.originalAvatarId*/

		var vs = utils.serializeForm("crop-avatar-form")
		api.post("/cropped/" + this.originalAvatarId, vs, this.avatarUploaded)
		/*$.ajax({
		  url: "http://peoplewings-backend.herokuapp.com/api/v1/cropped/" + this.originalAvatarId + "/",
		  //url: "http://192.168.1.36:5000/cropper/" + this.originalAvatarId + "/",
		  type: 'post',
		  data: vs,
		  //data: JSON.stringify(values),
		  cache: false,
		  //contentType: false,
		  processData: false,
		  crossDomain: true,
		  //contentType: "application/json",
    	  success: this.avatarUploaded
		})*/
	},
	avatarUploaded: function(response){
		console.log(response)
		if (response.status === true){
			$('#avatar').attr("src", response.data.image.url)
	    	$('#avatar').width(246)
	    	$('#avatar').height(284)
			$('#crop-modal').modal('hide')
		}
	}
  });

  return new avatarView;
});