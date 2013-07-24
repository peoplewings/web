//jshint camelcase:false
/*globals Base64, b64_hmac_sha1 */

define(function(require) {
	'use strict';

	var $ = require('jquery');
	var api = require('api');
	var modalTpl = require('tmpl!templates/lib/modal2.html');

	function getCC(addressComponents) {
		var data = {};
		var map = {
			'locality': 'city',
			'country': 'country',
			'administrative_area_level_1': 'region',
		};

		_.each(addressComponents, function(component) {
			_.each(component.types, function(type) {
				data[map[type]] = component.long_name;
			});
		});
		return data;
	}

	function setAutocomplete(autocomplete, container) {
		var place = autocomplete.getPlace();
		if (!place.geometry) return;

		var cc = getCC(place.address_components);
		cc.lat = place.geometry.location.lat() + '';
		cc.lon = place.geometry.location.lng() + '';
		cc.name = cc.city;
		container.city = _.omit(cc, 'city');
	}

	function serialize(form) {
		if (!form) throw new Error();


		var dom = typeof form === 'string' ? $('#' + form) : $(form);
		var selectsAndFields = dom.find('select,textarea,' +
			'input[type=text],input[type=email],input[type=password]');
		var checkboxes = dom.find('input[type=checkbox]');
		var found = selectsAndFields.length + checkboxes.length;
		var result = {};

		selectsAndFields.each(function() {
			var name = this.name;

			if (!(name in result)) {
				result[name] = this.value;
				return;
			}

			if (!_.isArray(result[name])) {
				result[name] = [result[name], this.value];
				return;
			}

			result[name].push(this.value);
		});

		checkboxes.each(function() {
			var name = this.name;
			var value = $(this).is(':checked');

			if (value && this.value !== 'on')
				value = this.value;

			if (!(name in result)) {
				result[name] = value;
				return;
			}

			var old = result[name];
			if (!_.isArray(old)) {
				old = old ? [old] : [];
				result[name] = old;
			}

			if (value)
				old.push(value);
		});

		if (dom.find('select,input,textarea').length !== found)
			throw new Error('not implemented');

		return result;
	}

	var showModal = function(options) {
		var modal = $(modalTpl({
			header: options.header,
			accept: options.accept,
			content: options.content,
			close: options.close || true,
			thinModal: options.thin,
			loadingText: options.loadingText,
			formRel: 'form="' + options.form + '"',
		}));
		$('#main').append(modal);

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

	function uploadAmazon(file, folder, filename) {
		filename = filename || file.name;
		folder = folder ? folder + '/' : '';

		var AWSSecretKeyId = 'BTgUM/6/4QqS5n8jPZl5+lJhjJpvy0wVy668nb75';
		var contentType = 'image/';
		var bucket = 'peoplewings-test-media';
		var acl = 'public-read';
		var key = folder + filename;

		var policyJson = {
			'expiration': '2013-12-12T12:00:00.000Z',
			'conditions': [
				[ 'eq', '$bucket', bucket ],
				[ 'starts-with', '$key', key ],
				{ 'acl': acl },
				{ 'x-amz-meta-filename': filename },
				[ 'starts-with', '$Content-Type', contentType ]
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

		return api.request('POST', '//peoplewings-test-media.s3.amazonaws.com', {}, fd).then(function() {
			return 'https://s3-eu-west-1.amazonaws.com/' + bucket + '/' + key;
		});
	}

	function resetMain(num) {
		$('body').scrollTop(num || 0);
	}

	return {
		serializeForm: serialize,
		showModal: showModal,
		setAutocomplete: setAutocomplete,
		getCityAndCountry: getCC,
		uploadAmazon: uploadAmazon,
		resetMain: resetMain,
	};
});
