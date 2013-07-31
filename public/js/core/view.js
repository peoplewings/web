//jshint eqeqeq:false

define(function(require) {

	var _ = require('underscore');
	var Handlebars = require('handlebars');
	var texts = require('tools/texts');

	/**************
	 * HANDLEBARS *
	 **************/

	Handlebars.registerHelper('equals', function(value, expected, options) {
		return Handlebars.helpers['if'].call(this, value == expected, options);
	});

	Handlebars.registerHelper('unless_equals', function(value, expected, options) {
		return Handlebars.helpers.unless.call(this, value == expected, options);
	});

	Handlebars.registerHelper('if_any', function() {
		var args = _.toArray(arguments);
		var options = args.pop();
		var value = args.reduce(function(reduced, actual) {
			return reduced || !!actual;
		}, false);

		return Handlebars.helpers['if'].call(this, value, options);
	});

	Handlebars.registerHelper('if_contains', function(value, expected, options) {
		return Handlebars.helpers['if'].call(this, value && (value.indexOf(expected) !== -1), options);
	});

	Handlebars.registerHelper('unless_contains', function(value, expected, options) {
		return Handlebars.helpers.unless.call(this, value && (value.indexOf(expected) !== -1), options);
	});

	Handlebars.registerHelper('escape', function(text) {
		return new Handlebars.SafeString(text.replace(/\n/g, '<br>'));
	});

	Handlebars.registerHelper('date', function(value, format) {
		var date = typeof value === 'number' ? moment.unix(value) : moment(value);

		if (format === 'from now')
			return date.fromNow();

		return date.format(typeof format === 'string' ? format : 'L');
	});

	Handlebars.registerHelper('format-reply-rate', function(rate) {
		return new Handlebars.SafeString(rate === -1 ? '-' : rate + '%');
	});

	Handlebars.registerHelper('format-reply-time', function(time) {
		var weekMs = moment(0).add('weeks', 1).valueOf();
		var dayMs = moment(0).add('days', 1).valueOf();
		var hourMs = moment(0).add('hours', 1).valueOf();
		var minuteMs = moment(0).add('minutes', 1).valueOf();

		if (time === -1)
			return '-';

		time *= 1000;

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
	});

	var originalEach = Handlebars.helpers.each;
	Handlebars.registerHelper('each', function(context, options) {
		if (context instanceof Array) {
			context = context.map(function(item, index) {
				return _.extend({}, item, {
					self: item,
					index: index,
					indexPlusOne: index + 1,
					indexMinusOne: index - 1,
					first: index === 0,
					last: index === context.length - 1,
					secondLast: index === context.length - 2,
				});
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
		} else {
			modificator = +modificator;
		}

		var checker = modificator > 0 ?
			function(a) { return a <= end; } :
			function(a) { return a >= end; };

		var arr = [];
		for (var i = start; checker(i); i += modificator)
			arr.push(i);

		return Handlebars.helpers.each.call(this, arr, options);
	});

	Handlebars.registerHelper('selected', function(option, value) {
		if (option == value) {
			return new Handlebars.SafeString(' selected');
		} else {
			return '';
		}
	});

	Handlebars.registerHelper('checked', function(option, value) {
		if (option == value) {
			return new Handlebars.SafeString(' checked="checked"');
		} else {
			return '';
		}
	});

	Handlebars.registerHelper('text', texts.resolve);

	Handlebars.registerHelper('subview', function(template, key) {
		if (key) {
			key = key.toLowerCase();
			if (!(key in template))
				throw new Error('Template key --[' + key + ']-- not found into --[' + template + ']--');
			template = template[key];
		}

		var html = template(this);
		return new Handlebars.SafeString(html);
	});


	/*****************
	 * VIEW FUNCTION *
	 *****************/

	function view(text) {
		var compiled = Handlebars.compile(text);

		return function(data) {
			if (arguments.length > 1)
				data = _.extend.apply(_, [{}].concat(_.toArray(arguments)));
			return compiled(data ||   {});
		};
	}

	return view;
});
