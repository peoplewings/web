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
	}

	var setAutocomplete = function(autocomplete, wing) {
		var place = autocomplete.getPlace();
		if (place.geometry) {
			var cc = getCC(place.address_components);
			cc.lat = place.geometry.location.lat() + "";
			cc.lon = place.geometry.location.lng() + "";
			cc.name = cc.city;
			cc = _.omit(cc, "city");
			wing.city = cc;
		} else
			return;
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
			thinModal: options.thin,
		}));
		$("body section:last").append(modal);

		modal.modal('show');
		var acceptBtn = modal.find('.accept-modal-btn');
		acceptBtn.click(options.callback);

		if (options.form)
			acceptBtn.attr('form', options.form);

		modal.on('hidden', function() {
			modal.remove();
		});

		return modal;
	};

	var weekMs = moment(0).add('weeks', 1).valueOf();
	var dayMs = moment(0).add('days', 1).valueOf();
	var hourMs = moment(0).add('hours', 1).valueOf();
	var minuteMs = moment(0).add('minutes', 1).valueOf();

	function formatReplyTime(time) {
		var weeks = Math.floor(time / weekMs);
		if (weeks > 4) return '+4w';
		if (weeks > 0) return weeks + 'w';

		var days = Math.floor(time / dayMs);
		if (days > 0) return days + 'd';

		var hours = Math.floor(time / hourMs);
		if (hours > 0) return hours + 'h';

		var minutes = Math.floor(time / minuteMs);
		if (minutes > 5) return minutes + 'm';

		return '5m';
	}

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
		getCityAndCountry: getCC,
		formatReplyTime: formatReplyTime,
		getSpinOpts: function(){
			return opts;
		},
	};
});
