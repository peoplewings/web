define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var api = require('api');
	var utils = require('utils');

	var alertTpl = require('tmpl!templates/lib/alert.html');

	var submitForm = function(formId, resource, formData, view, viewData) {
			var spinner = new Spinner(utils.getSpinOpts());

			api.post(resource, formData, successHandler(view, viewData, spinner, formId))
			spinner.spin(document.getElementById('main'));

		};

	var successHandler = function(view, viewData, spin, formId) {
			return function(response, textStatus) {
				spin.stop()
				if(response.status === true) {

					$('#' + formId).remove()
					viewData.extraData = "Code: " + response.code + " - " + response.msg;
					view.render(viewData);
					$("#main").html(view.el);

				} else {
						
						$('#main').prepend(alertTpl( {
							extraClass: 'alert-error',
							heading: "Code " + response.code + ", Error: ",
							message: response.errors || response.error,
						}));
				}
			}
		};

	return {
		submitForm: submitForm

	}
});