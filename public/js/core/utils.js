//jshint camelcase:false
/*globals Base64, b64_hmac_sha1 */

define(function(require) {

	var $ = require('jquery');
	var api = require('api2');
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
			formRel: 'form="' + options.form + '"',
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
		if (time === -1)
			return '-';

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

	function uploadAmazon(file, folder, filename) {
		filename = filename || file.name;
		folder = folder ? folder + '/' : '';

		var AWSSecretKeyId = 'BTgUM/6/4QqS5n8jPZl5+lJhjJpvy0wVy668nb75';
		var contentType = 'image/';
		var bucket = 'peoplewings-test-media';
		var acl = 'public-read';
		var key = folder + filename;

		var policyJson = {
			"expiration": "2013-12-12T12:00:00.000Z",
			"conditions": [
				[ "eq", "$bucket", bucket ],
				[ "starts-with", "$key", key ],
				{ "acl": acl },
				{ "x-amz-meta-filename": filename },
				[ "starts-with", "$Content-Type", contentType ]
			]
		};

		var policy = Base64.encode(JSON.stringify(policyJson));
		var signature = b64_hmac_sha1(AWSSecretKeyId, policy);

		var fd = new FormData();
		fd.append('AWSAccessKeyId', 'AKIAI5TSJI7DYXGRQDYA');
		fd.append('acl', acl);
		fd.append('Policy', policy);
		fd.append('Signature', signature);
		fd.append('Content-Type', contentType);
		fd.append('x-amz-meta-filename', filename);
		fd.append('key', key);
		fd.append('file', file);

		return api.request('POST', 'http://peoplewings-test-media.s3.amazonaws.com', {}, fd).then(function() {
			return 'https://s3-eu-west-1.amazonaws.com/' + bucket + '/' + key;
		});
	}

	return {
		serializeForm: serialize,
		showModal: showModal,
		setAutocomplete: setAutocomplete,
		getCityAndCountry: getCC,
		formatReplyTime: formatReplyTime,
		uploadAmazon: uploadAmazon,
	};
});
