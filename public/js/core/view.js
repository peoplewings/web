define(function(require) {

	var Handlebars = require('handlebars');

	/**************
	 * HANDLEBARS *
	 **************/

	Handlebars.registerHelper('equals', function(value, expected, options) {
		return Handlebars.helpers['if'].call(this, value == expected, options);
	});

	Handlebars.registerHelper('if_contains', function(value, expected, options) {
		return Handlebars.helpers['if'].call(this, value && (value.indexOf(expected) !== -1), options);
	});

	Handlebars.registerHelper('date', function(value, format) {
		var date = typeof value === 'number' ? moment.unix(value) : moment(value);

		if (format === 'from now')
			return date.fromNow();

		return date.format(typeof format === 'string' ? format : 'L')
	});

	Handlebars.registerHelper('enum', function(value, id) {
		if (enums[id])
			return enums[id].fromValue(value);
		else
			return window[id][value];
	});

	var originalEach = Handlebars.helpers['each'];
	Handlebars.registerHelper('each', function(context, options) {
		if (context instanceof Array) {
			context = context.map(function(item, index) {
				return _.extend({}, item, {
					index: index,
					indexPlusOne: index + 1,
					indexMinusOne: index - 1,
					first: index === 0,
					last: index === context.length - 1
				})
			});
		}

		return originalEach.call(this, context, options);
	});

	Handlebars.registerHelper('range', function(start, end, modificator, options) {
		if (arguments.length === 3) {
			options = modificator;
			modificator = 1;
		} else if (arguments.length === 2) {
			options = end;
			modificator = 1;
			end = start;
			start = 1;
		}

		var checker = modificator > 0 ?
			function(a) { return a <= end } :
			function(a) { return a >= end };

		var arr = [];
		for (var i = start; checker(i); i += modificator)
			arr.push(i);

		return Handlebars.helpers['each'].call(this, arr, options);
	});

	/*********
	 * ENUMS *
	 *********/

	function Enum(values) {
		var inverse = _.object(_.values(values), _.keys(values));
		var map = values;

		if (values instanceof Array) {
			var tmp = map;
			map = inverse;
			inverse = tmp;
		}

		map.fromValue = function(value) { return inverse[value] };
		return map;
	}

	var enums = {
		'notification-type': Enum({
			Request: 'requests',
			Invitation: 'invites',
			Message: 'messages'
		}),
		'notification-state': Enum({
			pending: 'P',
			maybe: 'M',
			accepted: 'A',
			denied: 'D',
		}),
	};

	/*****************
	 * VIEW FUNCTION *
	 *****************/

	return function(text, callback) {
		var compiled = Handlebars.compile(text);

		return function(data) {
			if (arguments.length > 1)
				data = _.extend.apply(_, [{}].concat(_.toArray(arguments)));
			return compiled(data || {});
		};
	};
});
