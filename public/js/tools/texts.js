define(function() {
	var texts = {

		'yes-no': function(value) {
			return value ? 'Yes' : 'No';
		},

		'notification-type': {
			request: 'Request',
			invite: 'Invitation',
			message: 'Message',
		},

		'notification-state': {
			P: 'pending',
			M: 'maybe',
			A: 'accepted',
			D: 'denied',
		},

		'wing-type': {
			accomodation: 'Accommodation',
			accommodation: 'Accommodation'
		},

		'wing-status': {
			y: 'Yes',
			n: 'No',
			m: 'Maybe'
		},

		civilState: {
			si: 'Single',
			en: 'Engaged',
			ma: 'Married',
			wi: 'Widowed',
			ir: 'In a relationship',
			io: 'In an open relationship',
			ic: 'It\'s complicated',
			di: 'Divorced',
			se: 'Separated'
		},

		smoking: {
			s: 'I smoke',
			d: 'I don\'t smoke, but guests can smoke here',
			n: 'No smoking allowed'
		},

		whereSleepingType: {
			c: 'Common area',
			p: 'Private area',
			s: 'Shared private area'

		},

		bestDays: {
			a: 'Any',
			f: 'From Monday to Friday',
			t: 'From Monday to Thursday',
			w: 'Weekend',
		},

		months: [
			'January',
			'Feburary',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December',
		]
	};

	function resolve(type, code) {
		if (code == null) return '';

		var getter = texts[type];
		if (!getter)
			throw new Error('Unknown text type "' + type + '"');

		var text = typeof getter === 'function' ? getter(code) : getter[code.toLowerCase()];
		if (!text)
			throw new Error('Unknown text code "' + code + '" in type "' + type + '"');

		return text;
	}

	return Object.create(texts, { resolve: { value: resolve }});
});

