define(function(require) {

	var template = require('tmpl!templates/lib/alert2.html');

	var lastAlert;

	function showAlert(type, content, options) {
		var title;
		if (typeof options === 'string') {
			title = content;
			content = options;
			options = arguments[3];
		}

		options = options || {};
		if (!('autoclose' in options))
			options.autoclose = 60000;

		var alert = $(template({
			type: type,
			title: title,
			content: content,
			options: options,
		}));

		if (lastAlert)
			lastAlert.alert('close');

		lastAlert = alert;

		$('#alerts-container').append(alert);

		if (options.autoclose)
			setTimeout(function() { alert.alert('close'); }, options.autoclose);

		alert.alert();
		return alert;
	}

	return {
		success: showAlert.bind(null, 'success'),
		info: showAlert.bind(null, 'info'),
		warning: showAlert.bind(null, null),
		error: showAlert.bind(null, 'error'),
		defaultError: showAlert.bind(null, 'error', 'Sorry, an error ocurred, it has been reported'),
	};

});
