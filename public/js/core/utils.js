//jshint camelcase:false

define(function(require) {

	var $ = require('jquery');
	var modalTpl = require('tmpl!templates/lib/modal2.html');

	function getCC(addressComponents){
		var data = {};

		_.each(addressComponents, function(component) {
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

	var setAutocomplete = function(autocomplete) {
		debugger;
		var place = autocomplete.getPlace();
		if (place.geometry) {
			debugger;
			var cc = getCC(place.address_components);
			cc.lat = place.geometry.location.lat() + "";
			cc.lon = place.geometry.location.lng() + "";
			cc.name = cc.city;
			cc = _.omit(cc, "city");
		}
		debugger;
		this.cityObject = cc;
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

	var showModal = function(options) {
		var modal = $(modalTpl({
			header: options.header,
			accept: options.accept,
			content: options.content,
			close: options.close || true,
		}));
		$("body section:last").append(modal);

		modal.modal('show');
		modal.find('.accept-modal-btn').click(options.callback);

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
		showModal: showModal,
		setAutocomplete: setAutocomplete,
		getCityAndCountry: function(addressComponents){
			return getCC(addressComponents);
		},		
		getSpinOpts: function(){
			return opts;
		},
	};
});
