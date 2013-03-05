define(function(require) {

	var $ = require('jquery');
	var api = require('api');
	var utils = require('utils');

	var alertTpl = require('tmpl!templates/lib/alert.html');

	function submitForm(formId, resource, formData, view, viewData) {
		var spinner = new Spinner(utils.getSpinOpts());
		api.post(resource, formData, successHandler(view, viewData, spinner, formId));
		spinner.spin(document.getElementById('main'));
	}

	function successHandler(view, viewData, spin, formId) {
		return function(response) {
			spin.stop();

			if(response.status === true) {
				$('#' + formId).remove();
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
		};
	}

	return {
		submitForm: submitForm,
	};
});
