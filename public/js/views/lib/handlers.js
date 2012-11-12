define([
  'jquery',
  'backbone',
  'api',
  'utils',
], function($, Backbone, api, utils){
	

  var submitForm = function(formId, resource, formData, view, viewData){
	var spinner = new Spinner(utils.getSpinOpts());
	//POST form data
	api.post(resource, formData, successHandler(view, viewData, spinner, formId))
	//start spinner
	spinner.spin(document.getElementById('main'));
  };

  var successHandler = function(view, viewData, spin, formId){
	return function(response, textStatus){
		spin.stop()
		if (response.status === true) {
			$('#' + formId).remove()
			viewData.extraData = "Code: " + response.code + " - " + response.msg
			view.render(viewData)
			$("#main").html(view.el)
		}
		else {
			console.log(response)
			for ( err in response.error.errors){
				console.log(err)
				$.each(response.error.errors[err], function(index, field){
					console.log(field)
				})
				
			}
			
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