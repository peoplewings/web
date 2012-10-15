define([
  'jquery',
  'backbone',
  'utils',
  'api',
  'text!templates/app/settings.html'
], function($, Backbone, utils, api, settingsTpl){


  var settingsView = Backbone.View.extend({
    el: "#main",

	events:{
		"submit form#settings-form": "submitSettings"
	},

    render: function(){
      $(this.el).html(settingsTpl);
    },

	submitSettings: function(e){
		e.preventDefault(e);
		var data = utils.serializeForm()
		//POST credentials
		api.post('/auth/', data, this.success(data.remember))
		//Start loader
		//spinner.spin(document.getElementById('main'));
		$('#' + e.target.id).remove()
	},
	success: function(loggedIn){
		return function(response){
			//spinner.stop()
			if (response.status===true) {
				if (response.code === 200) {
					console.log(response)
				}
			}else {
					for ( error in response.error){
						console.error("Server said: " + error + " : " + response.error[error])
					
					}
			
			}
		}	
	}
  });
  return new settingsView;
});