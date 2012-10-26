define([
  'jquery',
  'backbone',
  'api',
  'utils',
], function($, Backbone, api, utils){
	

  var submitForm = function(evt, resource, formData, view, viewData){
	var spinner = new Spinner(utils.getSpinOpts());
	//POST form data
	api.post(resource, formData, successHandler(view, viewData, spinner))
	//start spinner
	spinner.spin(document.getElementById('main'));
	//remove form if it exists
	if (evt) $('#' + evt.target.id).remove()
  };

  var successHandler = function(view, viewData, spin){
	return function(response, textStatus){
		spin.stop()
		console.dir(response)
		if (response.status === true) {
			view.render(viewData, response.data )
			$("#main").html(view.el)
		}
		else {
			console.log(response.error)
			/*
				TODO: implement behaviour for different errors
				for ( error in response.error){
					console.error("Server said: " + error + " : " + response.error[error])
				}
			*/
		}
	}
  };

  return {
	submitForm: submitForm
	
   }
});