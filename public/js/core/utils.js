//jshint camelcase:false

define(function(require) {

	var $ = require('jquery');
	var modalTpl = require('tmpl!templates/lib/modal2.html');

	var getCC = function(address_components){
		var data = {};

		_.each(address_components, function(component) {
			_.each(component.types, function(type) {
				switch (type) {
					case "locality":
						data.city = component.long_name;
						break;
					case "country":
						data.country = component.long_name;
						break;
					case "administrative_area_level_1":
						data.region = component.long_name;
						break;
				}
			});
		});
		return data;
	};

	var serialize = function(form_id){
		var form = (form_id) ? 'form#' + form_id : 'form';
		var values = {};
		$.each(jQuery(form).serializeArray(), function(i, field) {
			if (!field.value) return;
			var key = field.name;
			var value = field.value;

			if (!values.hasOwnProperty(key)) {
				values[key] = value;
				return value;
			}

			if (!(values[key] instanceof Array))
				values[key] = [values[key]];

			values[key].push(value);
		});
		return values;
	};

	var showModal = function(header, accept, content, callback) {
		var modal = $(modalTpl({
			header: header,
			accept: accept,
			content: content
		}));
		$("body section:last").append(modal);

		modal.modal('show');
		modal.find('.btn-primary').click(callback);

		modal.on('hidden', function() {
			modal.remove();
		});

		return modal;
	};

	var opts = {
		lines: 13, // The number of lines to draw
		length: 3, // The length of each line
		width: 1, // The line thickness
		radius: 7, // The radius of the inner circle
		corners: 1, // Corner roundness (0..1)
		rotate: 0, // The rotation offset
		color: '#000', // #rgb or #rrggbb
		speed: 1, // Rounds per second
		trail: 60, // Afterglow percentage
		shadow: false, // Whether to render a shadow
		hwaccel: false, // Whether to use hardware acceleration
		className: 'spinner', // The CSS class to assign to the spinner
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		top: 'auto', // Top position relative to parent in px
		left: 'auto' // Left position relative to parent in px
	};

	return {
		serializeForm: serialize,
		getCityAndCountry: getCC,
		showModal: showModal,
		getSpinOpts: function(){
			return opts;
		},
	};
});
