define(function(require) {

	var Handlebars = require('handlebars');

	/**************
	 * HANDLEBARS *
	 **************/

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
	

	/*********
	 * ENUMS *
	 *********/

	function createEnum(values) {
		if (values instanceof Array)
			values = _.object(_.values(values), _.keys(values));

		values.fromValue = function(value) {
			var result;
			_.each(this, function(id, key) { if (id === value) result = key });
			return result;
		};

		return values;
	}

	var enums = {
		'notification-type': createEnum({
			Request: 'requests',
			Invitation: 'invites',
			Message: 'messages'
		}),
		
		'civil-states': createEnum({
			SI: "Single",
			EN: "Engaged",
			MA: "Married",
			WI: "Widowed",
			IR: "In a relationship",
			IO: "In an open relationship",
			IC: "It's complicated",
			DI: "Divorced",
			SE: "Separated"
		})
	};

	/*****************
	 * VIEW FUNCTION *
	 *****************/

	return function(text, callback) {
		var compiled;

		return function(data) {
			if (!compiled)
				compiled = Handlebars.compile(text);

			return compiled(data || {});
		};
	};
});
